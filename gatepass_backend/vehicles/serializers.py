from rest_framework import serializers
import re
import bleach

from .models import Vehicle

def sanitize_text(value):
    if value:
        return bleach.clean(value, tags=[], attributes={}, strip=True)
    return value

class VehicleSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    owner_student_id = serializers.CharField(source="owner.student_id", read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "plate_number",
            "make",
            "model",
            "color",
            "owner_name",
            "owner_student_id",
            "registered_at",
        ]
        read_only_fields = ["registered_at"]

    def validate_plate_number(self, value):
        """Enforce Kenyan plate format, e.g. KCA 123A or KCB 1234."""
        value = sanitize_text(value)
        normalized = value.upper().strip()
        pattern = re.compile(r'^[A-Z]{2,3}\s?\d{3,4}[A-Z]?$')
        if not pattern.match(normalized):
            raise serializers.ValidationError(
                "Invalid plate format (e.g., KCA 123A)"
            )
        if len(normalized) < 6 or len(normalized) > 10:
            raise serializers.ValidationError("Plate number must be between 6 and 10 characters.")
        return normalized

    def validate_make(self, value):
        value = sanitize_text(value).strip()
        if len(value) < 2:
            raise serializers.ValidationError("Vehicle make must be at least 2 characters.")
        return value

    def validate_model(self, value):
        value = sanitize_text(value).strip()
        if len(value) < 2:
            raise serializers.ValidationError("Vehicle model must be at least 2 characters.")
        return value

    def validate_color(self, value):
        value = sanitize_text(value).strip()
        if len(value) < 2:
            raise serializers.ValidationError("Color must be at least 2 characters.")
        return value
