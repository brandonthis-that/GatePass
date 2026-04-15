from rest_framework import serializers
import bleach

from .models import Asset

def sanitize_text(value):
    if value:
        # Strip all HTML tags
        return bleach.clean(value, tags=[], attributes={}, strip=True)
    return value

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

    def validate_asset_type(self, value):
        value = sanitize_text(value)
        if len(value) < 1:
            raise serializers.ValidationError("Asset type is required.")
        return value

    def validate_serial_number(self, value):
        value = sanitize_text(value).upper().strip()
        if len(value) < 3:
            raise serializers.ValidationError("Serial number must be at least 3 characters.")
        return value

    def validate_model_name(self, value):
        value = sanitize_text(value).strip()
        if len(value) < 2:
            raise serializers.ValidationError("Model name requires at least 2 characters.")
        return value
