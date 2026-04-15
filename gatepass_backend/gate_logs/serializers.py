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
