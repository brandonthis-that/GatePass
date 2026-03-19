from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from users.models import User
from users.sis.adapter import SISAdapter


class Command(BaseCommand):
    help = "Sync user accounts from the ANU Student Information System"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Preview what would be created without writing to the database",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        adapter = SISAdapter()
        accounts = adapter.fetch_accounts()

        existing_usernames = set(User.objects.values_list("username", flat=True))

        to_create = []
        skipped = 0

        for account in accounts:
            if account["username"] in existing_usernames:
                skipped += 1
                continue

            # Check if this is a default password (student_id or standard pattern)
            is_default_password = (
                (account["role"] == "student" and account["password"] == account.get("student_id")) or
                (account["role"] == "guard" and account["password"].endswith("pass")) or
                (account["role"] == "admin" and "secure" in account["password"])
            )
            
            to_create.append(
                User(
                    username=account["username"],
                    first_name=account["first_name"],
                    last_name=account["last_name"],
                    email=account["email"],
                    phone=account.get("phone", ""),
                    role=account["role"],
                    student_id=account.get("student_id"),
                    is_day_scholar=account.get("is_day_scholar", False),
                    day_scholar_status=account.get("day_scholar_status", "OFF_CAMPUS"),
                    password=make_password(account["password"]),
                    is_staff=account["role"] == "admin",
                    is_superuser=account["role"] == "admin",
                    must_change_password=is_default_password,
                )
            )

        if dry_run:
            self.stdout.write(
                f"[DRY RUN] Would create: {len(to_create)} | Would skip: {skipped}"
            )
            for u in to_create[:5]:
                self.stdout.write(f"  → {u.username} ({u.role})")
            self.stdout.write("  ...")
            return

        User.objects.bulk_create(to_create, batch_size=500)
        self.stdout.write(
            self.style.SUCCESS(
                f"Sync complete. Created: {len(to_create)} | Skipped (exist): {skipped}"
            )
        )
