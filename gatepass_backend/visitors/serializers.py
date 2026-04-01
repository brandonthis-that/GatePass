from rest_framework import serializers
import re
from .models import Visitor, VisitorConfirmation


class VisitorConfirmationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorConfirmation
        fields = [
            "id",
            "confirmation_type",
            "confirmed_by",
            "confirmed_at",
            "notes",
            "verification_code",
        ]
        read_only_fields = ["id", "confirmed_at"]


KENYAN_PHONE_RE = re.compile(r'^(\+254|0)[17]\d{8}$')


class VisitorSerializer(serializers.ModelSerializer):
    guard_name = serializers.CharField(source="guard.get_full_name", read_only=True)
    confirmations = VisitorConfirmationSerializer(many=True, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    qr_code_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Visitor
        fields = [
            "id",
            "name",
            "national_id",
            "phone",
            "email",
            "organization",
            "purpose_category",
            "purpose_details",
            "host_name",
            "host_email",
            "host_phone",
            "department",
            "office_location",
            "expected_duration",
            "scheduled_time",
            "entry_time",
            "exit_time",
            "expected_end_time",
            "status",
            "qr_token",
            "qr_code",
            "guard_name",
            "confirmations",
            "is_overdue",
            "qr_code_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["entry_time", "guard", "qr_token", "expected_end_time", "created_at", "updated_at"]
    
    def get_qr_code_url(self, obj):
        return f"/api/visitors/verify/?token={obj.qr_token}"

    def validate_national_id(self, value):
        """Kenyan National IDs are exactly 8 digits."""
        value = value.strip()
        if not re.match(r'^\d{8}$', value):
            raise serializers.ValidationError(
                "National ID must be exactly 8 digits (numbers only)."
            )
        return value

    def validate_phone(self, value):
        """Optional but if provided must be a valid Kenyan number."""
        if value:
            value = value.strip()
            if not KENYAN_PHONE_RE.match(value):
                raise serializers.ValidationError(
                    "Enter a valid Kenyan phone number (e.g. +254712345678 or 0712345678)."
                )
        return value

    def validate_host_phone(self, value):
        if value:
            value = value.strip()
            if not KENYAN_PHONE_RE.match(value):
                raise serializers.ValidationError(
                    "Enter a valid Kenyan host phone number (e.g. +254712345678 or 0712345678)."
                )
        return value

    def validate_purpose_details(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Purpose details must be at least 10 characters.")
        return value

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Visitor name must be at least 3 characters.")
        return value

    def validate_host_name(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Host name must be at least 3 characters.")
        return value
