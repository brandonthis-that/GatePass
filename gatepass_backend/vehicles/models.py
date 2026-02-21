from django.db import models


# Create your models here.
class Vehicle(models.Model):
    owner = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="vehicles"
    )
    plate_number = models.CharField(max_length=20, unique=True)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    color = models.CharField(max_length=30)
    registered_at = models.DateTimeField(auto_now_add=True)
