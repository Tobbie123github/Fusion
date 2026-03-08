import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye } from 'lucide-react'
import { ProductPlaceholder, Stars } from './UI'
import { useCartStore } from '../context/store'
import toast from 'react-hot-toast'

// ─── outside component ────────────────────────────────────────────────────────
const effectivePrice = (p) => p.discount > 0 ? p.discount : p.price

const discountPercent = (p) =>
  p.discount > 0 ? Math.round(((p.price - p.discount) / p.price) * 100) : 0

export default function ProductCard({ product, index = 0 }) {
  const navigate  = useNavigate()
  const { addItem } = useCartStore()
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const price   = effectivePrice(product)
  const pct     = discountPercent(product)
  const hasDiscount = pct > 0

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addItem(product, product.sizes?.[2] || 'M', 1)
    toast.success(`${product.name} added to cart`, {
      style: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' },
      iconTheme: { primary: 'var(--accent)', secondary: 'var(--bg)' },
    })
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/products/${product.id}`)}
      className="group cursor-pointer rounded-xl border overflow-hidden transition-shadow duration-300"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: 'var(--surface)' }}>
        <motion.div
          className="w-full h-full"
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {product.imageUrl?.length > 0 ? (
            <img
              src={product.imageUrl[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
            />
          ) : (
            <ProductPlaceholder gradient={product.gradient || ['#1a1a2e', '#e94560']} />
          )}
        </motion.div>

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {/* Category */}
          <div
            className="px-2.5 py-1 rounded text-xs font-medium tracking-widest uppercase border"
            style={{ background: 'var(--tag)', color: 'var(--text-sub)', borderColor: 'var(--border)' }}
          >
            {product.category}
          </div>

          {/* Discount badge */}
          {hasDiscount && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: (index % 4) * 0.07 + 0.2 }}
              className="px-2.5 py-1 rounded text-xs font-bold tracking-wide"
              style={{ background: '#ef4444', color: '#fff' }}
            >
              -{pct}% OFF
            </motion.div>
          )}
        </div>

        {/* Low stock badge — top right */}
        {(product.instock ?? product.stock ?? 99) <= 10 && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded text-xs font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            Low Stock
          </div>
        )}

        {/* Hover Actions */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-3 flex gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 12 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold tracking-widest uppercase transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            <ShoppingBag size={13} /> Add to Cart
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`) }}
            className="w-10 flex items-center justify-center rounded-md border transition-colors"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-sub)' }}
          >
            <Eye size={14} />
          </button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1 transition-colors" style={{ color: 'var(--text)' }}>
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-2">
          {/* Price */}
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold" style={{ color: 'var(--accent)' }}>
              ₦{price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs line-through leading-tight" style={{ color: 'var(--text-muted)' }}>
                ₦{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Stars rating={product.rating} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ({product.reviews})
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}