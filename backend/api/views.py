from rest_framework import generics, viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from core.models import StudentProfile, Asset, Vehicle, GateLog
from .serializers import (
    UserSerializer, RegisterSerializer, StudentProfileSerializer,
    AssetSerializer, AssetCreateSerializer, VehicleSerializer, 
    VehicleCreateSerializer, GateLogSerializer, AssetVerifySerializer,
    VehicleLogSerializer, ScholarLogSerializer
)


class RegisterView(generics.CreateAPIView):
    """Register a new student user"""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class CurrentUserView(generics.RetrieveAPIView):
    """Get current authenticated user"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class StudentProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current student's profile"""
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return get_object_or_404(StudentProfile, user=self.request.user)


class AssetViewSet(viewsets.ModelViewSet):
    """ViewSet for managing student assets"""
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Students see only their assets, guards/admins see all
        if self.request.user.groups.filter(name='Guard').exists() or self.request.user.is_staff:
            return Asset.objects.all()
        return Asset.objects.filter(owner__user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AssetCreateSerializer
        return AssetSerializer
    
    def perform_create(self, serializer):
        # Set owner to current student
        student_profile = get_object_or_404(StudentProfile, user=self.request.user)
        serializer.save(owner=student_profile)
    
    @action(detail=True, methods=['get'], url_path='qr')
    def get_qr_code(self, request, pk=None):
        """Get QR code image for an asset"""
        asset = self.get_object()
        if asset.qr_code:
            return HttpResponse(asset.qr_code.read(), content_type='image/png')
        return Response({'error': 'QR code not generated yet'}, status=status.HTTP_404_NOT_FOUND)


class VehicleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing student vehicles"""
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Students see only their vehicles, guards/admins see all
        if self.request.user.groups.filter(name='Guard').exists() or self.request.user.is_staff:
            return Vehicle.objects.all()
        return Vehicle.objects.filter(owner__user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VehicleCreateSerializer
        return VehicleSerializer
    
    def perform_create(self, serializer):
        # Set owner to current student
        student_profile = get_object_or_404(StudentProfile, user=self.request.user)
        serializer.save(owner=student_profile)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_asset(request, asset_id):
    """Verify an asset by ID (Guard function)"""
    try:
        asset = Asset.objects.select_related('owner').get(id=asset_id)
        
        # Log the verification
        GateLog.objects.create(
            guard=request.user,
            log_type='ASSET_VERIFY',
            student=asset.owner,
            notes=f"Asset verified: {asset.serial_number}"
        )
        
        serializer = AssetVerifySerializer({
            'match': True,
            'message': f'Asset verified for {asset.owner.full_name}',
            'asset': AssetSerializer(asset, context={'request': request}).data,
            'owner': StudentProfileSerializer(asset.owner).data
        })
        
        return Response(serializer.data)
        
    except Asset.DoesNotExist:
        return Response({
            'match': False,
            'message': 'Asset not found in system'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_vehicle(request):
    """Log vehicle entry or exit (Guard function)"""
    serializer = VehicleLogSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    plate_number = serializer.validated_data['plate_number'].upper()
    direction = serializer.validated_data['direction']
    notes = serializer.validated_data.get('notes', '')
    
    try:
        vehicle = Vehicle.objects.select_related('owner').get(plate_number=plate_number)
        student = vehicle.owner
        log_type = 'VEHICLE_IN' if direction == 'in' else 'VEHICLE_OUT'
        
        log = GateLog.objects.create(
            guard=request.user,
            log_type=log_type,
            student=student,
            vehicle=vehicle,
            notes=notes or f"Vehicle {direction}"
        )
        
        return Response({
            'success': True,
            'message': f'Vehicle logged: {direction.upper()}',
            'vehicle': VehicleSerializer(vehicle).data,
            'owner': StudentProfileSerializer(student).data if student else None,
            'log': GateLogSerializer(log).data
        })
        
    except Vehicle.DoesNotExist:
        # Log unregistered vehicle
        log = GateLog.objects.create(
            guard=request.user,
            log_type='VEHICLE_IN' if direction == 'in' else 'VEHICLE_OUT',
            notes=f"Unregistered vehicle: {plate_number}. {notes}"
        )
        
        return Response({
            'success': True,
            'message': 'Unregistered vehicle logged',
            'vehicle': {'plate_number': plate_number},
            'owner': None,
            'log': GateLogSerializer(log).data
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_day_scholars(request):
    """List all day scholars with their current status (Guard function)"""
    scholars = StudentProfile.objects.filter(is_day_scholar=True).select_related('user')
    serializer = StudentProfileSerializer(scholars, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_scholar(request, scholar_id):
    """Sign a day scholar in or out (Guard function)"""
    serializer = ScholarLogSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    action = serializer.validated_data['action']
    notes = serializer.validated_data.get('notes', '')
    
    try:
        scholar = StudentProfile.objects.get(id=scholar_id, is_day_scholar=True)
        
        # Update scholar status
        if action == 'in':
            scholar.status = 'ON_CAMPUS'
            log_type = 'SCHOLAR_IN'
        else:
            scholar.status = 'OFF_CAMPUS'
            log_type = 'SCHOLAR_OUT'
        
        scholar.save()
        
        # Create log entry
        log = GateLog.objects.create(
            guard=request.user,
            log_type=log_type,
            student=scholar,
            notes=notes or f"Scholar signed {action}"
        )
        
        return Response({
            'success': True,
            'message': f'Scholar signed {action}',
            'scholar': StudentProfileSerializer(scholar).data,
            'log': GateLogSerializer(log).data
        })
        
    except StudentProfile.DoesNotExist:
        return Response({
            'error': 'Day scholar not found'
        }, status=status.HTTP_404_NOT_FOUND)


class GateLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing gate logs (Admin/Guard function)"""
    serializer_class = GateLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = GateLog.objects.all().select_related('guard', 'student', 'vehicle')
        
        # Filter by log type if specified
        log_type = self.request.query_params.get('log_type', None)
        if log_type:
            queryset = queryset.filter(log_type=log_type)
        
        # Filter by date if specified
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(timestamp__date=date)
        
        return queryset.order_by('-timestamp')

