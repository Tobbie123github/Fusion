import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t mt-auto" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="font-serif text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>FUSION</p>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-sub)' }}>
              Precision-crafted essentials for those who exist beyond trends. Elevated basics, intentional design.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs tracking-widest uppercase mb-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Navigation</p>
            <div className="flex flex-col gap-3">
              {[['Shop', '/shop'], ['About', '/about'], ['Orders', '/orders']].map(([l, to]) => (
                <Link key={to} to={to} className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-sub)' }}>{l}</Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs tracking-widest uppercase mb-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Legal</p>
            <div className="flex flex-col gap-3">
              {['Privacy Policy', 'Terms of Service', 'Returns'].map((l) => (
                <span key={l} className="text-sm cursor-pointer transition-colors hover:opacity-80" style={{ color: 'var(--text-sub)' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs tracking-wide" style={{ color: 'var(--text-muted)' }}>© 2025 Fusion Clothing. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {['✦ Sustainably Sourced', '✦ Ethically Made', '✦ Carbon Neutral'].map((t) => (
              <span key={t} className="text-xs" style={{ color: 'var(--text-muted)' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
