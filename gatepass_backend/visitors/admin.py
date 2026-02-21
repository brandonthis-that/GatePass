from django.contrib import admin

from .models import Visitor


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ["name", "national_id", "purpose", "host_name", "entry_time", "exit_time", "guard"]
    list_filter = ["guard"]
    search_fields = ["name", "national_id", "host_name"]
    date_hierarchy = "entry_time"
