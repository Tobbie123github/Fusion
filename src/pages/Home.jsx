import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { productsAPI } from "../api";
import { MOCK_PRODUCTS } from "../api/mockData";
import ProductCard from "../components/ProductCard";
import { FadeUp, SectionLabel, Button } from "../components/UI";
import Footer from "../components/Footer";

const STATS = [
  ["10K+", "Happy Customers"],
  ["50+", "Premium Materials"],
  ["100%", "Sustainable Sourcing"],
  ["2021", "Founded"],
];

const FEATURES = [
  {
    icon: "◈",
    title: "Premium Fabrics",
    desc: "Sourced from 12 countries, chosen for longevity and feel.",
  },
  {
    icon: "◉",
    title: "Ethical Production",
    desc: "Manufactured in certified facilities with fair wages.",
  },
  {
    icon: "◎",
    title: "Free Returns",
    desc: "30-day hassle-free returns on all orders.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI
      .getAll()
      .then((d) => {
        const raw = d.data || d || [];
        const mapped = raw.map((p) => ({ ...p, stock: p.instock }));
        setProducts(mapped);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false)); // ← add this
  }, []);

  const featured = (
    products.filter((p) => p.featured === true).length > 0
      ? products.filter((p) => p.featured === true)
      : products
  ).slice(0, 4);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20 pb-16">
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 79px, var(--border) 79px, var(--border) 80px),
              repeating-linear-gradient(90deg, transparent, transparent 79px, var(--border) 79px, var(--border) 80px)
            `,
          }}
        />
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 40%, var(--accent)0d 0%, transparent 70%)",
          }}
        />

        <div className="relative text-center max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs tracking-[0.4em] uppercase font-medium mb-6"
            style={{ color: "var(--accent)" }}
          >
            ✦ New Collection 2025
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-bold leading-[0.92] tracking-tight mb-8"
            style={{
              fontSize: "clamp(3.5rem, 11vw, 9rem)",
              color: "var(--text)",
            }}
          >
            Wear the
            <br />
            <em className="italic" style={{ color: "var(--accent)" }}>
              Difference
            </em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base leading-relaxed mb-10 mx-auto max-w-md"
            style={{ color: "var(--text-sub)", fontWeight: 300 }}
          >
            Precision-crafted essentials for those who exist beyond trends.
            Elevated basics, intentional design.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Button size="lg" onClick={() => navigate("/shop")}>
              Shop Now <ArrowRight size={14} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/about")}
            >
              Our Story
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: 0.4 }}
        >
          <span
            className="text-xs tracking-[0.3em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Scroll
          </span>
          <motion.div
            className="w-px h-10"
            style={{ background: "var(--text-muted)" }}
            animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </section>

      {/* ── Featured Products ── */}
      {/* ── Featured Products ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <FadeUp>
              <SectionLabel>Curated</SectionLabel>
              <h2
                className="font-serif font-bold"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  color: "var(--text)",
                }}
              >
                Featured Pieces
              </h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <button
                onClick={() => navigate("/shop")}
                className="flex items-center gap-2 text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
                style={{
                  color: "var(--text-sub)",
                  background: "none",
                  border: "none",
                }}
              >
                View All <ArrowRight size={14} />
              </button>
            </FadeUp>
          </div>

          <div className="product-grid">
            {loading
              ? // Skeleton cards
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border overflow-hidden"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {/* Image skeleton */}
                    <div
                      style={{
                        aspectRatio: "3/4",
                        background: "var(--surface)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: "linear",
                          delay: i * 0.15,
                        }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(90deg, transparent, var(--border), transparent)",
                          opacity: 0.6,
                        }}
                      />
                    </div>
                    {/* Text skeleton */}
                    <div style={{ padding: "1rem 1.1rem 1.25rem" }}>
                      <div
                        style={{
                          height: 12,
                          borderRadius: 6,
                          background: "var(--surface)",
                          marginBottom: "0.6rem",
                          width: "70%",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 0.15,
                          }}
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(90deg, transparent, var(--border), transparent)",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          height: 10,
                          borderRadius: 6,
                          background: "var(--surface)",
                          width: "40%",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 0.15,
                          }}
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(90deg, transparent, var(--border), transparent)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              : featured.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section
        className="py-20 px-6 border-y"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {STATS.map(([num, label], i) => (
            <FadeUp key={label} delay={i * 0.08}>
              <div
                className="font-serif text-4xl font-bold mb-1"
                style={{ color: "var(--accent)" }}
              >
                {num}
              </div>
              <div
                className="text-xs tracking-widest uppercase"
                style={{ color: "var(--text-sub)" }}
              >
                {label}
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <FadeUp>
              <SectionLabel>Why Fusion</SectionLabel>
              <h2
                className="font-serif font-bold"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  color: "var(--text)",
                }}
              >
                Built Different
              </h2>
            </FadeUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.1}>
                <div
                  className="rounded-xl border p-8 transition-shadow hover:shadow-xl"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="text-3xl mb-4"
                    style={{ color: "var(--accent)" }}
                  >
                    {f.icon}
                  </div>
                  <h3
                    className="font-semibold text-base mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-sub)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 text-center">
        <FadeUp>
          <SectionLabel>Members Only</SectionLabel>
          <h2
            className="font-serif font-bold mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)", color: "var(--text)" }}
          >
            Join the Inner Circle
          </h2>
          <p
            className="text-sm leading-relaxed mb-10 mx-auto max-w-sm"
            style={{ color: "var(--text-sub)" }}
          >
            Early access to drops, exclusive member pricing, and curated style
            edits delivered to your inbox.
          </p>
          <Button size="lg" onClick={() => navigate("/register")}>
            Create Account <ArrowRight size={14} />
          </Button>
        </FadeUp>
      </section>

      <Footer />
    </div>
  );
}
