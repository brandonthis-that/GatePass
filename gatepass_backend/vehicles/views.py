from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from users.permissions import IsAdmin, IsGuard, IsStudent

from .models import Vehicle
from .serializers import VehicleSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    """
    Students register and manage their own vehicles.
    Guards can look up any vehicle by plate number.
    """

    serializer_class = VehicleSerializer

    def get_permissions(self):
        if self.action == "lookup":
            return [IsGuard() | IsAdmin()]
        return [IsStudent() | IsGuard() | IsAdmin()]

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return Vehicle.objects.filter(owner=user)
        return Vehicle.objects.select_related("owner").all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"], url_path="lookup")
    def lookup(self, request):
        """GET /api/vehicles/lookup/?plate=KDA123X"""
        plate = request.query_params.get("plate", "").strip().upper()
        if not plate:
            return Response({"error": "plate query param is required"}, status=400)
        try:
            vehicle = Vehicle.objects.select_related("owner").get(
                plate_number__iexact=plate
            )
            return Response(
                {"status": "REGISTERED", "vehicle": VehicleSerializer(vehicle).data}
            )
        except Vehicle.DoesNotExist:
            return Response({"status": "NOT_FOUND", "plate_number": plate}, status=404)
