from django.db import models


# Create your models here.
class GateLog(models.Model):
    LOG_TYPES = [
        ("VEHICLE_ENTRY", "Vehicle Entry"),
        ("VEHICLE_EXIT", "Vehicle Exit"),
        ("ASSET_VERIFY", "Asset Verification"),
        ("SCHOLAR_IN", "Day Scholar Sign In"),
        ("SCHOLAR_OUT", "Day Scholar Sign Out"),
        ("VISITOR_ENTRY", "Visitor Entry"),
    ]
    guard = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True)
    log_type = models.CharField(max_length=20, choices=LOG_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    # Flexible foreign keys (onlyone will be set per log)
    vehicle = models.ForeignKey(
        "vehicles.Vehicle", null=True, blank=True, on_delete=models.SET_NULL
    )
    asset = models.ForeignKey(
        "assets.Asset", null=True, blank=True, on_delete=models.SET_NULL
    )
    student = models.ForeignKey(
        "users.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="student_logs",
    )
    plate_number_raw = models.CharField(
        max_length=20, blank=True
    )  # For unregistered vehicles
    is_visitor = models.BooleanField(default=False)
