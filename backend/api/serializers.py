from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import StudentProfile, Asset, Vehicle, GateLog


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    student_id_number = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'student_id_number', 'full_name']
    
    def create(self, validated_data):
        student_id = validated_data.pop('student_id_number')
        full_name = validated_data.pop('full_name')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Create student profile
        StudentProfile.objects.create(
            user=user,
            student_id_number=student_id,
            full_name=full_name
        )
        
        return user


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'username', 'student_id_number', 'full_name', 
                  'is_day_scholar', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssetSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    owner_id = serializers.CharField(source='owner.student_id_number', read_only=True)
    qr_code_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Asset
        fields = ['id', 'owner', 'owner_name', 'owner_id', 'asset_type', 
                  'serial_number', 'model_name', 'qr_code', 'qr_code_url',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'qr_code', 'created_at', 'updated_at']
    
    def get_qr_code_url(self, obj):
        if obj.qr_code:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_code.url)
        return None


class AssetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['asset_type', 'serial_number', 'model_name']
    
    def create(self, validated_data):
        # Owner will be set in the view
        return Asset.objects.create(**validated_data)


class VehicleSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    owner_id = serializers.CharField(source='owner.student_id_number', read_only=True)
    
    class Meta:
        model = Vehicle
        fields = ['id', 'owner', 'owner_name', 'owner_id', 'plate_number', 
                  'make', 'model', 'color', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class VehicleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['plate_number', 'make', 'model', 'color']


class GateLogSerializer(serializers.ModelSerializer):
    guard_name = serializers.CharField(source='guard.username', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id_number', read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    
    class Meta:
        model = GateLog
        fields = ['id', 'timestamp', 'guard', 'guard_name', 'log_type', 
                  'student', 'student_name', 'student_id', 'vehicle', 
                  'vehicle_plate', 'notes']
        read_only_fields = ['id', 'timestamp']


class AssetVerifySerializer(serializers.Serializer):
    """Serializer for asset verification response"""
    match = serializers.BooleanField()
    message = serializers.CharField()
    asset = AssetSerializer(required=False)
    owner = StudentProfileSerializer(required=False)


class VehicleLogSerializer(serializers.Serializer):
    """Serializer for vehicle logging"""
    plate_number = serializers.CharField(max_length=20)
    direction = serializers.ChoiceField(choices=['in', 'out'])
    notes = serializers.CharField(required=False, allow_blank=True)


class ScholarLogSerializer(serializers.Serializer):
    """Serializer for day scholar sign in/out"""
    action = serializers.ChoiceField(choices=['in', 'out'])
    notes = serializers.CharField(required=False, allow_blank=True)
