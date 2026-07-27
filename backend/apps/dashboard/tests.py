from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class AdminAuthTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user('admin@shop.com', 'admin@shop.com', 'pass12345', is_staff=True)
        self.customer = User.objects.create_user('cust@shop.com', 'cust@shop.com', 'pass12345')

    def test_me_denies_unauthenticated(self):
        self.assertIn(self.client.get('/api/admin/me/').status_code, (401, 403))

    def test_me_denies_non_staff(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get('/api/admin/me/').status_code, 403)

    def test_me_returns_identity_for_staff(self):
        self.client.force_authenticate(self.staff)
        res = self.client.get('/api/admin/me/')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['is_staff'])
        self.assertEqual(res.data['email'], 'admin@shop.com')

    def test_stats_denies_non_staff(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get('/api/admin/stats/').status_code, 403)

    def test_stats_returns_integer_counts_for_staff(self):
        self.client.force_authenticate(self.staff)
        res = self.client.get('/api/admin/stats/')
        self.assertEqual(res.status_code, 200)
        for key in ('products', 'categories', 'orders', 'users'):
            self.assertIn(key, res.data)
            self.assertIsInstance(res.data[key], int)
        self.assertEqual(res.data['users'], 2)


from apps.products.models import Category


class AdminCategoryCRUDTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user('admin@shop.com', 'admin@shop.com', 'pass12345', is_staff=True)
        self.customer = User.objects.create_user('cust@shop.com', 'cust@shop.com', 'pass12345')
        self.client.force_authenticate(self.staff)

    def test_create_generates_slug(self):
        res = self.client.post('/api/admin/categories/', {'name': 'Home & Garden', 'description': 'x'})
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['slug'], 'home-garden')

    def test_slug_collision_gets_unique_suffix(self):
        self.client.post('/api/admin/categories/', {'name': 'Home & Garden'})
        res = self.client.post('/api/admin/categories/', {'name': 'Home Garden'})
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['slug'], 'home-garden-2')

    def test_update_keeps_slug(self):
        created = self.client.post('/api/admin/categories/', {'name': 'Old'}).data
        res = self.client.patch(f"/api/admin/categories/{created['id']}/", {'name': 'New Name'})
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['name'], 'New Name')
        self.assertEqual(res.data['slug'], 'old')

    def test_list_and_delete(self):
        created = self.client.post('/api/admin/categories/', {'name': 'Temp'}).data
        self.assertEqual(self.client.get('/api/admin/categories/').status_code, 200)
        res = self.client.delete(f"/api/admin/categories/{created['id']}/")
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Category.objects.filter(id=created['id']).exists())

    def test_customer_forbidden(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.post('/api/admin/categories/', {'name': 'X'}).status_code, 403)


from unittest import mock
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.products.models import Product
from apps.orders.models import Order, OrderItem

# Minimal valid 1x1 GIF so DRF's ImageField (Pillow) accepts it.
TINY_GIF = (b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!'
            b'\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;')


def _gif():
    return SimpleUploadedFile('p.gif', TINY_GIF, content_type='image/gif')


class AdminProductCRUDTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user('admin@shop.com', 'admin@shop.com', 'pass12345', is_staff=True)
        self.customer = User.objects.create_user('cust@shop.com', 'cust@shop.com', 'pass12345')
        self.client.force_authenticate(self.staff)
        self.category = Category.objects.create(name='Cat', slug='cat')

    def _create(self, name='Cool Shirt', **extra):
        data = {'name': name, 'description': 'nice', 'price': '19.99',
                'stock': '5', 'category': str(self.category.id), 'image': _gif()}
        data.update(extra)
        return self.client.post('/api/admin/products/', data, format='multipart')

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_create_generates_slug_and_category_name(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        res = self._create()
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['slug'], 'cool-shirt')
        self.assertEqual(res.data['category_name'], 'Cat')

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_duplicate_name_gets_unique_slug(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        self._create(name='Shirt')
        res = self._create(name='Shirt')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['slug'], 'shirt-2')

    def test_create_requires_image(self):
        res = self.client.post('/api/admin/products/', {
            'name': 'No Image', 'description': 'x', 'price': '5.00', 'stock': '1',
            'category': str(self.category.id),
        }, format='multipart')
        self.assertEqual(res.status_code, 400)
        self.assertIn('image', res.data)

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_update_without_image_keeps_slug_and_edits_fields(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        created = self._create(name='Editable').data
        res = self.client.patch(f"/api/admin/products/{created['id']}/", {'price': '12.50'})
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['price'], '12.50')
        self.assertEqual(res.data['slug'], 'editable')

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_delete_preserves_order_history(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        created = self._create(name='Sold').data
        prod = Product.objects.get(id=created['id'])
        order = Order.objects.create(
            user=self.staff, order_number='ORD1', total_amount='19.99',
            shipping_address='a', city='c', postal_code='1', country='x',
            customer_email='c@x.com')
        item = OrderItem.objects.create(order=order, product=prod, quantity=1, price_at_purchase='19.99')
        res = self.client.delete(f"/api/admin/products/{created['id']}/")
        self.assertEqual(res.status_code, 204)
        item.refresh_from_db()
        self.assertIsNone(item.product_id)
        self.assertEqual(str(item.price_at_purchase), '19.99')

    def test_customer_forbidden(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get('/api/admin/products/').status_code, 403)


from apps.content.models import HeroSettings


class AdminHeroSettingsTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user('admin@shop.com', 'admin@shop.com', 'pass12345', is_staff=True)
        self.customer = User.objects.create_user('cust@shop.com', 'cust@shop.com', 'pass12345')

    def test_denies_non_staff(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get('/api/admin/hero-settings/').status_code, 403)

    def test_get_returns_defaults(self):
        self.client.force_authenticate(self.staff)
        res = self.client.get('/api/admin/hero-settings/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['cta_label'], 'Shop New Arrivals')
        self.assertEqual(res.data['cta_link'], '/shop')

    def test_patch_updates_and_persists(self):
        self.client.force_authenticate(self.staff)
        res = self.client.patch('/api/admin/hero-settings/', {'cta_label': 'Browse the Sale', 'cta_link': '/category/sale'})
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['cta_label'], 'Browse the Sale')
        reloaded = HeroSettings.load()
        self.assertEqual(reloaded.cta_link, '/category/sale')
        self.assertEqual(HeroSettings.objects.count(), 1)


from apps.content.models import HeroVideo


def _video():
    return SimpleUploadedFile('v.mp4', b'fake-video-bytes', content_type='video/mp4')


class AdminHeroVideoCRUDTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user('admin@shop.com', 'admin@shop.com', 'pass12345', is_staff=True)
        self.customer = User.objects.create_user('cust@shop.com', 'cust@shop.com', 'pass12345')
        self.client.force_authenticate(self.staff)

    def _create(self, **extra):
        data = {'title': 'Clip', 'order': '0', 'is_active': True, 'video': _video()}
        data.update(extra)
        return self.client.post('/api/admin/hero-videos/', data, format='multipart')

    def test_customer_forbidden(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get('/api/admin/hero-videos/').status_code, 403)

    def test_create_requires_video(self):
        res = self.client.post('/api/admin/hero-videos/', {'title': 'No file', 'order': '0'}, format='multipart')
        self.assertEqual(res.status_code, 400)
        self.assertIn('video', res.data)

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_create_returns_src_and_fields(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        res = self._create(title='Army', order='1')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['title'], 'Army')
        self.assertEqual(res.data['order'], 1)
        self.assertTrue(res.data['is_active'])
        self.assertTrue(res.data['src'])
        self.assertNotIn('video', res.data)

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_list_ordered_by_order(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        self._create(title='B', order='2')
        self._create(title='A', order='1')
        res = self.client.get('/api/admin/hero-videos/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual([v['title'] for v in res.data], ['A', 'B'])

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_update_without_video_keeps_existing(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        created = self._create(title='Editable', order='0').data
        res = self.client.patch(f"/api/admin/hero-videos/{created['id']}/", {'title': 'Renamed', 'order': '5'})
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['title'], 'Renamed')
        self.assertEqual(res.data['order'], 5)
        self.assertTrue(res.data['src'])

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_delete(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        created = self._create().data
        res = self.client.delete(f"/api/admin/hero-videos/{created['id']}/")
        self.assertEqual(res.status_code, 204)
        self.assertFalse(HeroVideo.objects.filter(id=created['id']).exists())
