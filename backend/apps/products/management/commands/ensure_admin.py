from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decouple import config


class Command(BaseCommand):
    help = (
        "Create or update a staff superuser whose USERNAME equals ADMIN_EMAIL, so the "
        "React admin dashboard (which authenticates by email) can log in. Reads "
        "ADMIN_EMAIL and ADMIN_PASSWORD from the environment. Idempotent: safe to run "
        "on every deploy. No-ops (with a warning) if the env vars are not set."
    )

    def handle(self, *args, **options):
        email = config('ADMIN_EMAIL', default='')
        password = config('ADMIN_PASSWORD', default='')

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                'ensure_admin: ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping.'
            ))
            return

        user, created = User.objects.get_or_create(
            username=email,
            defaults={'email': email},
        )
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        self.stdout.write(self.style.SUCCESS(
            f"ensure_admin: {'created' if created else 'updated'} dashboard admin '{email}'."
        ))
