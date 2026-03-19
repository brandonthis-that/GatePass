from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.


class User(AbstractUser):
    STUDENT = "student"
    STAFF = "staff"
    GUARD = "guard"
    ADMIN = "admin"
    ROLE_CHOICES = [
        (STUDENT, "Student"),
        (STAFF, "Staff"),
        (GUARD, "Guard"),
        (ADMIN, "Admin"),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    student_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True)
    photo = models.ImageField(upload_to="profile_photos/", blank=True, null=True)
    is_day_scholar = models.BooleanField(default=False)  # type: ignore
    day_scholar_status = models.CharField(
        max_length=10,
        choices=[("ON_CAMPUS", "On Campus"), ("OFF_CAMPUS", "Off Campus")],
        default="OFF_CAMPUS",
    )
    must_change_password = models.BooleanField(default=False)  # True if user has default password
    is_banned = models.BooleanField(default=False)
    ban_reason = models.CharField(max_length=255, blank=True)
