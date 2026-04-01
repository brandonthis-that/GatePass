from rest_framework import serializers
import re

from .models import User


KENYAN_PHONE_RE = re.compile(r'^(\+254|0)[17]\d{8}$')


def validate_username_format(value):
    """Shared username validator: min 3 chars, allowed characters only."""
    value = value.strip()
    if len(value) < 3:
        raise serializers.ValidationError("Username must be at least 3 characters.")
    if not re.match(r'^[a-zA-Z0-9@.+\-_]+$', value):
        raise serializers.ValidationError(
            "Username may only contain letters, digits, and @/./+/-/_ characters."
        )
    return value


def validate_phone_format(value):
    """Optional phone: if provided must be valid Kenyan number."""
    if value:
        value = value.strip()
        if not KENYAN_PHONE_RE.match(value):
            raise serializers.ValidationError(
                "Enter a valid Kenyan phone number (e.g. +254712345678 or 0712345678)."
            )
    return value


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

    def validate_username(self, value):
        return validate_username_format(value)

    def validate_phone(self, value):
        return validate_phone_format(value)


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

    def validate_username(self, value):
        return validate_username_format(value)

    def validate_phone(self, value):
        return validate_phone_format(value)


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

    def validate_username(self, value):
        return validate_username_format(value)

    def validate_phone(self, value):
        return validate_phone_format(value)
