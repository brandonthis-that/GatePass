from django.db import models


# Create your models here.
class Visitor(models.Model):
    name = models.CharField(max_length=100)
    national_id = models.CharField(max_length=20)
    purpose = models.TextField()
    host_name = models.CharField(max_length=100, blank=True)
    entry_time = models.DateTimeField(auto_now_add=True)
    exit_time = models.DateTimeField(null=True, blank=True)
    guard = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True)
