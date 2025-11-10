from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image


class StudentProfile(models.Model):
    """Extended profile for students"""
    STATUS_CHOICES = [
        ('ON_CAMPUS', 'On Campus'),
        ('OFF_CAMPUS', 'Off Campus'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id_number = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=200)
    is_day_scholar = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OFF_CAMPUS')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.full_name} ({self.student_id_number})"
    
    class Meta:
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'
        ordering = ['full_name']


class Asset(models.Model):
    """Assets registered by students (laptops, tablets, etc.)"""
    ASSET_TYPE_CHOICES = [
        ('LAPTOP', 'Laptop'),
        ('TABLET', 'Tablet'),
        ('PHONE', 'Mobile Phone'),
        ('OTHER', 'Other'),
    ]
    
    owner = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='assets')
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES, default='LAPTOP')
    serial_number = models.CharField(max_length=100, unique=True)
    model_name = models.CharField(max_length=200, blank=True)
    qr_code = models.ImageField(upload_to='qrcodes/assets/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_asset_type_display()} - {self.serial_number}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Generate QR code after first save (when we have an ID)
        if not self.qr_code:
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(f"ASSET:{self.id}:{self.serial_number}")
            qr.make(fit=True)
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            file_name = f'asset_{self.serial_number}.png'
            stream = BytesIO()
            qr_image.save(stream, 'PNG')
            stream.seek(0)
            self.qr_code.save(file_name, File(stream), save=False)
            stream.close()
            super().save(update_fields=['qr_code'])
    
    class Meta:
        verbose_name = 'Asset'
        verbose_name_plural = 'Assets'
        ordering = ['-created_at']


class Vehicle(models.Model):
    """Vehicles registered by students"""
    owner = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='vehicles', null=True, blank=True)
    plate_number = models.CharField(max_length=20, unique=True)
    make = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        owner_name = self.owner.full_name if self.owner else "Unregistered"
        return f"{self.plate_number} - {owner_name}"
    
    class Meta:
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'
        ordering = ['-created_at']


class GateLog(models.Model):
    """Logs all gate activities"""
    LOG_TYPE_CHOICES = [
        ('VEHICLE_IN', 'Vehicle In'),
        ('VEHICLE_OUT', 'Vehicle Out'),
        ('SCHOLAR_IN', 'Scholar In'),
        ('SCHOLAR_OUT', 'Scholar Out'),
        ('ASSET_VERIFY', 'Asset Verification'),
    ]
    
    timestamp = models.DateTimeField(auto_now_add=True)
    guard = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='gate_logs')
    log_type = models.CharField(max_length=20, choices=LOG_TYPE_CHOICES)
    student = models.ForeignKey(StudentProfile, on_delete=models.SET_NULL, null=True, blank=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.get_log_type_display()} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
    
    class Meta:
        verbose_name = 'Gate Log'
        verbose_name_plural = 'Gate Logs'
        ordering = ['-timestamp']


# Signal to create StudentProfile when User is created
@receiver(post_save, sender=User)
def create_or_update_student_profile(sender, instance, created, **kwargs):
    """Create StudentProfile for students automatically"""
    # Only create if user is in 'Student' group
    if created and instance.groups.filter(name='Student').exists():
        StudentProfile.objects.get_or_create(
            user=instance,
            defaults={
                'student_id_number': f'STU{instance.id:05d}',
                'full_name': instance.get_full_name() or instance.username,
            }
        )

