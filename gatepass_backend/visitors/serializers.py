import bleach
import phonenumbers
import re
from rest_framework import serializers
from phonenumbers.phonenumberutil import NumberParseException
from .models import Visitor, VisitorConfirmation


def sanitize_text(value):
    """Utility to clean up text input using bleach."""
    if value and isinstance(value, str):
        return bleach.clean(value.strip(), tags=[], attributes={}, strip=True)
    return value

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
        
    def validate_notes(self, value):
        return sanitize_text(value)


class VisitorSerializer(serializers.ModelSerializer):
    guard_name = serializers.CharField(source="guard.get_full_name", read_only=True)
    confirmations = VisitorConfirmationSerializer(many=True, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    qr_code_url = serializers.SerializerMethodField()
    phone_country = serializers.CharField(write_only=True, required=False, allow_blank=True)
    host_phone_country = serializers.CharField(write_only=True, required=False, allow_blank=True)
    document_type = serializers.ChoiceField(
        choices=["KENYA_NATIONAL_ID", "PASSPORT", "FOREIGN_ID"],
        write_only=True,
        required=False,
        default="FOREIGN_ID",
    )

    COUNTRY_DIAL_TO_ISO = {
        "+254": "KE",
        "+256": "UG",
        "+255": "TZ",
        "+1": "US",
        "+44": "GB",
    }
    
    class Meta:
        model = Visitor
        fields = [
            "id",
            "name",
            "national_id",
            "document_type",
            "phone",
            "phone_country",
            "email",
            "organization",
            "purpose_category",
            "purpose_details",
            "host_name",
            "host_email",
            "host_phone",
            "host_phone_country",
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

    def _normalize_document_id(self, value, document_type):
        value = sanitize_text(value)
        normalized = value.upper().strip()
        if len(normalized) < 5 or len(normalized) > 20:
            raise serializers.ValidationError(
                {"national_id": "Document number must be between 5 and 20 characters."}
            )

        if document_type == "KENYA_NATIONAL_ID":
            if not re.match(r"^\d{7,8}$", normalized):
                raise serializers.ValidationError(
                    {"national_id": "Kenyan National ID must be 7 or 8 digits."}
                )
        elif document_type == "PASSPORT":
            if not re.match(r"^[A-Z0-9]{6,9}$", normalized):
                raise serializers.ValidationError(
                    {"national_id": "Passport number must be 6-9 letters/digits (no spaces)."}
                )
        else:  # FOREIGN_ID
            if not re.match(r"^[A-Z0-9-]{5,20}$", normalized):
                raise serializers.ValidationError(
                    {"national_id": "Foreign ID must be 5-20 letters/digits (hyphen allowed)."}
                )

        return normalized

    def _normalize_phone(self, value, dial_code, field_name):
        if not value:
            return value

        value = sanitize_text(value)
        region = self.COUNTRY_DIAL_TO_ISO.get(dial_code)
        if not region:
            raise serializers.ValidationError(
                {field_name: "Select a supported country code for this number."}
            )

        try:
            parsed = phonenumbers.parse(value, region)
        except NumberParseException:
            raise serializers.ValidationError(
                {field_name: "Enter a valid phone number format."}
            )

        if not phonenumbers.is_valid_number_for_region(parsed, region):
            raise serializers.ValidationError(
                {field_name: "Enter a valid number for the selected country."}
            )

        return phonenumbers.format_number(
            parsed,
            phonenumbers.PhoneNumberFormat.E164,
        )

    def validate(self, attrs):
        attrs = super().validate(attrs)
        document_type = attrs.pop("document_type", "FOREIGN_ID")
        phone_country = attrs.pop("phone_country", "")
        host_phone_country = attrs.pop("host_phone_country", "")

        attrs["national_id"] = self._normalize_document_id(
            attrs.get("national_id", ""),
            document_type,
        )

        if attrs.get("phone"):
            attrs["phone"] = self._normalize_phone(attrs["phone"], phone_country, "phone")
        if attrs.get("host_phone"):
            attrs["host_phone"] = self._normalize_phone(
                attrs["host_phone"], host_phone_country, "host_phone"
            )
        return attrs

    def validate_purpose_details(self, value):
        value = sanitize_text(value)
        if len(value) < 10:
            raise serializers.ValidationError("Purpose details must be at least 10 characters.")
        return value

    def validate_name(self, value):
        value = sanitize_text(value)
        if len(value) < 3:
            raise serializers.ValidationError("Visitor name must be at least 3 characters.")
        return value

    def validate_host_name(self, value):
        value = sanitize_text(value)
        if len(value) < 3:
            raise serializers.ValidationError("Host name must be at least 3 characters.")
        return value
        
    def validate_organization(self, value):
        return sanitize_text(value)
        
    def validate_department(self, value):
        return sanitize_text(value)
        
    def validate_office_location(self, value):
        return sanitize_text(value)
