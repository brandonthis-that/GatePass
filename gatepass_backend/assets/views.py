# assets/views.py
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Asset
from .serializers import AssetSerializer


class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return Asset.objects.filter(owner=user)
        return Asset.objects.all()  # Guards/Admins see all

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"], url_path="verify/(?P<token>[^/.]+)")
    def verify_by_token(self, request, token=None):
        """Guard scans QR code - this is the key endpoint."""
        try:
            asset = Asset.objects.select_related("owner").get(qr_token=token)
            return Response(
                {
                    "status": "VALID",
                    "asset": AssetSerializer(asset).data,
                }
            )
        except Asset.DoesNotExist:
            return Response({"status": "INVALID"}, status=status.HTTP_404_NOT_FOUND)
