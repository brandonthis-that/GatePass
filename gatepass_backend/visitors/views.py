from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from users.permissions import IsAdmin, IsGuard
from gate_logs.models import GateLog
import random
import string

from .models import Visitor, VisitorConfirmation
from .serializers import VisitorSerializer, VisitorConfirmationSerializer


class VisitorViewSet(viewsets.ModelViewSet):
    """
    Enhanced visitor management with host confirmation workflow.
    GET  /api/visitors/              → list all visitors (guards/admins)
    POST /api/visitors/              → log new visitor entry (guard)
    POST /api/visitors/{id}/sign-out/ → record exit time (guard)
    POST /api/visitors/{id}/confirm/  → add host confirmation (guard/host)
    POST /api/visitors/{id}/approve/  → approve visitor (guard)
    POST /api/visitors/{id}/deny/     → deny visitor (guard)
    GET  /api/visitors/verify/        → verify visitor by QR token
    """

    serializer_class = VisitorSerializer
    permission_classes = [IsGuard | IsAdmin]

    def get_queryset(self):
        return Visitor.objects.select_related("guard").prefetch_related("confirmations").order_by("-entry_time")

    def perform_create(self, serializer):
        # Automatically create gate log entry
        visitor = serializer.save(guard=self.request.user)
        
        # Create initial gate log
        GateLog.objects.create(
            guard=self.request.user,
            log_type="VISITOR_ENTRY",
            is_visitor=True,
            notes=f"Visitor: {visitor.name} to see {visitor.host_name}"
        )

    @action(detail=True, methods=["post"], url_path="sign-out")
    def sign_out(self, request, pk=None):
        visitor = self.get_object()
        if visitor.exit_time:
            return Response({"error": "Visitor has already signed out."}, status=400)
        
        visitor.exit_time = timezone.now()
        visitor.status = 'COMPLETED'
        visitor.save(update_fields=["exit_time", "status"])
        
        # Add confirmation that visitor left
        VisitorConfirmation.objects.create(
            visitor=visitor,
            confirmation_type='MEETING_END',
            confirmed_by=request.user.get_full_name() or request.user.username,
            notes='Visitor signed out at gate'
        )
        
        return Response(VisitorSerializer(visitor).data)
    
    @action(detail=True, methods=["post"], url_path="confirm")
    def add_confirmation(self, request, pk=None):
        """
        Add host confirmation for a visitor
        """
        visitor = self.get_object()
        serializer = VisitorConfirmationSerializer(data=request.data)
        
        if serializer.is_valid():
            confirmation = serializer.save(visitor=visitor)
            
            # Update visitor status based on confirmation type
            if confirmation.confirmation_type == 'EXPECTED':
                visitor.status = 'APPROVED'
            elif confirmation.confirmation_type == 'ARRIVED':
                visitor.status = 'IN_MEETING'
            elif confirmation.confirmation_type == 'MEETING_END':
                visitor.status = 'COMPLETED'
            elif confirmation.confirmation_type in ['NO_SHOW', 'DENIED']:
                visitor.status = 'DENIED'
            
            visitor.save(update_fields=['status'])
            return Response(VisitorConfirmationSerializer(confirmation).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=["post"], url_path="approve")
    def approve_visitor(self, request, pk=None):
        """
        Manually approve a visitor (guard decision)
        """
        visitor = self.get_object()
        visitor.status = 'APPROVED'
        visitor.save(update_fields=['status'])
        
        # Add confirmation
        VisitorConfirmation.objects.create(
            visitor=visitor,
            confirmation_type='EXPECTED',
            confirmed_by=request.user.get_full_name() or request.user.username,
            notes='Approved by guard without host confirmation'
        )
        
        return Response(VisitorSerializer(visitor).data)
    
    @action(detail=True, methods=["post"], url_path="deny")
    def deny_visitor(self, request, pk=None):
        """
        Deny a visitor entry
        """
        visitor = self.get_object()
        visitor.status = 'DENIED'
        visitor.save(update_fields=['status'])
        
        # Add confirmation
        VisitorConfirmation.objects.create(
            visitor=visitor,
            confirmation_type='DENIED',
            confirmed_by=request.user.get_full_name() or request.user.username,
            notes=request.data.get('notes', 'Denied by guard')
        )
        
        return Response(VisitorSerializer(visitor).data)
    
    @action(detail=False, methods=["get"], url_path="verify")
    def verify_by_token(self, request):
        """
        Verify visitor by QR token (similar to asset verification)
        """
        token = request.query_params.get("token")
        if not token:
            return Response({"error": "token query param is required"}, status=400)
        
        try:
            visitor = Visitor.objects.select_related("guard").get(qr_token=token)
            return Response({
                "status": "VALID", 
                "visitor": VisitorSerializer(visitor).data
            })
        except Visitor.DoesNotExist:
            return Response({"status": "INVALID"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=["get"], url_path="pending")
    def pending_visitors(self, request):
        """
        Get visitors pending host confirmation
        """
        pending = self.get_queryset().filter(status='PENDING')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"], url_path="overdue")
    def overdue_visitors(self, request):
        """
        Get visitors who have exceeded their expected duration
        """
        now = timezone.now()
        overdue = self.get_queryset().filter(
            expected_end_time__lt=now,
            exit_time__isnull=True,
            status__in=['APPROVED', 'CHECKED_IN', 'IN_MEETING']
        )
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)
