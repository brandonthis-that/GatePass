from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from users.permissions import IsAdmin, IsGuard

from .models import GateLog
from .serializers import GateLogSerializer


class GateLogViewSet(viewsets.ModelViewSet):
    """
    Guards create gate log entries; admins can view all and get reports.
    GET  /api/gate-logs/      → list logs (guards see own, admins see all)
    POST /api/gate-logs/      → create a log entry (guards)
    GET  /api/gate-logs/reports/ → summary counts by log type (admins only)
    """

    serializer_class = GateLogSerializer
    http_method_names = ["get", "post", "head", "options"]  # No edits/deletes via API

    def get_permissions(self):
        if self.action == "reports":
            return [IsAdmin()]
        return [IsGuard() | IsAdmin()]

    def get_queryset(self):
        user = self.request.user
        qs = GateLog.objects.select_related("guard", "vehicle", "asset", "student")
        if user.role == "guard":
            return qs.filter(guard=user).order_by("-timestamp")
        return qs.order_by("-timestamp")

    def perform_create(self, serializer):
        serializer.save(guard=self.request.user)

    @action(detail=False, methods=["get"], url_path="reports")
    def reports(self, request):
        """GET /api/gate-logs/reports/ — admin-only activity summary."""
        counts = (
            GateLog.objects.values("log_type")
            .annotate(count=Count("id"))
            .order_by("log_type")
        )
        total = GateLog.objects.count()
        return Response(
            {
                "total_events": total,
                "breakdown": list(counts),
            }
        )
