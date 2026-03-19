from rest_framework import serializers

from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
            "role",
            "student_id",
            "phone",
            "photo",
            "is_day_scholar",
        ]
        read_only_fields = ["role"]

    def create(self, validated_data):
        # Force role to student unless set explicitly by admin logic
        validated_data.setdefault("role", "student")
        password = validated_data.pop("password")

        # Check if this is a default password situation for students
        is_default_password = (
            validated_data.get("role") == "student"
            and validated_data.get("student_id")
            and password == validated_data.get("student_id")
        )

        user = User(**validated_data)
        user.set_password(password)
        user.must_change_password = is_default_password
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "student_id",
            "phone",
            "photo",
            "is_day_scholar",
            "day_scholar_status",
            "must_change_password",
            "is_banned",
            "ban_reason",
        ]
        read_only_fields = ["role", "student_id"]


# ── Admin-only serializers ─────────────────────────────────────────────────────

class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Admin creates a user with any role and a mandatory password."""
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
            "role",
            "student_id",
            "phone",
            "photo",
            "is_day_scholar",
            "is_banned",
            "ban_reason",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Admin can update role, ban status, and any profile field.
    Password is optional; supply it only to change it."""
    password = serializers.CharField(write_only=True, min_length=6, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
            "role",
            "student_id",
            "phone",
            "photo",
            "is_day_scholar",
            "day_scholar_status",
            "is_banned",
            "ban_reason",
            "must_change_password",
        ]
        read_only_fields = ["id"]

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
