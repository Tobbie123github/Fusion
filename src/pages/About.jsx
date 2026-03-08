import { motion } from 'framer-motion'
import { FadeUp, SectionLabel } from '../components/UI'
import Footer from '../components/Footer'

const VALUES = [
  { symbol: '◈', title: 'Craft First', desc: 'Every seam, every stitch is deliberate. We obsess over construction so you never have to.' },
  { symbol: '◉', title: 'Planet Aware', desc: 'Organic and recycled materials. Net-zero target by 2026. Fashion should not cost the earth.' },
  { symbol: '◎', title: 'Radical Transparency', desc: 'We publish our supply chain. You deserve to know who made your clothes and how.' },
  { symbol: '◐', title: 'Enduring Design', desc: 'No seasonal gimmicks. We design pieces that outlast any trend cycle by a decade.' },
]

export default function About() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="min-h-[70vh] flex items-center px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 20% 60%, var(--accent)07 0%, transparent 70%)' }} />
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <SectionLabel>Our Story</SectionLabel>
          </FadeUp>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-bold leading-tight mb-8"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', color: 'var(--text)' }}
          >
            Clothes That<br />
            <em className="italic" style={{ color: 'var(--accent)' }}>Mean Something</em>
          </motion.h1>
          <FadeUp delay={0.3}>
            <p className="text-base leading-relaxed max-w-lg" style={{ color: 'var(--text-sub)', fontWeight: 300 }}>
              Fusion was born from a simple frustration: fashion that looked good but felt hollow. We set out to build something different.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-6">
            {[
              "Fusion was born from a simple frustration: fashion that looked good but felt hollow. We set out to build something different — a brand where every piece carries intention, not just aesthetics.",
              "We work directly with artisan manufacturers who share our commitment to craft. No mass production. No compromise on materials. Every Fusion garment is designed to outlast trends — and most wardrobes.",
              "Our design philosophy is subtraction. We remove everything unnecessary until what remains is exactly right. Clothes that work with your life, not against it. Pieces you'll reach for again and again.",
            ].map((text, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <p className="text-base leading-[1.9]" style={{ color: i === 0 ? 'var(--text-sub)' : 'var(--text-muted)' }}>{text}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <FadeUp>
              <SectionLabel>What We Stand For</SectionLabel>
              <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text)' }}>Our Values</h2>
            </FadeUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <FadeUp key={v.title} delay={i * 0.08}>
                <div className="rounded-xl border p-7 h-full transition-shadow hover:shadow-lg" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="text-3xl mb-5" style={{ color: 'var(--accent)' }}>{v.symbol}</div>
                  <h3 className="font-semibold mb-3 text-base" style={{ color: 'var(--text)' }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>{v.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[['2021', 'Year Founded'], ['12', 'Source Countries'], ['2026', 'Net-Zero Target'], ['100%', 'Employee Owned']].map(([n, l], i) => (
            <FadeUp key={l} delay={i * 0.08}>
              <div className="font-serif text-4xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{n}</div>
              <div className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-sub)' }}>{l}</div>
            </FadeUp>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
