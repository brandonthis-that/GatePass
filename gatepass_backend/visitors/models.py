from django.db import models
from django.utils import timezone
from django.core.files import File
from io import BytesIO
import uuid
import qrcode


# Create your models here.
class Visitor(models.Model):
    VISIT_PURPOSES = [
        ('MEETING', 'Business Meeting'),
        ('INTERVIEW', 'Job Interview'),
        ('DELIVERY', 'Delivery/Pickup'),
        ('MAINTENANCE', 'Maintenance/Repair'),
        ('STUDENT_VISIT', 'Student Visit'),
        ('OFFICIAL', 'Official Business'),
        ('PERSONAL', 'Personal Visit'),
        ('OTHER', 'Other'),
    ]
    
    VISIT_STATUS = [
        ('PENDING', 'Pending Host Confirmation'),
        ('APPROVED', 'Approved by Host'),
        ('CHECKED_IN', 'Checked In'),
        ('IN_MEETING', 'Meeting in Progress'),
        ('COMPLETED', 'Visit Completed'),
        ('EXPIRED', 'Visit Expired'),
        ('DENIED', 'Denied by Host'),
    ]
    
    # Basic visitor info
    name = models.CharField(max_length=100)
    national_id = models.CharField(max_length=20)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    organization = models.CharField(max_length=100, blank=True)
    
    # Visit details
    purpose_category = models.CharField(max_length=20, choices=VISIT_PURPOSES, default='OTHER')
    purpose_details = models.TextField(help_text='Specific purpose of visit', default='General visit')
    
    # Host and location info
    host_name = models.CharField(max_length=100, default='Unknown')
    host_email = models.EmailField(blank=True)
    host_phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    office_location = models.CharField(max_length=100, blank=True, help_text='e.g., Block C - Room 205')
    
    # Timing
    expected_duration = models.PositiveIntegerField(help_text='Expected duration in minutes', default=60)
    scheduled_time = models.DateTimeField(null=True, blank=True)
    entry_time = models.DateTimeField(auto_now_add=True)
    exit_time = models.DateTimeField(null=True, blank=True)
    expected_end_time = models.DateTimeField(null=True, blank=True)
    
    # Status and validation
    status = models.CharField(max_length=20, choices=VISIT_STATUS, default='APPROVED')
    qr_token = models.UUIDField(default=uuid.uuid4, null=True, blank=True)
    qr_code = models.ImageField(upload_to="visitor_qr_codes/", blank=True)
    
    # Staff involved
    guard = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, related_name='logged_visitors')
    
    # Tracking
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if self.expected_duration and self.entry_time and not self.expected_end_time:
            self.expected_end_time = self.entry_time + timezone.timedelta(minutes=self.expected_duration)
        
        if not self.qr_code:
            self._generate_qr()
        
        super().save(*args, **kwargs)
    
    def _generate_qr(self):
        """Generate QR code for visitor verification"""
        qr = qrcode.make(str(self.qr_token))
        buffer = BytesIO()
        qr.save(buffer, "PNG")
        self.qr_code.save(f"visitor_{self.qr_token}.png", File(buffer), save=False)
    
    @property
    def is_overdue(self):
        if self.expected_end_time and timezone.now() > self.expected_end_time:
            return True
        return False
    
    def __str__(self):
        return f"{self.name} visiting {self.host_name} ({self.status})"


class VisitorConfirmation(models.Model):
    """
    Track host confirmations and visit validations
    """
    CONFIRMATION_TYPE = [
        ('EXPECTED', 'Host Confirmed Expecting Visitor'),
        ('ARRIVED', 'Host Confirmed Visitor Arrived'),
        ('MEETING_START', 'Meeting Started'),
        ('MEETING_END', 'Meeting Completed'),
        ('NO_SHOW', 'Visitor Did Not Show'),
        ('DENIED', 'Host Denied Visit'),
    ]
    
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE, related_name='confirmations')
    confirmation_type = models.CharField(max_length=20, choices=CONFIRMATION_TYPE)
    confirmed_by = models.CharField(max_length=100, help_text='Name/ID of person confirming')
    confirmed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    # Optional: if we want to verify it's actually the host
    verification_code = models.CharField(max_length=10, blank=True)
    
    class Meta:
        ordering = ['-confirmed_at']
    
    def __str__(self):
        return f"{self.visitor.name} - {self.confirmation_type} by {self.confirmed_by}"
