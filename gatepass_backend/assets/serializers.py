from rest_framework import serializers

from .models import Asset


class AssetSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    owner_photo = serializers.ImageField(source="owner.photo", read_only=True)

    class Meta:
        model = Asset
        fields = [
            "id",
            "asset_type",
            "serial_number",
            "model_name",
            "qr_code",
            "qr_token",
            "owner_name",
            "owner_photo",
            "registered_at",
        ]
        read_only_fields = ["qr_code", "qr_token", "registered_at"]
