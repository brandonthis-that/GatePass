from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import uuid

class UserManager(BaseUserManager):
    """Custom user manager that uses email as the unique identifier."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user with an email and password."""
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser with admin privileges."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for Africa Nazarene University Gate Management System.
    Uses email as the unique identifier instead of username.
    """
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('staff', 'Staff'),
        ('guard', 'Security Guard'),
        ('admin', 'Administrator'),
    ]
    
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(
        unique=True, 
        help_text="University email address (e.g., john.doe@anu.ac.ke)"
    )
    first_name = models.CharField(max_length=150, verbose_name="First Name")
    last_name = models.CharField(max_length=150, verbose_name="Last Name")
    
    # Role and identification
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    student_id = models.CharField(
        max_length=20, 
        blank=True, 
        null=True, 
        unique=True,
        help_text="Student ID number (for students only)"
    )
    staff_id = models.CharField(
        max_length=20, 
        blank=True, 
        null=True, 
        unique=True,
        help_text="Staff ID number (for staff only)"
    )
    
    # Additional information
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    photo = models.ImageField(
        upload_to='profile_photos/', 
        blank=True, 
        null=True,
        help_text="Profile photo for identification"
    )
    
    # System fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        db_table = 'auth_users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        """Return the user's short name."""
        return self.first_name
    
    def get_identifier(self):
        """Return the appropriate ID based on user role."""
        if self.role == 'student' and self.student_id:
            return self.student_id
        elif self.role == 'staff' and self.staff_id:
            return self.staff_id
        return str(self.id)[:8]
    
    @property
    def is_student(self):
        """Check if user is a student."""
        return self.role == 'student'
    
    @property
    def is_security_guard(self):
        """Check if user is a security guard."""
        return self.role == 'guard'
    
    @property
    def is_administrator(self):
        """Check if user is an administrator."""
        return self.role == 'admin'
    
    def clean(self):
        """Validate user data based on role."""
        from django.core.exceptions import ValidationError
        
        if self.role == 'student' and not self.student_id:
            raise ValidationError("Student ID is required for students.")
        if self.role == 'staff' and not self.staff_id:
            raise ValidationError("Staff ID is required for staff.")
        
        # Ensure email domain is from ANU
        if not self.email.endswith('@anu.ac.ke'):
            raise ValidationError("Email must be from Africa Nazarene University (@anu.ac.ke).")
