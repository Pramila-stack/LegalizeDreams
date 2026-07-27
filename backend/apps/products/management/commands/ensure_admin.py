from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decouple import config


class Command(BaseCommand):
    help = (
        "Create or update a staff superuser whose USERNAME equals the admin email, so "
        "the React admin dashboard (which authenticates by email) can log in. Reads "
        "ADMIN_EMAIL / ADMIN_PASSWORD, falling back to DJANGO_SUPERUSER_EMAIL / "
        "DJANGO_SUPERUSER_PASSWORD. Idempotent: safe to run on every deploy. No-ops "
        "(with a warning) if neither pair is set."
    )

    def handle(self, *args, **options):
        # Prefer ADMIN_*, but reuse the existing DJANGO_SUPERUSER_* vars if that's
        # all that's set. Note: the USERNAME is deliberately set to the EMAIL (not
        # DJANGO_SUPERUSER_USERNAME), because the dashboard logs in by email.
        email = config('ADMIN_EMAIL', default='') or config('DJANGO_SUPERUSER_EMAIL', default='')
        password = config('ADMIN_PASSWORD', default='') or config('DJANGO_SUPERUSER_PASSWORD', default='')

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                'ensure_admin: no admin email/password in env '
                '(ADMIN_EMAIL/ADMIN_PASSWORD or DJANGO_SUPERUSER_EMAIL/DJANGO_SUPERUSER_PASSWORD) - skipping.'
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
