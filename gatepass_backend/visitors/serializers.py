from rest_framework import serializers

from .models import Visitor


class VisitorSerializer(serializers.ModelSerializer):
    guard_name = serializers.CharField(source="guard.get_full_name", read_only=True)

    class Meta:
        model = Visitor
        fields = [
            "id",
            "name",
            "national_id",
            "purpose",
            "host_name",
            "entry_time",
            "exit_time",
            "guard",
            "guard_name",
        ]
        read_only_fields = ["entry_time", "guard"]
