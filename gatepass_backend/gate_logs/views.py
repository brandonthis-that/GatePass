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
        return [(IsGuard | IsAdmin)()]

    def _apply_filters(self, queryset):
        date_value = self.request.query_params.get("date")
        log_type = self.request.query_params.get("log_type")
        guard_id = self.request.query_params.get("guard")

        if date_value:
            queryset = queryset.filter(timestamp__date=date_value)
        if log_type:
            queryset = queryset.filter(log_type=log_type)
        if guard_id:
            queryset = queryset.filter(guard_id=guard_id)
        return queryset

    def get_queryset(self):
        user = self.request.user
        qs = GateLog.objects.select_related("guard", "vehicle", "asset", "student")
        if user.role == "guard":
            qs = qs.filter(guard=user)
        qs = self._apply_filters(qs)
        return qs.order_by("-timestamp")

    def perform_create(self, serializer):
        serializer.save(guard=self.request.user)

    @action(detail=False, methods=["get"], url_path="reports")
    def reports(self, request):
        """GET /api/gate-logs/reports/ — admin-only activity summary."""
        filtered_qs = self._apply_filters(
            GateLog.objects.select_related("guard", "vehicle", "asset", "student")
        )
        counts = (
            filtered_qs.values("log_type")
            .annotate(count=Count("id"))
            .order_by("log_type")
        )
        total = filtered_qs.count()
        return Response(
            {
                "total_events": total,
                "breakdown": list(counts),
            }
        )
