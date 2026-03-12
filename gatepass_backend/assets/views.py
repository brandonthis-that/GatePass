from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.permissions import IsAdmin, IsGuard

from .models import Asset
from .serializers import AssetSerializer


class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer

    def get_permissions(self):
        if self.action == "verify_by_token":
            return [(IsGuard | IsAdmin)()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return Asset.objects.filter(owner=user)
        return Asset.objects.select_related("owner").all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"], url_path="verify")
    def verify_by_token(self, request):
        token = request.query_params.get("token")
        if not token:
            return Response({"error": "token query param is required"}, status=400)
        try:
            asset = Asset.objects.select_related("owner").get(qr_token=token)
            return Response({"status": "VALID", "asset": AssetSerializer(asset).data})
        except Asset.DoesNotExist:
            return Response({"status": "INVALID"}, status=status.HTTP_404_NOT_FOUND)
