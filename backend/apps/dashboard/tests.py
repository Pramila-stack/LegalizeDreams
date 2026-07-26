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
