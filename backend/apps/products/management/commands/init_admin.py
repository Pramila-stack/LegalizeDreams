from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.products.models import Category, Product
from decouple import config


class Command(BaseCommand):
    help = 'Initialize admin user and sample data for first deployment'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n=== Database Initialization ===\n'))

        if not User.objects.filter(is_superuser=True).exists():
            username = config('DJANGO_SUPERUSER_USERNAME', default='admin')
            password = config('DJANGO_SUPERUSER_PASSWORD', default='admin123')
            email = config('DJANGO_SUPERUSER_EMAIL', default='admin@example.com')

            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS(f'[OK] Admin user created ({username}/{password})'))

        # Create sample categories only if database is completely empty
        existing_categories = Category.objects.count()
        if existing_categories == 0:
            categories_data = [
                {'name': 'Electronics', 'slug': 'electronics', 'description': 'Electronic devices and accessories'},
                {'name': 'Books', 'slug': 'books', 'description': 'Books and literary works'},
                {'name': 'Fashion', 'slug': 'fashion', 'description': 'Clothing and accessories'},
                {'name': 'Home', 'slug': 'home', 'description': 'Home and garden products'},
                {'name': 'Sports', 'slug': 'sports', 'description': 'Sports and outdoor gear'},
            ]
            for cat_data in categories_data:
                Category.objects.create(**cat_data)
            self.stdout.write(self.style.SUCCESS(f'[OK] Created {len(categories_data)} sample categories'))
        else:
            self.stdout.write(self.style.WARNING(
                f'[SKIP] Skipping category creation - {existing_categories} categories already exist\n'
                f'  Your existing data is preserved!'
            ))

        # Create sample products only if database is completely empty
        existing_products = Product.objects.count()
        if existing_products == 0:
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
            self.stdout.write(self.style.SUCCESS(f'[OK] Created {len(sample_products)} sample products'))
        else:
            self.stdout.write(self.style.WARNING(
                f'[SKIP] Skipping product creation - {existing_products} products already exist\n'
                f'  Your existing data is preserved!'
            ))

        self.stdout.write(self.style.SUCCESS('\n=== Initialization Complete ===\n'))
