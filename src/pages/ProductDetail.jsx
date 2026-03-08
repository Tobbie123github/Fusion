import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { productsAPI } from "../api";
import { MOCK_PRODUCTS } from "../api/mockData";
import { useCartStore } from "../context/store";
import { Spinner, Divider } from "../components/UI";
import toast from "react-hot-toast";

// ─── 3D TILT MAIN IMAGE ───────────────────────────────────────────────────────
function TiltImage({ src, alt, onZoom }) {
  const ref = useRef();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width - 0.5;
    setTilt({ x: -x * 14, y: y * 14 });
  };

  const reset = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={reset}
      style={{
        perspective: 900,
        cursor: "zoom-in",
        borderRadius: "1.25rem",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: hovered ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          transformStyle: "preserve-3d",
          borderRadius: "1.25rem",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            aspectRatio: "4/5",
            objectFit: "cover",
            display: "block",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        />

        {/* Shine overlay */}
        <motion.div
          animate={{
            opacity: hovered ? 0.12 : 0,
            background: `radial-gradient(circle at ${50 + tilt.y * 4}% ${50 - tilt.x * 4}%, rgba(255,255,255,0.9), transparent 65%)`,
          }}
          transition={{ duration: 0.15 }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />

        {/* Zoom button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            onZoom();
          }}
          style={{
            position: "absolute",
            bottom: "1rem",
            right: "1rem",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            borderRadius: "0.5rem",
            padding: "0.45rem 0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          <ZoomIn size={13} /> Zoom
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIdx((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [images.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          width: 40,
          height: 40,
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "1.1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ✕
      </button>

      {/* Counter */}
      <div
        style={{
          position: "absolute",
          top: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.45)",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
        }}
      >
        {idx + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIdx((i) => (i - 1 + images.length) % images.length);
          }}
          style={{
            position: "absolute",
            left: "1.5rem",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            width: 44,
            height: 44,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Main image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={images[idx]}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxHeight: "85vh",
            maxWidth: "80vw",
            objectFit: "contain",
            borderRadius: "0.75rem",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          }}
        />
      </AnimatePresence>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIdx((i) => (i + 1) % images.length);
          }}
          style={{
            position: "absolute",
            right: "1.5rem",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            width: 44,
            height: 44,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Thumbnail strip in lightbox */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "1.75rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIdx(i);
              }}
              style={{
                width: i === idx ? 48 : 36,
                height: i === idx ? 56 : 44,
                borderRadius: "0.4rem",
                overflow: "hidden",
                padding: 0,
                border: `2px solid ${i === idx ? "#fff" : "rgba(255,255,255,0.2)"}`,
                cursor: "pointer",
                transition: "all 0.25s ease",
                flexShrink: 0,
              }}
            >
              <img
                src={img}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    const mock = MOCK_PRODUCTS.find((p) => p.id === parseInt(id));
    productsAPI
      .getById(id)
      .then((d) => setProduct(d.data || d || mock))
      .catch(() => setProduct(mock))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size first", {
        style: {
          background: "var(--card)",
          color: "var(--text)",
          border: "1px solid var(--border)",
        },
      });
      return;
    }
    addItem(product, selectedSize, qty);
    setAdded(true);
    toast.success(`${product.name} added to cart`, {
      style: {
        background: "var(--card)",
        color: "var(--text)",
        border: "1px solid var(--border)",
      },
      iconTheme: { primary: "var(--accent)", secondary: "var(--bg)" },
    });
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading)
    return (
      <div className="pt-32">
        <Spinner size="lg" className="py-20" />
      </div>
    );
  if (!product)
    return (
      <div className="pt-32 text-center py-20">
        <p style={{ color: "var(--text-sub)" }}>Product not found</p>
        <button
          onClick={() => navigate("/shop")}
          className="mt-4 text-sm underline"
          style={{ color: "var(--accent)", background: "none", border: "none" }}
        >
          Back to Shop
        </button>
      </div>
    );

  const images = product.imageUrl?.length > 0 ? product.imageUrl : null;
  const instock = product.instock ?? product.stock ?? 0;

  return (
    <>
      <div className="pt-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs tracking-widest uppercase mb-10 transition-opacity hover:opacity-60"
            style={{
              color: "var(--text-sub)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* ── LEFT: Gallery ── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Main image */}
              {images ? (
                <TiltImage
                  src={images[activeImg]}
                  alt={product.name}
                  onZoom={() => setLightbox(true)}
                />
              ) : (
                <div
                  className="rounded-2xl"
                  style={{
                    aspectRatio: "4/5",
                    background: `linear-gradient(135deg, ${(product.gradient || ["#1a1a2e", "#e94560"])[0]}, ${(product.gradient || ["#1a1a2e", "#e94560"])[1]})`,
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "1.5rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "serif",
                      color: "rgba(255,255,255,0.2)",
                      fontSize: "0.7rem",
                      letterSpacing: "0.3em",
                    }}
                  >
                    FUSION
                  </span>
                </div>
              )}

              {/* Thumbnails */}
              {images && images.length > 1 && (
                <div style={{ marginTop: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.65rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {images.map((img, i) => (
                      <motion.button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        whileHover={{ y: -3, scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          width: 72,
                          height: 88,
                          borderRadius: "0.6rem",
                          overflow: "hidden",
                          padding: 0,
                          cursor: "pointer",
                          border: `2px solid ${activeImg === i ? "var(--accent)" : "var(--border)"}`,
                          background: "var(--surface)",
                          flexShrink: 0,
                          position: "relative",
                          transition: "border-color 0.2s",
                        }}
                      >
                        <img
                          src={img}
                          alt={`view ${i + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        {activeImg === i && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "var(--accent)",
                              opacity: 0.15,
                              pointerEvents: "none",
                            }}
                          />
                        )}
                      </motion.button>
                    ))}

                    {/* View all button */}
                    <motion.button
                      onClick={() => setLightbox(true)}
                      whileHover={{ y: -3 }}
                      style={{
                        width: 72,
                        height: 88,
                        borderRadius: "0.6rem",
                        border: "2px dashed var(--border)",
                        background: "var(--surface)",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <ZoomIn size={14} />
                      <span
                        style={{
                          fontSize: "0.55rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        All
                      </span>
                    </motion.button>
                  </div>

                  {/* Progress bar dots */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        style={{
                          height: 3,
                          width: activeImg === i ? 24 : 8,
                          borderRadius: 2,
                          background:
                            activeImg === i ? "var(--accent)" : "var(--border)",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          transition: "all 0.25s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* ── RIGHT: Info ── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="pt-4"
            >
              {/* Category + stock */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <span
                  className="text-xs tracking-widest uppercase font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  {product.category}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    padding: "0.25rem 0.7rem",
                    borderRadius: "2rem",
                    background: instock <= 5 ? "#ef444420" : "#22c55e20",
                    color: instock <= 5 ? "#ef4444" : "#22c55e",
                  }}
                >
                  {instock <= 0
                    ? "Out of Stock"
                    : instock <= 5
                      ? `Only ${instock} left`
                      : "In Stock"}
                </span>
              </div>

              <h1
                className="font-serif font-bold leading-tight mb-4"
                style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                  color: "var(--text)",
                }}
              >
                {product.name}
              </h1>

              {/* Price */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                <span
                  className="font-serif font-bold"
                  style={{ fontSize: "2rem", color: "var(--accent)" }}
                >
                  ${product.discount > 0 ? product.discount : product.price}
                </span>
                {product.discount > 0 && (
                  <>
                    <span
                      style={{
                        fontSize: "1.1rem",
                        color: "var(--text-muted)",
                        textDecoration: "line-through",
                      }}
                    >
                      ${product.price}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: "#ef444420",
                        color: "#ef4444",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "0.3rem",
                      }}
                    >
                      -
                      {Math.round((1 - product.discount / product.price) * 100)}
                      % OFF
                    </span>
                  </>
                )}
              </div>

              <p
                className="text-sm leading-[1.85] mb-8"
                style={{ color: "var(--text-sub)" }}
              >
                {product.description}
              </p>

              <Divider className="mb-8" />

              {/* Size selector — always shown for every product */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <p
                    className="text-xs tracking-widest uppercase font-medium"
                    style={{ color: "var(--text-sub)" }}
                  >
                    Select Size
                    {!selectedSize && (
                      <span style={{ color: "#ef4444", marginLeft: "0.4rem" }}>
                        *
                      </span>
                    )}
                  </p>
                  <button
                    className="text-xs underline underline-offset-2"
                    style={{
                      color: "var(--text-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(product.sizes?.length > 0
                    ? product.sizes
                    : ["XS", "S", "M", "L", "XL", "XXL"]
                  ).map((s) => (
                    <motion.button
                      key={s}
                      onClick={() =>
                        setSelectedSize(selectedSize === s ? null : s)
                      }
                      whileTap={{ scale: 0.93 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "0.5rem",
                        border: `1px solid ${selectedSize === s ? "var(--accent)" : "var(--border)"}`,
                        background:
                          selectedSize === s
                            ? "var(--accent)"
                            : "var(--surface)",
                        color: selectedSize === s ? "var(--bg)" : "var(--text)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow:
                          selectedSize === s
                            ? "0 4px 14px var(--accent)40"
                            : "none",
                        transition: "all 0.15s",
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
                {selectedSize && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--accent)",
                      marginTop: "0.5rem",
                    }}
                  >
                    ✓ Size {selectedSize} selected
                  </motion.p>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-8">
                <p
                  className="text-xs tracking-widest uppercase font-medium"
                  style={{ color: "var(--text-sub)" }}
                >
                  Qty
                </p>
                <div
                  className="flex items-center border rounded-lg overflow-hidden"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-3 hover:opacity-60"
                    style={{
                      color: "var(--text)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1rem",
                    }}
                  >
                    −
                  </button>
                  <span
                    className="w-10 text-center text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(instock || 99, qty + 1))}
                    className="px-4 py-3 hover:opacity-60"
                    style={{
                      color: "var(--text)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1rem",
                    }}
                  >
                    +
                  </button>
                </div>
                {instock > 0 && (
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {instock} available
                  </span>
                )}
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleAddToCart}
                disabled={instock <= 0}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-bold tracking-widest uppercase"
                style={{
                  background: added
                    ? "var(--accent-dim)"
                    : instock <= 0
                      ? "var(--border)"
                      : "var(--accent)",
                  color: instock <= 0 ? "var(--text-muted)" : "var(--bg)",
                  border: "none",
                  cursor: instock <= 0 ? "not-allowed" : "pointer",
                  transition: "background 0.25s",
                }}
              >
                {added ? (
                  <>
                    <Check size={16} /> Added to Cart
                  </>
                ) : instock <= 0 ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingBag size={16} /> Add to Cart
                  </>
                )}
              </motion.button>

              {/* Trust badges */}
              {/* <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  ["🚚", "Free Shipping", "Orders over $150"],
                  ["↩️", "Easy Returns", "30 days, no questions"],
                  ["✅", "Authentic", "100% genuine products"],
                  ["🔒", "Secure Pay", "Encrypted checkout"],
                ].map(([icon, title, sub]) => (
                  <div
                    key={title}
                    className="flex gap-3 items-start rounded-xl border p-3"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <span style={{ fontSize: "1rem", lineHeight: 1 }}>
                      {icon}
                    </span>
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "var(--text)", marginBottom: "0.1rem" }}
                      >
                        {title}
                      </p>
                      <p
                        style={{
                          fontSize: "0.63rem",
                          color: "var(--text-muted)",
                          lineHeight: 1.4,
                        }}
                      >
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div> */}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && images && (
          <Lightbox
            images={images}
            startIndex={activeImg}
            onClose={() => setLightbox(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
