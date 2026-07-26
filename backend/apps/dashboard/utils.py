from django.utils.text import slugify


def unique_slug(model, name):
    """A slugified `name` made unique for `model` by appending -2, -3, ..."""
    base = slugify(name) or 'item'
    slug = base
    n = 2
    while model.objects.filter(slug=slug).exists():
        slug = f'{base}-{n}'
        n += 1
    return slug
