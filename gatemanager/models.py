from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image
import hashlib
import json

class Asset(models.Model):
    """
    Model for student/staff personal assets (laptops, phones, etc.)
    """
    
    ASSET_TYPE_CHOICES = [
        ('laptop', 'Laptop'),
        ('phone', 'Phone'),
        ('tablet', 'Tablet'),
        ('camera', 'Camera'),
        ('other', 'Other'),
    ]
    
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='assets'
    )
    
    # Asset details
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)
    serial_number = models.CharField(max_length=100, unique=True)
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=100)
    description = models.TextField(blank=True, help_text="Additional details about the asset")
    
    # QR Code and verification
    qr_code = models.CharField(max_length=200, unique=True, blank=True)
    qr_image = models.ImageField(upload_to='qr_codes/assets/', blank=True, null=True)
    verification_hash = models.CharField(max_length=64, blank=True)
    
    # Media
    photo = models.ImageField(upload_to='assets/photos/', blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_reported_stolen = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Asset'
        verbose_name_plural = 'Assets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'asset_type']),
            models.Index(fields=['serial_number']),
            models.Index(fields=['qr_code']),
        ]
    
    def __str__(self):
        return f"{self.brand} {self.model} ({self.serial_number})"
    
    def save(self, *args, **kwargs):
        """Generate QR code and verification hash on save."""
        if not self.qr_code:
            self.qr_code = f"ASSET_{self.id}_{timezone.now().timestamp()}"
        
        if not self.verification_hash:
            self.verification_hash = self.generate_verification_hash()
        
        super().save(*args, **kwargs)
        
        # Generate QR code image
        if not self.qr_image:
            self.generate_qr_image()
    
    def generate_verification_hash(self):
        """Generate a secure hash for verification."""
        data = f"{self.id}:{self.serial_number}:{self.user.id}:{timezone.now().isoformat()}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def generate_qr_image(self):
        """Generate QR code image for the asset."""
        qr_data = {
            'type': 'asset',
            'id': str(self.id),
            'userId': str(self.user.id),
            'serialNumber': self.serial_number,
            'hash': self.verification_hash,
            'timestamp': timezone.now().isoformat()
        }
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(json.dumps(qr_data))
        qr.make(fit=True)
        
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Save to model
        blob = BytesIO()
        qr_image.save(blob, 'PNG')
        self.qr_image.save(
            f'asset_{self.id}_qr.png',
            File(blob),
            save=False
        )
        self.save(update_fields=['qr_image'])

class Vehicle(models.Model):
    """
    Model for registered vehicles (cars, motorcycles, etc.)
    """
    
    VEHICLE_TYPE_CHOICES = [
        ('car', 'Car'),
        ('motorcycle', 'Motorcycle'),
        ('bicycle', 'Bicycle'),
        ('truck', 'Truck'),
        ('van', 'Van'),
    ]
    
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='vehicles'
    )
    
    # Vehicle details
    plate_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES, default='car')
    make = models.CharField(max_length=50, help_text="e.g., Toyota, Honda")
    model = models.CharField(max_length=50, help_text="e.g., Corolla, Civic")
    color = models.CharField(max_length=30)
    year = models.IntegerField(blank=True, null=True)
    
    # QR Code and verification
    qr_code = models.CharField(max_length=200, unique=True, blank=True)
    qr_image = models.ImageField(upload_to='qr_codes/vehicles/', blank=True, null=True)
    verification_hash = models.CharField(max_length=64, blank=True)
    
    # Media
    photo = models.ImageField(upload_to='vehicles/photos/', blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_reported_stolen = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'plate_number']),
            models.Index(fields=['plate_number']),
            models.Index(fields=['qr_code']),
        ]
    
    def __str__(self):
        return f"{self.plate_number} - {self.make} {self.model}"
    
    def save(self, *args, **kwargs):
        """Generate QR code and verification hash on save."""
        if not self.qr_code:
            self.qr_code = f"VEHICLE_{self.id}_{timezone.now().timestamp()}"
        
        if not self.verification_hash:
            self.verification_hash = self.generate_verification_hash()
        
        super().save(*args, **kwargs)
        
        # Generate QR code image
        if not self.qr_image:
            self.generate_qr_image()
    
    def generate_verification_hash(self):
        """Generate a secure hash for verification."""
        data = f"{self.id}:{self.plate_number}:{self.user.id}:{timezone.now().isoformat()}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def generate_qr_image(self):
        """Generate QR code image for the vehicle."""
        qr_data = {
            'type': 'vehicle',
            'id': str(self.id),
            'userId': str(self.user.id),
            'plateNumber': self.plate_number,
            'hash': self.verification_hash,
            'timestamp': timezone.now().isoformat()
        }
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(json.dumps(qr_data))
        qr.make(fit=True)
        
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Save to model
        blob = BytesIO()
        qr_image.save(blob, 'PNG')
        self.qr_image.save(
            f'vehicle_{self.id}_qr.png',
            File(blob),
            save=False
        )
        self.save(update_fields=['qr_image'])

