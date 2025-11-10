from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from .models import StudentProfile, Asset, Vehicle, GateLog


class StudentProfileResource(resources.ModelResource):
    class Meta:
        model = StudentProfile


class GateLogResource(resources.ModelResource):
    class Meta:
        model = GateLog


@admin.register(StudentProfile)
class StudentProfileAdmin(ImportExportModelAdmin):
    resource_class = StudentProfileResource
    list_display = ('student_id_number', 'full_name', 'is_day_scholar', 'status', 'created_at')
    list_filter = ('is_day_scholar', 'status', 'created_at')
    search_fields = ('student_id_number', 'full_name', 'user__username')
    list_editable = ('is_day_scholar', 'status')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('serial_number', 'asset_type', 'owner', 'model_name', 'created_at')
    list_filter = ('asset_type', 'created_at')
    search_fields = ('serial_number', 'model_name', 'owner__full_name', 'owner__student_id_number')
    readonly_fields = ('qr_code', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Asset Information', {
            'fields': ('owner', 'asset_type', 'serial_number', 'model_name')
        }),
        ('QR Code', {
            'fields': ('qr_code',),
            'description': 'QR code is automatically generated'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('plate_number', 'owner', 'make', 'model', 'color', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('plate_number', 'owner__full_name', 'owner__student_id_number', 'make', 'model')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(GateLog)
class GateLogAdmin(ImportExportModelAdmin):
    resource_class = GateLogResource
    list_display = ('timestamp', 'log_type', 'student', 'vehicle', 'guard', 'notes_preview')
    list_filter = ('log_type', 'timestamp', 'guard')
    search_fields = ('student__full_name', 'vehicle__plate_number', 'guard__username', 'notes')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
    
    def notes_preview(self, obj):
        return obj.notes[:50] + '...' if len(obj.notes) > 50 else obj.notes
    notes_preview.short_description = 'Notes'
    
    fieldsets = (
        ('Log Information', {
            'fields': ('log_type', 'timestamp')
        }),
        ('Related Data', {
            'fields': ('guard', 'student', 'vehicle')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
    )

