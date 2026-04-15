from rest_framework import serializers

from .models import GateLog


class GateLogSerializer(serializers.ModelSerializer):
    guard_name = serializers.CharField(source="guard.get_full_name", read_only=True)
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    plate_number = serializers.CharField(source="vehicle.plate_number", read_only=True)
    asset_type = serializers.CharField(source="asset.asset_type", read_only=True)
    asset_serial = serializers.CharField(source="asset.serial_number", read_only=True)

    class Meta:
        model = GateLog
        fields = [
            "id",
            "log_type",
            "timestamp",
            "notes",
            "guard",
            "guard_name",
            "vehicle",
            "asset",
            "student",
            "student_name",
            "plate_number",
            "asset_type",
            "asset_serial",
            "plate_number_raw",
            "is_visitor",
            "driver_name",
            "declared_items",
        ]
        read_only_fields = ["timestamp", "guard"]

    def validate(self, attrs):
        log_type = attrs.get("log_type")
        vehicle = attrs.get("vehicle")
        plate_number_raw = (attrs.get("plate_number_raw") or "").strip().upper()

        if log_type != "VEHICLE_ENTRY":
            return attrs

        last_log = None
        if vehicle:
            last_log = (
                GateLog.objects.filter(vehicle=vehicle)
                .order_by("-timestamp")
                .first()
            )
        elif plate_number_raw:
            last_log = (
                GateLog.objects.filter(plate_number_raw__iexact=plate_number_raw)
                .order_by("-timestamp")
                .first()
            )
            attrs["plate_number_raw"] = plate_number_raw

        if last_log and last_log.log_type == "VEHICLE_ENTRY":
            raise serializers.ValidationError(
                {
                    "log_type": (
                        "This vehicle is already logged IN (last entry at "
                        f"{last_log.timestamp:%Y-%m-%d %H:%M:%S}). "
                        "Log an exit first before adding another entry."
                    )
                }
            )

        return attrs
