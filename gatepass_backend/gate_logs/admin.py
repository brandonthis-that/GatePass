from django.contrib import admin

from .models import GateLog


@admin.register(GateLog)
class GateLogAdmin(admin.ModelAdmin):
    list_display = [
        "timestamp",
        "log_type",
        "guard",
        "vehicle",
        "student",
        "is_visitor",
    ]
    list_filter = ["log_type", "timestamp", "guard"]
    search_fields = ["plate_number_raw", "student__student_id"]
    date_hierarchy = "timestamp"
