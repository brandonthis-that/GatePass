from django.contrib import admin

from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ["plate_number", "make", "model", "color", "owner", "registered_at"]
    search_fields = ["plate_number", "owner__username", "owner__student_id"]
    list_filter = ["make", "color"]
