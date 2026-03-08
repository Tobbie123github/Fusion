import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react'
import { useAuthStore, useCartStore, useThemeStore } from '../context/store'
import { THEMES } from '../api/mockData'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const { user, logout } = useAuthStore()
  const { items } = useCartStore()
  const { theme, setTheme } = useThemeStore()

  const cartCount = items.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setThemeOpen(false)
    setUserOpen(false)
  }, [location.pathname])

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'About', to: '/about' },
  ]

  if (user) navLinks.push({ label: 'Orders', to: '/orders' })

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-nav' : ''
        }`}
        style={{
          background: scrolled ? 'var(--bg)dd' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="font-serif text-2xl font-bold tracking-wider transition-opacity hover:opacity-70"
            style={{ color: 'var(--text)' }}
          >
            FUSION
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-xs tracking-widest uppercase font-medium transition-colors duration-200"
                style={{
                  color: location.pathname === l.to ? 'var(--accent)' : 'var(--text-sub)',
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Picker */}
            <div className="relative">
              <button
                onClick={() => { setThemeOpen(!themeOpen); setUserOpen(false) }}
                className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                title="Switch theme"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: THEMES[theme]?.dot || 'var(--accent)' }}
                />
              </button>

              <AnimatePresence>
                {themeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 rounded-xl border py-2 min-w-[150px] shadow-2xl z-50"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                  >
                    {Object.entries(THEMES).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => { setTheme(key); setThemeOpen(false) }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-xs tracking-wide transition-colors"
                        style={{
                          color: theme === key ? 'var(--text)' : 'var(--text-sub)',
                          background: theme === key ? 'var(--tag)' : 'transparent',
                        }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: val.dot }} />
                        {val.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-md transition-colors"
              style={{ color: 'var(--text)' }}
            >
              <ShoppingBag size={18} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                    style={{ background: 'var(--accent)', color: 'var(--bg)', fontSize: '0.6rem' }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => { setUserOpen(!userOpen); setThemeOpen(false) }}
                  className="flex items-center gap-2 text-xs tracking-wide px-3 py-2 rounded-md border transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-sub)', background: 'var(--surface)' }}
                >
                  <User size={13} />
                  {user.name || 'Account'}
                  <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 rounded-xl border py-2 min-w-[160px] shadow-2xl z-50"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                      <Link to="/orders" className="block px-4 py-2.5 text-xs tracking-wide transition-colors" style={{ color: 'var(--text-sub)' }}>My Orders</Link>
                      <div className="h-px my-1" style={{ background: 'var(--border)' }} />
                      <button
                        onClick={() => { logout(); navigate('/') }}
                        className="block w-full text-left px-4 py-2.5 text-xs tracking-wide"
                        style={{ color: '#ef4444' }}
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center px-4 py-2 rounded-md text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-80"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center"
              style={{ color: 'var(--text)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t overflow-hidden"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link key={l.to} to={l.to} className="py-3 text-sm tracking-widest uppercase border-b" style={{ color: 'var(--text-sub)', borderColor: 'var(--border)' }}>
                    {l.label}
                  </Link>
                ))}
                {user ? (
                  <button onClick={() => { logout(); navigate('/') }} className="py-3 text-sm tracking-widest uppercase text-left" style={{ color: '#ef4444' }}>
                    Sign Out
                  </button>
                ) : (
                  <Link to="/login" className="py-3 text-sm tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Overlay to close dropdowns */}
      {(themeOpen || userOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setThemeOpen(false); setUserOpen(false) }} />
      )}
    </>
  )
}
