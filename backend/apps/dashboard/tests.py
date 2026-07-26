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
