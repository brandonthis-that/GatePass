"""
Views for the gate management API endpoints.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
import json
import logging

from authentication.models import User
from .models import Asset, Vehicle, GateLog, DayScholarStatus
from .serializers import (
    AssetSerializer, AssetCreateSerializer, VehicleSerializer, VehicleCreateSerializer,
    GateLogSerializer, GateLogCreateSerializer, QRVerificationSerializer,
    DayScholarStatusSerializer, VehicleEntrySerializer, DashboardStatsSerializer
)

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# Asset Management Views

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def assets_view(request):
    """
    GET: List user's assets
    POST: Create new asset
    """
    if request.method == 'GET':
        try:
            assets = Asset.objects.filter(user=request.user, is_active=True).order_by('-created_at')
            
            # Apply filters
            asset_type = request.GET.get('type')
            if asset_type:
                assets = assets.filter(asset_type=asset_type)
            
            search = request.GET.get('search')
            if search:
                assets = assets.filter(
                    Q(serial_number__icontains=search) |
                    Q(brand__icontains=search) |
                    Q(model__icontains=search)
                )
            
            paginator = StandardResultsSetPagination()
            result_page = paginator.paginate_queryset(assets, request)
            
            serializer = AssetSerializer(result_page, many=True, context={'request': request})
            
            return paginator.get_paginated_response({
                'success': True,
                'message': 'Assets retrieved successfully',
                'data': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Error retrieving assets: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve assets',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        try:
            serializer = AssetCreateSerializer(data=request.data, context={'request': request})
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'message': 'Invalid asset data',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            asset = serializer.save(user=request.user)
            
            # Return full asset data
            full_serializer = AssetSerializer(asset, context={'request': request})
            
            logger.info(f"Asset created: {asset.serial_number} by {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Asset registered successfully',
                'data': full_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating asset: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to create asset',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def asset_detail_view(request, asset_id):
    """
    GET: Retrieve specific asset
    PUT: Update asset
    DELETE: Delete asset (soft delete)
    """
    try:
        asset = Asset.objects.get(id=asset_id, user=request.user)
        
        if request.method == 'GET':
            serializer = AssetSerializer(asset, context={'request': request})
            return Response({
                'success': True,
                'message': 'Asset retrieved successfully',
                'data': serializer.data
            })
        
        elif request.method == 'PUT':
            serializer = AssetCreateSerializer(asset, data=request.data, context={'request': request})
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'message': 'Invalid asset data',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            asset = serializer.save()
            
            full_serializer = AssetSerializer(asset, context={'request': request})
            
            logger.info(f"Asset updated: {asset.serial_number} by {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Asset updated successfully',
                'data': full_serializer.data
            })
        
        elif request.method == 'DELETE':
            asset.is_active = False
            asset.save()
            
            logger.info(f"Asset deactivated: {asset.serial_number} by {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Asset removed successfully'
            })
            
    except Asset.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Asset not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in asset detail view: {str(e)}")
        return Response({
            'success': False,
            'message': 'Operation failed',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vehicle Management Views

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def vehicles_view(request):
    """
    GET: List user's vehicles
    POST: Create new vehicle
    """
    if request.method == 'GET':
        try:
            vehicles = Vehicle.objects.filter(user=request.user, is_active=True).order_by('-created_at')
            
            # Apply filters
            vehicle_type = request.GET.get('type')
            if vehicle_type:
                vehicles = vehicles.filter(vehicle_type=vehicle_type)
            
            search = request.GET.get('search')
            if search:
                vehicles = vehicles.filter(
                    Q(plate_number__icontains=search) |
                    Q(make__icontains=search) |
                    Q(model__icontains=search)
                )
            
            paginator = StandardResultsSetPagination()
            result_page = paginator.paginate_queryset(vehicles, request)
            
            serializer = VehicleSerializer(result_page, many=True, context={'request': request})
            
            return paginator.get_paginated_response({
                'success': True,
                'message': 'Vehicles retrieved successfully',
                'data': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Error retrieving vehicles: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve vehicles',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        try:
            serializer = VehicleCreateSerializer(data=request.data, context={'request': request})
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'message': 'Invalid vehicle data',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            vehicle = serializer.save(user=request.user)
            
            # Return full vehicle data
            full_serializer = VehicleSerializer(vehicle, context={'request': request})
            
            logger.info(f"Vehicle registered: {vehicle.plate_number} by {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Vehicle registered successfully',
                'data': full_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating vehicle: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to register vehicle',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def vehicle_detail_view(request, vehicle_id):
    """
    GET: Retrieve specific vehicle
    PUT: Update vehicle
    DELETE: Delete vehicle (soft delete)
    """
    try:
        vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
        
        if request.method == 'GET':
            serializer = VehicleSerializer(vehicle, context={'request': request})
            return Response({
                'success': True,
                'message': 'Vehicle retrieved successfully',
                'data': serializer.data
            })
        
        elif request.method == 'PUT':
            serializer = VehicleCreateSerializer(vehicle, data=request.data, context={'request': request})
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'message': 'Invalid vehicle data',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            vehicle = serializer.save()
            
            full_serializer = VehicleSerializer(vehicle, context={'request': request})
            
            logger.info(f"Vehicle updated: {vehicle.plate_number} by {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Vehicle updated successfully',
                'data': full_serializer.data
            })
        
        elif request.method == 'DELETE':
            vehicle.is_active = False
            vehicle.save()
            
            logger.info(f"Vehicle deactivated: {vehicle.plate_number} by {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Vehicle removed successfully'
            })
            
    except Vehicle.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Vehicle not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in vehicle detail view: {str(e)}")
        return Response({
            'success': False,
            'message': 'Operation failed',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# QR Code Verification

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_qr_view(request):
    """
    Verify QR code for asset or vehicle.
    """
    try:
        serializer = QRVerificationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Invalid QR code data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        qr_data = serializer.validated_data['qr_data']
        qr_type = qr_data['type']
        item_id = qr_data['id']
        user_id = qr_data['userId']
        provided_hash = qr_data.get('hash', '')
        
        # Verify based on type
        if qr_type == 'asset':
            try:
                asset = Asset.objects.get(id=item_id, is_active=True)
                
                # Verify hash and user
                if asset.verification_hash != provided_hash:
                    status_result = 'invalid'
                    message = 'Invalid or tampered QR code'
                elif str(asset.user.id) != user_id:
                    status_result = 'invalid'
                    message = 'QR code user mismatch'
                elif asset.is_reported_stolen:
                    status_result = 'stolen'
                    message = 'Asset reported as stolen'
                else:
                    status_result = 'valid'
                    message = 'Asset verified successfully'
                
                # Create gate log
                GateLog.objects.create(
                    log_type='asset_verification',
                    status=status_result,
                    user=asset.user,
                    guard=request.user if request.user.is_security_guard else None,
                    asset=asset,
                    notes=f"QR verification: {message}",
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
                )
                
                return Response({
                    'success': True,
                    'message': message,
                    'data': {
                        'status': status_result,
                        'type': 'asset',
                        'item': AssetSerializer(asset, context={'request': request}).data,
                        'user': asset.user.get_full_name()
                    }
                })
                
            except Asset.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Asset not found',
                    'data': {'status': 'invalid'}
                }, status=status.HTTP_404_NOT_FOUND)
        
        elif qr_type == 'vehicle':
            try:
                vehicle = Vehicle.objects.get(id=item_id, is_active=True)
                
                # Verify hash and user
                if vehicle.verification_hash != provided_hash:
                    status_result = 'invalid'
                    message = 'Invalid or tampered QR code'
                elif str(vehicle.user.id) != user_id:
                    status_result = 'invalid'
                    message = 'QR code user mismatch'
                elif vehicle.is_reported_stolen:
                    status_result = 'stolen'
                    message = 'Vehicle reported as stolen'
                else:
                    status_result = 'valid'
                    message = 'Vehicle verified successfully'
                
                # Create gate log
                GateLog.objects.create(
                    log_type='vehicle_entry',
                    status=status_result,
                    user=vehicle.user,
                    guard=request.user if request.user.is_security_guard else None,
                    vehicle=vehicle,
                    notes=f"QR verification: {message}",
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
                )
                
                return Response({
                    'success': True,
                    'message': message,
                    'data': {
                        'status': status_result,
                        'type': 'vehicle',
                        'item': VehicleSerializer(vehicle, context={'request': request}).data,
                        'user': vehicle.user.get_full_name()
                    }
                })
                
            except Vehicle.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Vehicle not found',
                    'data': {'status': 'invalid'}
                }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        logger.error(f"QR verification error: {str(e)}")
        return Response({
            'success': False,
            'message': 'QR verification failed',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vehicle Entry Logging

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_vehicle_entry_view(request):
    """
    Log vehicle entry by plate number (for guards).
    """
    try:
        if not request.user.is_security_guard and not request.user.is_administrator:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = VehicleEntrySerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Invalid data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        plate_number = serializer.validated_data['plate_number']
        notes = serializer.validated_data.get('notes', '')
        location = serializer.validated_data.get('location', '')
        
        # Check if vehicle is registered
        try:
            vehicle = Vehicle.objects.get(plate_number=plate_number, is_active=True)
            
            if vehicle.is_reported_stolen:
                log_status = 'stolen'
                message = f"Vehicle {plate_number} is reported stolen"
            else:
                log_status = 'valid'
                message = f"Registered vehicle {plate_number} entry logged"
            
            user = vehicle.user
            
        except Vehicle.DoesNotExist:
            vehicle = None
            user = None
            log_status = 'visitor'
            message = f"Unregistered vehicle {plate_number} logged as visitor"
        
        # Create gate log
        gate_log = GateLog.objects.create(
            log_type='vehicle_entry',
            status=log_status,
            user=user,
            guard=request.user,
            vehicle=vehicle,
            notes=notes or message,
            location=location,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
        )
        
        logger.info(f"Vehicle entry logged: {plate_number} by guard {request.user.email}")
        
        return Response({
            'success': True,
            'message': message,
            'data': {
                'status': log_status,
                'plate_number': plate_number,
                'log_id': str(gate_log.id),
                'vehicle': VehicleSerializer(vehicle, context={'request': request}).data if vehicle else None,
                'user': user.get_full_name() if user else None
            }
        })
        
    except Exception as e:
        logger.error(f"Vehicle entry logging error: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to log vehicle entry',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Day Scholar Management

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def day_scholars_view(request):
    """
    Get list of day scholars with their current status.
    """
    try:
        if not request.user.is_security_guard and not request.user.is_administrator:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get all students (day scholars)
        students = User.objects.filter(role='student', is_active=True).order_by('first_name', 'last_name')
        
        # Get or create day scholar status for each
        scholar_statuses = []
        for student in students:
            status_obj, created = DayScholarStatus.objects.get_or_create(user=student)
            scholar_statuses.append(status_obj)
        
        serializer = DayScholarStatusSerializer(scholar_statuses, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'message': 'Day scholars retrieved successfully',
            'data': serializer.data
        })
        
    except Exception as e:
        logger.error(f"Error retrieving day scholars: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to retrieve day scholars',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_scholar_status_view(request, user_id):
    """
    Toggle day scholar check-in/check-out status.
    """
    try:
        if not request.user.is_security_guard and not request.user.is_administrator:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            student = User.objects.get(id=user_id, role='student', is_active=True)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Student not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get or create day scholar status
        status_obj, created = DayScholarStatus.objects.get_or_create(user=student)
        
        # Toggle status
        if status_obj.status == 'out':
            status_obj.check_in(guard=request.user)
            action = 'checked in'
        else:
            status_obj.check_out(guard=request.user)
            action = 'checked out'
        
        logger.info(f"Day scholar {student.email} {action} by guard {request.user.email}")
        
        serializer = DayScholarStatusSerializer(status_obj, context={'request': request})
        
        return Response({
            'success': True,
            'message': f"{student.get_full_name()} {action} successfully",
            'data': serializer.data
        })
        
    except Exception as e:
        logger.error(f"Error toggling scholar status: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to update status',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Dashboard and Statistics

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats_view(request):
    """
    Get dashboard statistics for admin/guard interface.
    """
    try:
        if not request.user.is_administrator and not request.user.is_security_guard:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get today's date
        today = timezone.now().date()
        
        # Calculate statistics
        stats = {
            'total_users': User.objects.filter(is_active=True).count(),
            'total_assets': Asset.objects.filter(is_active=True).count(),
            'total_vehicles': Vehicle.objects.filter(is_active=True).count(),
            'today_logs': GateLog.objects.filter(timestamp__date=today).count(),
            'active_guards': User.objects.filter(role='guard', is_active=True).count(),
            'day_scholars_in': DayScholarStatus.objects.filter(status='in').count(),
            'recent_alerts': GateLog.objects.filter(
                timestamp__gte=timezone.now() - timedelta(hours=24),
                status__in=['invalid', 'stolen']
            ).count()
        }
        
        serializer = DashboardStatsSerializer(stats)
        
        return Response({
            'success': True,
            'message': 'Dashboard statistics retrieved successfully',
            'data': serializer.data
        })
        
    except Exception as e:
        logger.error(f"Error retrieving dashboard stats: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to retrieve statistics',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Gate Logs

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gate_logs_view(request):
    """
    Get gate logs with filtering options.
    """
    try:
        if not request.user.is_administrator and not request.user.is_security_guard:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        logs = GateLog.objects.all().order_by('-timestamp')
        
        # Apply filters
        log_type = request.GET.get('type')
        if log_type:
            logs = logs.filter(log_type=log_type)
        
        log_status = request.GET.get('status')
        if log_status:
            logs = logs.filter(status=log_status)
        
        guard_id = request.GET.get('guard')
        if guard_id:
            logs = logs.filter(guard_id=guard_id)
        
        # Date range filtering
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        if start_date:
            try:
                start_date_parsed = datetime.strptime(start_date, '%Y-%m-%d').date()
                logs = logs.filter(timestamp__date__gte=start_date_parsed)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date_parsed = datetime.strptime(end_date, '%Y-%m-%d').date()
                logs = logs.filter(timestamp__date__lte=end_date_parsed)
            except ValueError:
                pass
        
        paginator = StandardResultsSetPagination()
        result_page = paginator.paginate_queryset(logs, request)
        
        serializer = GateLogSerializer(result_page, many=True, context={'request': request})
        
        return paginator.get_paginated_response({
            'success': True,
            'message': 'Gate logs retrieved successfully',
            'data': serializer.data
        })
        
    except Exception as e:
        logger.error(f"Error retrieving gate logs: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to retrieve gate logs',
            'errors': [str(e)]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
