from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from users.permissions import IsAdmin, IsGuard

from .models import Visitor
from .serializers import VisitorSerializer


class VisitorViewSet(viewsets.ModelViewSet):
    """
    Guards log visitor entries and sign them out.
    GET  /api/visitors/              → list all visitors (guards/admins)
    POST /api/visitors/              → log new visitor entry (guard)
    POST /api/visitors/{id}/sign-out/ → record exit time (guard)
    """

    serializer_class = VisitorSerializer
    permission_classes = [IsGuard | IsAdmin]

    def get_queryset(self):
        return Visitor.objects.select_related("guard").order_by("-entry_time")

    def perform_create(self, serializer):
        serializer.save(guard=self.request.user)

    @action(detail=True, methods=["post"], url_path="sign-out")
    def sign_out(self, request, pk=None):
        visitor = self.get_object()
        if visitor.exit_time:
            return Response({"error": "Visitor has already signed out."}, status=400)
        visitor.exit_time = timezone.now()
        visitor.save(update_fields=["exit_time"])
        return Response(VisitorSerializer(visitor).data)
