from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Asset, Vehicle, GateLog, DayScholarStatus

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    """Asset admin configuration."""
    
    list_display = ('serial_number', 'brand', 'model', 'asset_type', 'user', 'is_active', 'created_at')
    list_filter = ('asset_type', 'brand', 'is_active', 'is_reported_stolen', 'created_at')
    search_fields = ('serial_number', 'brand', 'model', 'user__email', 'user__first_name', 'user__last_name')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Asset Information', {
            'fields': ('user', 'asset_type', 'serial_number', 'brand', 'model', 'description')
        }),
        ('Media & QR Code', {
            'fields': ('photo', 'qr_image_display', 'qr_code', 'verification_hash'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_reported_stolen')
        }),
    )
    
    readonly_fields = ('qr_code', 'verification_hash', 'qr_image_display')
    
    def qr_image_display(self, obj):
        """Display QR code image in admin."""
        if obj.qr_image:
            return format_html(
                '<img src="{}" width="150" height="150" />',
                obj.qr_image.url
            )
        return "No QR code generated"
    qr_image_display.short_description = 'QR Code'

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    """Vehicle admin configuration."""
    
    list_display = ('plate_number', 'make', 'model', 'color', 'vehicle_type', 'user', 'is_active', 'created_at')
    list_filter = ('vehicle_type', 'make', 'is_active', 'is_reported_stolen', 'created_at')
    search_fields = ('plate_number', 'make', 'model', 'user__email', 'user__first_name', 'user__last_name')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Vehicle Information', {
            'fields': ('user', 'plate_number', 'vehicle_type', 'make', 'model', 'color', 'year')
        }),
        ('Media & QR Code', {
            'fields': ('photo', 'qr_image_display', 'qr_code', 'verification_hash'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_reported_stolen')
        }),
    )
    
    readonly_fields = ('qr_code', 'verification_hash', 'qr_image_display')
    
    def qr_image_display(self, obj):
        """Display QR code image in admin."""
        if obj.qr_image:
            return format_html(
                '<img src="{}" width="150" height="150" />',
                obj.qr_image.url
            )
        return "No QR code generated"
    qr_image_display.short_description = 'QR Code'

@admin.register(GateLog)
class GateLogAdmin(admin.ModelAdmin):
    """Gate log admin configuration."""
    
    list_display = ('timestamp', 'log_type', 'status', 'user', 'guard', 'get_subject', 'location')
    list_filter = ('log_type', 'status', 'timestamp', 'location')
    search_fields = ('user__email', 'guard__email', 'notes', 'visitor_name', 'asset__serial_number', 'vehicle__plate_number')
    ordering = ('-timestamp',)
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('Log Information', {
            'fields': ('log_type', 'status', 'timestamp', 'location')
        }),
        ('People Involved', {
            'fields': ('user', 'guard')
        }),
        ('Assets/Vehicles', {
            'fields': ('asset', 'vehicle'),
            'classes': ('collapse',)
        }),
        ('Visitor Information', {
            'fields': ('visitor_name', 'visitor_id', 'visitor_purpose'),
            'classes': ('collapse',)
        }),
        ('Additional Details', {
            'fields': ('notes', 'ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('timestamp', 'created_at', 'ip_address', 'user_agent')
    
    def get_subject(self, obj):
        """Get the main subject of the log entry."""
        if obj.asset:
            return f"Asset: {obj.asset.serial_number}"
        elif obj.vehicle:
            return f"Vehicle: {obj.vehicle.plate_number}"
        elif obj.visitor_name:
            return f"Visitor: {obj.visitor_name}"
        return "-"
    get_subject.short_description = 'Subject'

@admin.register(DayScholarStatus)
class DayScholarStatusAdmin(admin.ModelAdmin):
    """Day scholar status admin configuration."""
    
    list_display = ('user', 'status', 'last_check_in', 'last_check_out', 'updated_at')
    list_filter = ('status', 'last_check_in', 'last_check_out')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'user__student_id')
    ordering = ('-updated_at',)
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'status')
        }),
        ('Timestamps', {
            'fields': ('last_check_in', 'last_check_out', 'updated_at')
        }),
    )
    
    readonly_fields = ('updated_at',)
