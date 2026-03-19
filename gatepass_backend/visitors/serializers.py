from rest_framework import serializers
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
        # We could generate QR codes for visitor tracking similar to assets
        # For now, return the token that could be used to generate QR codes
        return f"/api/visitors/verify/?token={obj.qr_token}"
