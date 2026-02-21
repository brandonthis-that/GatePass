from django.contrib import admin

from .models import Asset


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ["asset_type", "model_name", "serial_number", "owner", "registered_at"]
    list_filter = ["asset_type"]
    search_fields = ["serial_number", "model_name", "owner__username", "owner__student_id"]
    readonly_fields = ["qr_code", "qr_token", "registered_at"]
