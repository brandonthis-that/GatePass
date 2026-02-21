# Asset registration and QR codes
import uuid
from io import BytesIO

import qrcode
from django.core.files import File
from django.db import models


# Create your models here.
class Asset(models.Model):
    owner = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="assets"
    )
    asset_type = models.CharField(max_length=50)  # e.g., "Laptop", "Tablet"
    serial_number = models.CharField(max_length=100, unique=True)
    model_name = models.CharField(max_length=100)
    qr_code = models.ImageField(upload_to="qr_codes/", blank=True)
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    registered_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.qr_code:
            self._generate_qr()
        super().save(*args, **kwargs)

    def _generate_qr(self):
        qr = qrcode.make(str(self.qr_token))
        buffer = BytesIO()
        qr.save(buffer, format("PNG"))
        self.qr_code.save(f"asset_{self.qr_token}.png", File(buffer), save=False)
