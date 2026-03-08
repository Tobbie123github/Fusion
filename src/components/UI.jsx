import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

// ─── SPINNER ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin`} style={{ color: 'var(--accent)' }} />
    </div>
  )
}

// ─── PRODUCT PLACEHOLDER ──────────────────────────────────────────────────────
export function ProductPlaceholder({ gradient = ['#1a1a2e', '#e94560'], className = '' }) {
  return (
    <div
      className={`w-full h-full flex items-end p-4 ${className}`}
      style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
    >
      <span
        className="text-xs tracking-widest uppercase"
        style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'serif' }}
      >
        FUSION
      </span>
    </div>
  )
}

// ─── FADE UP WRAPPER ──────────────────────────────────────────────────────────
export function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <p className="text-xs tracking-widest uppercase font-medium mb-2" style={{ color: 'var(--accent)' }}>
      ✦ {children}
    </p>
  )
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) {
  const variants = {
    primary: 'text-[var(--bg)] border-transparent',
    outline: 'bg-transparent border-[var(--border)] text-[var(--text-sub)] hover:border-[var(--accent)]',
    ghost:   'bg-transparent border-transparent text-[var(--text-sub)] hover:text-[var(--text)]',
  }
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
  }
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 border rounded-md
        font-semibold tracking-widest uppercase transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      style={variant === 'primary' ? { background: 'var(--accent)' } : {}}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  )
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
export function Input({ label, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-sub)' }}>
          {label}
        </label>
      )}
      <input
        className="w-full rounded-md px-4 py-3 text-sm border transition-colors duration-200"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        {...props}
      />
    </div>
  )
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
export function Badge({ children, color }) {
  const colors = {
    green:  { bg: '#22c55e20', text: '#22c55e' },
    yellow: { bg: 'var(--accent)20', text: 'var(--accent)' },
    red:    { bg: '#ef444420', text: '#ef4444' },
    gray:   { bg: 'var(--border)', text: 'var(--text-sub)' },
  }
  const c = colors[color] || colors.yellow
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
      style={{ background: c.bg, color: c.text }}
    >
      {children}
    </span>
  )
}

// ─── STARS ────────────────────────────────────────────────────────────────────
export function Stars({ rating = 5, size = 'sm' }) {
  const fontSize = size === 'sm' ? '0.6rem' : '0.85rem'
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ fontSize, color: i < Math.floor(rating) ? 'var(--accent)' : 'var(--border)' }}>★</span>
      ))}
    </div>
  )
}

// ─── DIVIDER ─────────────────────────────────────────────────────────────────
export function Divider({ className = '' }) {
  return <div className={`h-px ${className}`} style={{ background: 'var(--border)' }} />
}
