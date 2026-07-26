from django.test import TestCase
from apps.content.models import HeroVideo, HeroSettings


class HeroSettingsModelTest(TestCase):
    def test_load_creates_defaults(self):
        settings_obj = HeroSettings.load()
        self.assertEqual(settings_obj.pk, 1)
        self.assertEqual(settings_obj.cta_label, 'Shop New Arrivals')
        self.assertEqual(settings_obj.cta_link, '/shop')

    def test_singleton_enforced(self):
        HeroSettings.load()
        second = HeroSettings(cta_label='Other', cta_link='/other')
        second.save()
        self.assertEqual(HeroSettings.objects.count(), 1)
        self.assertEqual(HeroSettings.load().cta_label, 'Other')


class HeroVideoModelTest(TestCase):
    def test_ordering_by_order_field(self):
        HeroVideo.objects.create(video='hero/b.mp4', title='B', order=2)
        HeroVideo.objects.create(video='hero/a.mp4', title='A', order=1)
        titles = list(HeroVideo.objects.values_list('title', flat=True))
        self.assertEqual(titles, ['A', 'B'])

    def test_str_falls_back_when_no_title(self):
        video = HeroVideo.objects.create(video='hero/x.mp4', order=1)
        self.assertEqual(str(video), f'Hero Video {video.pk}')
