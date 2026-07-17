import { Link } from 'react-router-dom'
import ProductImage from '../common/ProductImage'
import Price from '../common/Price'
import StarRating from '../common/StarRating'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart()

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white transition-shadow hover:shadow-lg hover:shadow-brand-100 hover:scale-105 transition-transform duration-300 animate-on-scroll opacity-0"
      style={{animation: `slideUp 0.6s ease-out forwards`, animationDelay: `${index * 0.1}s`}}>
      <Link to={`/product/${product.slug}`} className="block">
        <ProductImage product={product} size="lg" className="aspect-square w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-black hover:text-brand-600">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} reviews={product.reviews} />
        <Price price={product.price} mrp={product.mrp} />
        <button
          onClick={() => addToCart(product, 1)}
          className="mt-2 w-full rounded-full border border-brand-800 py-2 text-xs font-semibold uppercase tracking-wide text-brand-800 transition-colors hover:bg-brand-800 hover:text-white"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}
