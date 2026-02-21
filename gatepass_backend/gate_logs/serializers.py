from rest_framework import serializers

from .models import GateLog


class GateLogSerializer(serializers.ModelSerializer):
    guard_name = serializers.CharField(source="guard.get_full_name", read_only=True)

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
            "plate_number_raw",
            "is_visitor",
        ]
        read_only_fields = ["timestamp", "guard"]
