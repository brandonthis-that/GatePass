from django.contrib import admin

from .models import Visitor, VisitorConfirmation


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ["name", "national_id", "status", "purpose_category", "host_name", "entry_time", "exit_time", "guard"]
    list_filter = ["status", "purpose_category", "guard", "department"]
    search_fields = ["name", "national_id", "host_name", "organization", "department"]
    date_hierarchy = "entry_time"
    readonly_fields = ["qr_token", "created_at", "updated_at"]
    fieldsets = (
        ("Visitor Information", {
            "fields": ("name", "national_id", "phone", "email", "organization")
        }),
        ("Visit Details", {
            "fields": ("purpose_category", "purpose_details", "expected_duration", "scheduled_time")
        }),
        ("Host Information", {
            "fields": ("host_name", "host_email", "host_phone", "department", "office_location")
        }),
        ("Status & Timing", {
            "fields": ("status", "entry_time", "exit_time", "expected_end_time")
        }),
        ("System", {
            "fields": ("qr_token", "guard", "created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )


@admin.register(VisitorConfirmation)
class VisitorConfirmationAdmin(admin.ModelAdmin):
    list_display = ["visitor", "confirmation_type", "confirmed_by", "confirmed_at"]
    list_filter = ["confirmation_type", "confirmed_at"]
    search_fields = ["visitor__name", "confirmed_by"]
    date_hierarchy = "confirmed_at"
