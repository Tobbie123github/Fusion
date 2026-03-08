import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { productsAPI } from "../api";
import { MOCK_PRODUCTS, CATEGORIES } from "../api/mockData";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { FadeUp, SectionLabel } from "../components/UI";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    productsAPI
      .getAll()
      .then((d) => {
        const raw = d.data || d || [];
        const mapped = raw.map((p) => ({
          ...p,
          stock: p.instock, // map instock → stock so ProductCard works
        }));
        setProducts(mapped);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const source = products;

  const filtered = source
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <div className="pt-20 min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-14 max-w-7xl mx-auto w-full">
        <FadeUp>
          <SectionLabel>Collection</SectionLabel>
          <h1
            className="font-serif font-bold mb-8"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              color: "var(--text)",
            }}
          >
            All Pieces
          </h1>
        </FadeUp>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 justify-between">
          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-4 py-2 rounded-full text-xs font-medium tracking-widest uppercase border transition-all duration-200"
                style={{
                  background:
                    category === cat ? "var(--accent)" : "var(--surface)",
                  color: category === cat ? "var(--bg)" : "var(--text-sub)",
                  borderColor:
                    category === cat ? "var(--accent)" : "var(--border)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-md border text-sm w-44"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-md border text-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {/* Grid */}
      <div className="flex-1 px-6 pb-24 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
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
                      delay: i * 0.08,
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
                        delay: i * 0.08,
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
                        delay: i * 0.08,
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
            ))}
          </div>
        ) : (
          <>
            <p
              className="text-xs tracking-widest mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}{" "}
              found
            </p>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="text-5xl mb-4 opacity-20">◯</div>
                <p className="text-sm" style={{ color: "var(--text-sub)" }}>
                  No pieces match your filters
                </p>
                <button
                  onClick={() => {
                    setCategory("All");
                    setSearch("");
                  }}
                  className="mt-4 text-xs tracking-widest uppercase underline underline-offset-4"
                  style={{
                    color: "var(--accent)",
                    background: "none",
                    border: "none",
                  }}
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <div className="product-grid">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
