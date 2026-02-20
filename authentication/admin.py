from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin configuration."""
    
    list_display = ('email', 'get_full_name', 'role', 'get_identifier', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'date_joined', 'department')
    search_fields = ('email', 'first_name', 'last_name', 'student_id', 'staff_id')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'phone', 'department', 'photo')
        }),
        ('Role & Identification', {
            'fields': ('role', 'student_id', 'staff_id')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'student_id', 'staff_id', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login', 'created_at', 'updated_at')
    
    def get_identifier(self, obj):
        """Display appropriate identifier based on role."""
        return obj.get_identifier()
    get_identifier.short_description = 'ID'
    get_identifier.admin_order_field = 'student_id'
