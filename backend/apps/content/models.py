from django.db import models
from cloudinary_storage.storage import VideoMediaCloudinaryStorage


class HeroVideo(models.Model):
    """A single autoplaying video slide on the homepage hero."""
    video = models.FileField(
        upload_to='hero/',
        storage=VideoMediaCloudinaryStorage(),
    )
    title = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.title or f'Hero Video {self.pk}'


class HeroSettings(models.Model):
    """Singleton config for the hero call-to-action button."""
    cta_label = models.CharField(max_length=100, default='Shop New Arrivals')
    cta_link = models.CharField(max_length=200, default='/shop')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Hero Settings'
        verbose_name_plural = 'Hero Settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return 'Homepage Hero Settings'

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
