"""
Serializers for authentication endpoints.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model - used for displaying user data.
    """
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'student_id', 'staff_id', 'phone', 'department',
            'photo', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """
        Customize the representation of the user data.
        """
        data = super().to_representation(instance)
        # Add computed fields
        data['full_name'] = instance.get_full_name()
        data['identifier'] = instance.get_identifier()
        return data

class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    email = serializers.EmailField(
        help_text="University email address (e.g., john.doe@anu.ac.ke)"
    )
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="User password"
    )
    
    def validate(self, attrs):
        """
        Validate login credentials.
        """
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError('Email and password are required.')
        
        # Check if email is from ANU domain
        if not email.endswith('@anu.ac.ke'):
            raise serializers.ValidationError(
                'Please use your Africa Nazarene University email address.'
            )
        
        # Authenticate user
        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        
        attrs['user'] = user
        return attrs

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        help_text="Password must be at least 8 characters long"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Confirm your password"
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'role', 'student_id', 'staff_id', 'phone', 'department'
        ]
    
    def validate_email(self, value):
        """
        Validate email domain.
        """
        if not value.endswith('@anu.ac.ke'):
            raise serializers.ValidationError(
                'Email must be from Africa Nazarene University (@anu.ac.ke)'
            )
        return value
    
    def validate(self, attrs):
        """
        Validate registration data.
        """
        # Check password confirmation
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError("Passwords don't match.")
        
        # Role-specific validation
        role = attrs.get('role')
        student_id = attrs.get('student_id')
        staff_id = attrs.get('staff_id')
        
        if role == 'student':
            if not student_id:
                raise serializers.ValidationError('Student ID is required for students.')
            if staff_id:
                attrs.pop('staff_id')  # Remove staff_id if provided
        elif role == 'staff':
            if not staff_id:
                raise serializers.ValidationError('Staff ID is required for staff.')
            if student_id:
                attrs.pop('student_id')  # Remove student_id if provided
        else:
            # For guards and admins, clear both IDs
            if student_id:
                attrs.pop('student_id')
            if staff_id:
                attrs.pop('staff_id')
        
        return attrs
    
    def create(self, validated_data):
        """
        Create a new user account.
        """
        # Remove password confirmation from validated data
        validated_data.pop('password_confirm', None)
        
        # Extract password
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        return user

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password.
    """
    old_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Current password"
    )
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        help_text="New password (minimum 8 characters)"
    )
    confirm_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Confirm new password"
    )
    
    def validate_old_password(self, value):
        """
        Validate current password.
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value
    
    def validate(self, attrs):
        """
        Validate new passwords match.
        """
        if attrs.get('new_password') != attrs.get('confirm_password'):
            raise serializers.ValidationError("New passwords don't match.")
        return attrs

class PasswordResetSerializer(serializers.Serializer):
    """
    Serializer for password reset request.
    """
    email = serializers.EmailField(
        help_text="University email address"
    )
    
    def validate_email(self, value):
        """
        Validate email exists and is from ANU.
        """
        if not value.endswith('@anu.ac.ke'):
            raise serializers.ValidationError(
                'Email must be from Africa Nazarene University (@anu.ac.ke)'
            )
        
        try:
            User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError('No active account found with this email.')
        
        return value

class TokenRefreshSerializer(serializers.Serializer):
    """
    Serializer for token refresh.
    """
    refresh_token = serializers.CharField(
        help_text="Valid refresh token"
    )