from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["username", "first_name", "last_name", "role", "student_id", "is_day_scholar", "day_scholar_status"]
    list_filter = ["role", "is_day_scholar", "day_scholar_status"]
    search_fields = ["username", "first_name", "last_name", "student_id", "email"]
