"""
Serializers for the gate management system.
"""

from rest_framework import serializers
from authentication.serializers import UserSerializer
from .models import Asset, Vehicle, GateLog, DayScholarStatus

class AssetSerializer(serializers.ModelSerializer):
    """
    Serializer for Asset model.
    """
    user_details = UserSerializer(source='user', read_only=True)
    qr_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Asset
        fields = [
            'id', 'user', 'user_details', 'asset_type', 'serial_number',
            'brand', 'model', 'description', 'qr_code', 'qr_image',
            'qr_image_url', 'verification_hash', 'photo', 'is_active',
            'is_reported_stolen', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'qr_code', 'verification_hash', 'created_at', 'updated_at']
    
    def get_qr_image_url(self, obj):
        """Get full URL for QR code image."""
        if obj.qr_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_image.url)
            return obj.qr_image.url
        return None
    
    def validate_serial_number(self, value):
        """Ensure serial number is unique."""
        # Check for uniqueness, excluding current instance if updating
        queryset = Asset.objects.filter(serial_number=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError('Asset with this serial number already exists.')
        
        return value

class AssetCreateSerializer(AssetSerializer):
    """
    Serializer for creating new assets.
    """
    class Meta(AssetSerializer.Meta):
        fields = [
            'asset_type', 'serial_number', 'brand', 'model', 'description', 'photo'
        ]

class VehicleSerializer(serializers.ModelSerializer):
    """
    Serializer for Vehicle model.
    """
    user_details = UserSerializer(source='user', read_only=True)
    qr_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'user', 'user_details', 'plate_number', 'vehicle_type',
            'make', 'model', 'color', 'year', 'qr_code', 'qr_image',
            'qr_image_url', 'verification_hash', 'photo', 'is_active',
            'is_reported_stolen', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'qr_code', 'verification_hash', 'created_at', 'updated_at']
    
    def get_qr_image_url(self, obj):
        """Get full URL for QR code image."""
        if obj.qr_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_image.url)
            return obj.qr_image.url
        return None
    
    def validate_plate_number(self, value):
        """Ensure plate number is unique and properly formatted."""
        # Check for uniqueness, excluding current instance if updating
        queryset = Vehicle.objects.filter(plate_number=value.upper())
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError('Vehicle with this plate number already exists.')
        
        return value.upper()  # Store in uppercase

class VehicleCreateSerializer(VehicleSerializer):
    """
    Serializer for creating new vehicles.
    """
    class Meta(VehicleSerializer.Meta):
        fields = [
            'plate_number', 'vehicle_type', 'make', 'model', 'color', 'year', 'photo'
        ]

class GateLogSerializer(serializers.ModelSerializer):
    """
    Serializer for GateLog model.
    """
    user_details = UserSerializer(source='user', read_only=True)
    guard_details = UserSerializer(source='guard', read_only=True)
    asset_details = AssetSerializer(source='asset', read_only=True)
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    
    class Meta:
        model = GateLog
        fields = [
            'id', 'log_type', 'status', 'user', 'user_details', 'guard', 'guard_details',
            'asset', 'asset_details', 'vehicle', 'vehicle_details', 'notes', 'location',
            'visitor_name', 'visitor_id', 'visitor_purpose', 'timestamp', 'created_at'
        ]
        read_only_fields = ['id', 'timestamp', 'created_at']

class GateLogCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating gate log entries.
    """
    class Meta:
        model = GateLog
        fields = [
            'log_type', 'status', 'user', 'asset', 'vehicle', 'notes', 'location',
            'visitor_name', 'visitor_id', 'visitor_purpose'
        ]

class QRVerificationSerializer(serializers.Serializer):
    """
    Serializer for QR code verification.
    """
    qr_data = serializers.JSONField(help_text="Parsed QR code data")
    
    def validate_qr_data(self, value):
        """Validate QR code data structure."""
        required_fields = ['type', 'id', 'userId', 'hash']
        
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Missing required field: {field}")
        
        if value['type'] not in ['asset', 'vehicle']:
            raise serializers.ValidationError("Invalid QR code type")
        
        return value

class DayScholarStatusSerializer(serializers.ModelSerializer):
    """
    Serializer for DayScholarStatus model.
    """
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = DayScholarStatus
        fields = [
            'id', 'user', 'user_details', 'status', 'last_check_in', 'last_check_out', 'updated_at'
        ]
        read_only_fields = ['id', 'last_check_in', 'last_check_out', 'updated_at']

class VehicleEntrySerializer(serializers.Serializer):
    """
    Serializer for vehicle entry logging.
    """
    plate_number = serializers.CharField(max_length=20, help_text="Vehicle license plate number")
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    location = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    def validate_plate_number(self, value):
        """Normalize plate number."""
        return value.strip().upper()

class DashboardStatsSerializer(serializers.Serializer):
    """
    Serializer for dashboard statistics.
    """
    total_users = serializers.IntegerField()
    total_assets = serializers.IntegerField()
    total_vehicles = serializers.IntegerField()
    today_logs = serializers.IntegerField()
    active_guards = serializers.IntegerField()
    day_scholars_in = serializers.IntegerField()
    recent_alerts = serializers.IntegerField()