class GateLog(models.Model):
    """
    Model for logging all gate activities and security events.
    """
    
    LOG_TYPE_CHOICES = [
        ('asset_verification', 'Asset Verification'),
        ('vehicle_entry', 'Vehicle Entry'),
        ('vehicle_exit', 'Vehicle Exit'),
        ('day_scholar_in', 'Day Scholar Check In'),
        ('day_scholar_out', 'Day Scholar Check Out'),
        ('visitor_entry', 'Visitor Entry'),
        ('visitor_exit', 'Visitor Exit'),
        ('security_alert', 'Security Alert'),
    ]
    
    STATUS_CHOICES = [
        ('valid', 'Valid/Authorized'),
        ('invalid', 'Invalid/Unauthorized'),
        ('visitor', 'Visitor'),
        ('stolen', 'Reported Stolen'),
        ('expired', 'Expired'),
    ]
    
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    log_type = models.CharField(max_length=30, choices=LOG_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Relationships (optional based on log type)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='gate_logs',
        help_text="User involved in the log entry"
    )
    guard = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='guard_logs',
        help_text="Security guard who made the log entry"
    )
    asset = models.ForeignKey(
        'Asset', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    vehicle = models.ForeignKey(
        'Vehicle', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    # Additional data
    notes = models.TextField(blank=True, help_text="Additional notes or observations")
    location = models.CharField(max_length=100, blank=True, help_text="Gate location")
    visitor_name = models.CharField(max_length=200, blank=True, help_text="Name of visitor (if applicable)")
    visitor_id = models.CharField(max_length=100, blank=True, help_text="ID of visitor")
    visitor_purpose = models.CharField(max_length=200, blank=True, help_text="Purpose of visit")
    
    # Metadata
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    
    # Timestamps
    timestamp = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Gate Log'
        verbose_name_plural = 'Gate Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp', 'log_type']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['guard', 'timestamp']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.log_type} - {self.status} ({self.timestamp.strftime('%Y-%m-%d %H:%M')})"

class DayScholarStatus(models.Model):
    """
    Model to track day scholar check-in/check-out status.
    Only one active status per day scholar at a time.
    """
    
    STATUS_CHOICES = [
        ('in', 'Checked In'),
        ('out', 'Checked Out'),
    ]
    
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='day_scholar_status'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='out')
    
    # Timestamps
    last_check_in = models.DateTimeField(blank=True, null=True)
    last_check_out = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Day Scholar Status'
        verbose_name_plural = 'Day Scholar Statuses'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.status.upper()}"
    
    def check_in(self, guard=None):
        """Mark user as checked in."""
        self.status = 'in'
        self.last_check_in = timezone.now()
        self.save()
        
        # Create gate log entry
        GateLog.objects.create(
            log_type='day_scholar_in',
            status='valid',
            user=self.user,
            guard=guard,
            notes=f"Day scholar checked in"
        )
    
    def check_out(self, guard=None):
        """Mark user as checked out."""
        self.status = 'out'
        self.last_check_out = timezone.now()
        self.save()
        
        # Create gate log entry
        GateLog.objects.create(
            log_type='day_scholar_out',
            status='valid',
            user=self.user,
            guard=guard,
            notes=f"Day scholar checked out"
        )
