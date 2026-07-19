from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.products.models import Category, Product


class Command(BaseCommand):
    help = 'Initialize admin user and sample data for first deployment'

    def handle(self, *args, **options):
        # Create admin user if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123'
            )
            self.stdout.write(self.style.SUCCESS('✓ Admin user created (admin/admin123)'))
        else:
            self.stdout.write(self.style.WARNING('⚠ Admin user already exists'))

        # Create sample categories if none exist
        if not Category.objects.exists():
            categories_data = [
                {'name': 'Electronics', 'slug': 'electronics', 'description': 'Electronic devices and accessories'},
                {'name': 'Books', 'slug': 'books', 'description': 'Books and literary works'},
                {'name': 'Fashion', 'slug': 'fashion', 'description': 'Clothing and accessories'},
                {'name': 'Home', 'slug': 'home', 'description': 'Home and garden products'},
                {'name': 'Sports', 'slug': 'sports', 'description': 'Sports and outdoor gear'},
            ]
            for cat_data in categories_data:
                Category.objects.create(**cat_data)
            self.stdout.write(self.style.SUCCESS(f'✓ Created {len(categories_data)} categories'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠ Categories already exist: {Category.objects.count()}'))

        # Create sample products if none exist
        if not Product.objects.exists():
            sample_products = [
                {
                    'name': 'Wireless Headphones',
                    'slug': 'wireless-headphones',
                    'description': 'High-quality wireless headphones with noise cancellation',
                    'price': 79.99,
                    'category': Category.objects.get(slug='electronics'),
                    'stock': 50,
                    'rating': 4.5,
                    'review_count': 125,
                    'is_active': True,
                },
                {
                    'name': 'Python Programming Book',
                    'slug': 'python-programming-book',
                    'description': 'Learn Python from basics to advanced concepts',
                    'price': 29.99,
                    'category': Category.objects.get(slug='books'),
                    'stock': 100,
                    'rating': 4.8,
                    'review_count': 89,
                    'is_active': True,
                },
                {
                    'name': 'Cotton T-Shirt',
                    'slug': 'cotton-t-shirt',
                    'description': 'Comfortable 100% cotton t-shirt',
                    'price': 19.99,
                    'category': Category.objects.get(slug='fashion'),
                    'stock': 200,
                    'rating': 4.2,
                    'review_count': 342,
                    'is_active': True,
                },
                {
                    'name': 'Coffee Maker',
                    'slug': 'coffee-maker',
                    'description': 'Programmable coffee maker with thermal carafe',
                    'price': 49.99,
                    'category': Category.objects.get(slug='home'),
                    'stock': 30,
                    'rating': 4.6,
                    'review_count': 67,
                    'is_active': True,
                },
                {
                    'name': 'Yoga Mat',
                    'slug': 'yoga-mat',
                    'description': 'Non-slip yoga mat perfect for all exercises',
                    'price': 24.99,
                    'category': Category.objects.get(slug='sports'),
                    'stock': 75,
                    'rating': 4.3,
                    'review_count': 156,
                    'is_active': True,
                },
            ]

            for product_data in sample_products:
                Product.objects.create(**product_data)
            self.stdout.write(self.style.SUCCESS(f'✓ Created {len(sample_products)} sample products'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠ Products already exist: {Product.objects.count()}'))

        self.stdout.write(self.style.SUCCESS('\n✓ Database initialization complete!'))
