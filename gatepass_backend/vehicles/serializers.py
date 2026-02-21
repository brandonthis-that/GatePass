from rest_framework import serializers

from .models import Vehicle


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
