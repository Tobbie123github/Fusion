import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Eye,
  X,
  Check,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  LogOut,
  ChevronRight,
  DollarSign,
  Activity,
  Star,
  CreditCard,
  Menu,
} from "lucide-react";
import { productsAPI, ordersAPI, paymentsAPI } from "../api";
import { useAuthStore } from "../context/store";
import { Badge, Spinner, Card, Divider } from "../components/UI";
import toast from "react-hot-toast";

// ─── RESPONSIVE HOOK ──────────────────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false });
  useEffect(() => {
    const update = () =>
      setBp({
        isMobile: window.innerWidth < 640,
        isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
      });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  paid: "green",
  pending: "yellow",
  completed: "green",
  failed: "red",
  cancelled: "gray",
  processing: "yellow",
};
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
];
const inputStyle = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  padding: "0.75rem 1rem",
  color: "var(--text)",
  fontSize: "0.86rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
const labelStyle = {
  display: "block",
  fontSize: "0.67rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--text-sub)",
  marginBottom: "0.4rem",
  fontWeight: 500,
};

// ─── ANALYTICS HELPERS ────────────────────────────────────────────────────────
const fmt = (n) => `₦${Number(n).toLocaleString()}`;
const fmtK = (n) => (n >= 1000 ? `₦${(n / 1000).toFixed(1)}k` : fmt(n));
const COLORS = { paid: "#22c55e", pending: "#f59e0b", failed: "#ef4444" };

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = "var(--accent)", height = 40 }) {
  if (!data?.length) return null;
  const max = Math.max(...data, 1),
    min = Math.min(...data);
  const w = 120,
    h = height;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const id = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
    </svg>
  );
}

// ─── DONUT CHART ─────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 140 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (!total)
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "var(--surface)",
        }}
      />
    );
  const r = 45,
    cx = 60,
    cy = 60,
    circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--surface)"
        strokeWidth="18"
      />
      {segments.map((seg, i) => {
        const pct = seg.value / total,
          dash = pct * circ,
          gap = circ - dash;
        const rot = offset * 360 - 90;
        offset += pct;
        return (
          <motion.circle
            key={seg.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            transform={`rotate(${rot} ${cx} ${cy})`}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{
              duration: 1,
              delay: i * 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        );
      })}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="var(--text)"
        fontFamily="'Playfair Display', Georgia, serif"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize="7"
        fill="var(--text-muted)"
        letterSpacing="1"
      >
        TOTAL
      </text>
    </svg>
  );
}

// ─── BAR CHART ───────────────────────────────────────────────────────────────
function BarChart({ data, height = 160, color = "var(--accent)" }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "0.4rem",
        height,
        paddingTop: "0.5rem",
      }}
    >
      {data.map((d, i) => (
        <div
          key={d.label}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.35rem",
            height: "100%",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            {d.value > 0 ? fmtK(d.value) : ""}
          </span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * (height - 32)}px` }}
            transition={{
              duration: 0.7,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              width: "100%",
              borderRadius: "4px 4px 2px 2px",
              background: d.highlight ? color : `${color}55`,
              minHeight: d.value > 0 ? 4 : 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {d.highlight && (
              <motion.div
                animate={{ y: ["100%", "-100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, transparent, rgba(255,255,255,0.15), transparent)",
                }}
              />
            )}
          </motion.div>
          <span
            style={{
              fontSize: "0.6rem",
              color: "var(--text-muted)",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── HORIZONTAL BAR ──────────────────────────────────────────────────────────
function HBar({ label, value, max, color, suffix = "" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: "0.85rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.3rem",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--text)" }}>
          {label}
        </span>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color }}>
          {suffix || value}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: "var(--surface)",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", borderRadius: 3, background: color }}
        />
      </div>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color = "var(--accent)",
  spark,
  change,
  changeLabel,
}) {
  const isPositive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        padding: "1.25rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: color,
          opacity: 0.07,
          filter: "blur(20px)",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.85rem",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "0.6rem",
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        {change !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: isPositive ? "#22c55e" : "#ef4444",
            }}
          >
            {isPositive ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.6rem",
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: "0.2rem",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
        {label}
      </div>
      {changeLabel && (
        <div
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            marginTop: "0.2rem",
          }}
        >
          {changeLabel}
        </div>
      )}
      {spark && (
        <div style={{ marginTop: "0.75rem" }}>
          <Sparkline data={spark} color={color} />
        </div>
      )}
    </motion.div>
  );
}

// ─── IMAGE UPLOAD ZONE ───────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function ImageUploadZone({
  files,
  existingUrls,
  onAdd,
  onRemoveNew,
  onRemoveExisting,
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFiles = (incoming) => {
    const valid = [];
    Array.from(incoming).forEach((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image`);
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} exceeds 2MB limit`);
        return;
      }
      valid.push(f);
    });
    if (valid.length) onAdd(valid);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };
  const onPick = (e) => processFiles(e.target.files);
  const totalCount = (existingUrls?.length || 0) + files.length;

  return (
    <div>
      <label style={labelStyle}>Product Images</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "0.75rem",
          padding: "1.5rem",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "var(--accent)08" : "var(--surface)",
          transition: "all 0.2s",
          marginBottom: "0.75rem",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPick}
          style={{ display: "none" }}
        />
        <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>🖼️</div>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--text)",
            fontWeight: 600,
            marginBottom: "0.2rem",
          }}
        >
          {dragging ? "Drop images here" : "Click or drag images here"}
        </p>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          PNG, JPG, WEBP · Max 5MB each
        </p>
      </div>
      {totalCount > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
            gap: "0.6rem",
          }}
        >
          {existingUrls?.map((url, i) => (
            <div
              key={`existing-${i}`}
              style={{
                position: "relative",
                borderRadius: "0.5rem",
                overflow: "hidden",
                aspectRatio: "1",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveExisting(i);
                }}
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <X size={11} />
              </button>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "rgba(0,0,0,0.45)",
                  padding: "2px 4px",
                }}
              >
                <p
                  style={{
                    fontSize: "0.55rem",
                    color: "#fff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  saved
                </p>
              </div>
            </div>
          ))}
          {files.map((f, i) => (
            <div
              key={`new-${i}`}
              style={{
                position: "relative",
                borderRadius: "0.5rem",
                overflow: "hidden",
                aspectRatio: "1",
                background: "var(--surface)",
                border: "2px solid var(--accent)40",
              }}
            >
              <img
                src={URL.createObjectURL(f)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveNew(i);
                }}
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <X size={11} />
              </button>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "rgba(0,0,0,0.45)",
                  padding: "2px 4px",
                }}
              >
                <p
                  style={{
                    fontSize: "0.55rem",
                    color: "#fff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(f.size / 1024).toFixed(0)}KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PRODUCT MODAL ────────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSave }) {
  const isEdit = !!product?.id;
  const [loading, setLoading] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [existingUrls, setExistingUrls] = useState(product?.imageUrl || []);
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    discount: product?.discount || "",
    category: product?.category || "Clothing",
    instock: product?.instock || "",
    featured: product?.featured || false,
  });

  const setField = (k) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.instock) {
      toast.error("Name, price and stock are required");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", String(parseFloat(form.price)));
      fd.append("discount", String(parseFloat(form.discount) || 0));
      fd.append("category", form.category);
      fd.append("instock", String(parseInt(form.instock)));
      fd.append("featured", form.featured ? "true" : "false");
      if (form.size) fd.append("size", form.size);
      newFiles.forEach((f) => fd.append("files", f));
      existingUrls.forEach((url) => fd.append("existingUrls", url));
      if (isEdit) {
        await productsAPI.update(product.id, fd);
        toast.success("Product updated");
      } else {
        await productsAPI.create(fd);
        toast.success("Product created");
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save product",
      );
    } finally {
      setLoading(false);
    }
  };

  const CATEGORIES = ["Clothing", "Wears", "Accessories"];
  const focus = (e) => (e.target.style.borderColor = "var(--accent)");
  const blur = (e) => (e.target.style.borderColor = "var(--border)");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem 1.25rem 0 0",
          padding: "1.5rem",
          width: "100%",
          maxWidth: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "var(--border)",
            margin: "0 auto 1.25rem",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: "0.2rem",
              }}
            >
              {isEdit ? "Edit" : "New"} Product
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              {isEdit ? product.name : "Add Product"}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              padding: "0.5rem",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Product Name *</label>
            <input
              value={form.name}
              onChange={setField("name")}
              placeholder="Gucci Coat"
              style={inputStyle}
              onFocus={focus}
              onBlur={blur}
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={setField("description")}
              placeholder="Product description..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              onFocus={focus}
              onBlur={blur}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div>
              <label style={labelStyle}>Price (₦) *</label>
              <input
                type="number"
                value={form.price}
                onChange={setField("price")}
                placeholder="10000"
                style={inputStyle}
                onFocus={focus}
                onBlur={blur}
              />
            </div>
            <div>
              <label style={labelStyle}>Discount (₦)</label>
              <input
                type="number"
                value={form.discount}
                onChange={setField("discount")}
                placeholder="8000"
                style={inputStyle}
                onFocus={focus}
                onBlur={blur}
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={form.category}
                onChange={setField("category")}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={focus}
                onBlur={blur}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Stock *</label>
              <input
                type="number"
                value={form.instock}
                onChange={setField("instock")}
                placeholder="20"
                style={inputStyle}
                onFocus={focus}
                onBlur={blur}
              />
            </div>
          </div>

          <ImageUploadZone
            files={newFiles}
            existingUrls={existingUrls}
            onAdd={(incoming) => setNewFiles((prev) => [...prev, ...incoming])}
            onRemoveNew={(i) =>
              setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
            }
            onRemoveExisting={(i) =>
              setExistingUrls((prev) => prev.filter((_, idx) => idx !== i))
            }
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
              padding: "0.5rem 0",
            }}
          >
            <div
              onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
              style={{
                width: 20,
                height: 20,
                borderRadius: "0.3rem",
                border: "1px solid var(--border)",
                background: form.featured ? "var(--accent)" : "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {form.featured && (
                <Check size={12} style={{ color: "var(--bg)" }} />
              )}
            </div>
            <span style={{ fontSize: "0.82rem", color: "var(--text-sub)" }}>
              Mark as Featured Product
            </span>
          </label>

          <Divider />
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.9rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                background: "none",
                color: "var(--text-sub)",
                fontSize: "0.78rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 2,
                padding: "0.9rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "var(--accent)",
                color: "var(--bg)",
                fontSize: "0.78rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {loading ? <Spinner size="sm" /> : <Check size={14} />}
              {loading
                ? "Saving..."
                : isEdit
                  ? "Update Product"
                  : "Create Product"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── DELETE MODAL ─────────────────────────────────────────────────────────────
function DeleteModal({ name, onClose, onConfirm, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
          padding: "2rem",
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#ef444420",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}
        >
          <Trash2 size={22} style={{ color: "#ef4444" }} />
        </div>
        <h3
          style={{
            fontWeight: 700,
            color: "var(--text)",
            fontSize: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          Delete Product
        </h3>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            marginBottom: "1.5rem",
            lineHeight: 1.6,
          }}
        >
          Are you sure you want to delete{" "}
          <strong style={{ color: "var(--text)" }}>{name}</strong>? This cannot
          be undone.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "0.85rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border)",
              background: "none",
              color: "var(--text-sub)",
              fontSize: "0.78rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.85rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#ef4444",
              color: "#fff",
              fontSize: "0.78rem",
              cursor: "pointer",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {loading ? <Spinner size="sm" /> : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────
function Dashboard({ products, orders }) {
  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const lowStock = products.filter((p) => (p.instock || 0) <= 10).length;
  const featuredCount = products.filter((p) => p.featured).length;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <p
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "0.3rem",
          }}
        >
          Overview
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          Dashboard
        </h1>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <StatCard
          label="Total Revenue"
          value={`₦${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="#22c55e"
        />
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          color="var(--accent)"
        />
        <StatCard
          label="Products"
          value={products.length}
          icon={Package}
          color="#6366f1"
        />
        <StatCard
          label="Pending Orders"
          value={pendingOrders}
          icon={Activity}
          color="#f59e0b"
        />
        <StatCard
          label="Low Stock"
          value={lowStock}
          icon={AlertCircle}
          color="#ef4444"
        />
        <StatCard
          label="Featured"
          value={featuredCount}
          icon={Star}
          color="#ec4899"
        />
      </div>
      <Card style={{ padding: "1.25rem" }}>
        <h3
          style={{
            fontWeight: 600,
            color: "var(--text)",
            fontSize: "0.9rem",
            marginBottom: "1rem",
          }}
        >
          Recent Orders
        </h3>
        {recentOrders.length === 0 ? (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.82rem",
              textAlign: "center",
              padding: "2rem 0",
            }}
          >
            No orders yet
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            {recentOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  borderRadius: "0.65rem",
                  background: "var(--surface)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.6rem",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "0.5rem",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ShoppingBag size={13} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      #{order.id?.slice(-6).toUpperCase()}
                    </p>
                    <p
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {order.items?.length || 0} items
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--accent)",
                    }}
                  >
                    ₦{order.total?.toLocaleString()}
                  </p>
                  <Badge color={STATUS_COLOR[order.status] || "yellow"}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── PRODUCTS TAB ─────────────────────────────────────────────────────────────
function Products({ products, onRefresh }) {
  const { isMobile } = useBreakpoint();
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productsAPI.delete(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const focus = (e) => (e.target.style.borderColor = "var(--accent)");
  const blur = (e) => (e.target.style.borderColor = "var(--border)");

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "0.3rem",
            }}
          >
            Catalogue
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Products
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            alignItems: "center",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              ...inputStyle,
              flex: 1,
              minWidth: 0,
              padding: "0.6rem 0.9rem",
            }}
            onFocus={focus}
            onBlur={blur}
          />
          <button
            onClick={() => setModal("add")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "var(--accent)",
              color: "var(--bg)",
              border: "none",
              padding: "0.65rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.78rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <Card>
        {isMobile ? (
          // Mobile: card-style list
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                No products found
              </p>
            ) : (
              filtered.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    padding: "0.9rem 1rem",
                    borderBottom: "1px solid var(--border)",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 56,
                      borderRadius: "0.4rem",
                      overflow: "hidden",
                      background: "var(--surface)",
                      flexShrink: 0,
                    }}
                  >
                    {product.imageUrl?.[0] ? (
                      <img
                        src={product.imageUrl[0]}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "var(--border)",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {product.category}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        marginTop: "0.3rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "var(--accent)",
                        }}
                      >
                        ₦{product.price?.toLocaleString()}
                      </span>
                      {product.discount > 0 && (
                        <span style={{ fontSize: "0.72rem", color: "#22c55e" }}>
                          → ₦{product.discount?.toLocaleString()}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color:
                            product.instock <= 10
                              ? "#ef4444"
                              : "var(--text-muted)",
                        }}
                      >
                        Stock: {product.instock}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => setModal(product)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "0.4rem",
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        color: "var(--text-sub)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "0.4rem",
                        border: "1px solid #ef444430",
                        background: "#ef444410",
                        color: "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Desktop: table
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr 100px 100px 80px 100px 100px",
                gap: "1rem",
                padding: "0.85rem 1.25rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {[
                "Image",
                "Product",
                "Price",
                "Discount",
                "Stock",
                "Status",
                "Actions",
              ].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                No products found
              </div>
            ) : (
              filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "60px 1fr 100px 100px 80px 100px 100px",
                    gap: "1rem",
                    padding: "1rem 1.25rem",
                    alignItems: "center",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 56,
                      borderRadius: "0.4rem",
                      overflow: "hidden",
                      background: "var(--surface)",
                      flexShrink: 0,
                    }}
                  >
                    {product.imageUrl?.[0] ? (
                      <img
                        src={product.imageUrl[0]}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "var(--border)",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {product.category}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    ₦{product.price?.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color:
                        product.discount > 0 ? "#22c55e" : "var(--text-muted)",
                    }}
                  >
                    {product.discount > 0
                      ? `₦${product.discount?.toLocaleString()}`
                      : "—"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: product.instock <= 10 ? "#ef4444" : "var(--text)",
                    }}
                  >
                    {product.instock}
                  </span>
                  <Badge color={product.featured ? "green" : "gray"}>
                    {product.featured ? "Featured" : "Normal"}
                  </Badge>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      onClick={() => setModal(product)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "0.4rem",
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        color: "var(--text-sub)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "0.4rem",
                        border: "1px solid #ef444430",
                        background: "#ef444410",
                        color: "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}
      </Card>

      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal === "add" ? null : modal}
            onClose={() => setModal(null)}
            onSave={onRefresh}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            name={deleteTarget.name}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
function AdminOrders({ orders }) {
  const { isMobile } = useBreakpoint();
  const [filter, setFilter] = useState("all");
  const filtered = orders.filter(
    (o) => filter === "all" || o.status === filter,
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "0.3rem",
            }}
          >
            Manage
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Orders
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {["all", "pending", "paid", "failed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "2rem",
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 600,
                border: `1px solid ${filter === s ? "var(--accent)" : "var(--border)"}`,
                background: filter === s ? "var(--accent)" : "var(--surface)",
                color: filter === s ? "var(--bg)" : "var(--text-sub)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                No orders found
              </p>
            ) : (
              filtered.map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: "0.9rem 1rem",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        fontFamily: "monospace",
                      }}
                    >
                      #{order.id?.slice(-6).toUpperCase()}
                    </span>
                    <Badge color={STATUS_COLOR[order.status] || "yellow"}>
                      {order.status}
                    </Badge>
                  </div>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      marginBottom: "0.3rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {order.delivery?.fullName} · {order.delivery?.city}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      ₦{order.total?.toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "130px 1fr 120px 100px 120px",
                gap: "1rem",
                padding: "0.85rem 1.25rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {["Order ID", "Items", "Total", "Status", "Date"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {filtered.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                No orders found
              </p>
            ) : (
              filtered.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "130px 1fr 120px 100px 120px",
                    gap: "1rem",
                    padding: "1rem 1.25rem",
                    alignItems: "center",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      fontFamily: "monospace",
                    }}
                  >
                    #{order.id?.slice(-6).toUpperCase()}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.items?.map((i) => i.name).join(", ")}
                    </p>
                    <p
                      style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                    >
                      {order.delivery?.fullName} · {order.delivery?.city}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "var(--accent)",
                    }}
                  >
                    ₦{order.total?.toLocaleString()}
                  </span>
                  <Badge color={STATUS_COLOR[order.status] || "yellow"}>
                    {order.status}
                  </Badge>
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </motion.div>
              ))
            )}
          </>
        )}
      </Card>
    </div>
  );
}

// ─── ANALYTICS TAB ────────────────────────────────────────────────────────────
function Analytics({ products, orders }) {
  const { isMobile } = useBreakpoint();
  const [payments, setPayments] = useState([]);
  const [loadingPay, setLoadingPay] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
  const [activeTab, setActiveTab] = useState("revenue");

  useEffect(() => {
    paymentsAPI
      .getAllAdmin()
      .then((d) => setPayments(Array.isArray(d?.data) ? d.data : []))
      .catch(() => setPayments([]))
      .finally(() => setLoadingPay(false));
  }, []);

  const filterByTime = (items, field = "createdAt") => {
    if (timeRange === "all") return items;
    const now = new Date(),
      from = new Date();
    if (timeRange === "today") from.setHours(0, 0, 0, 0);
    if (timeRange === "week") from.setDate(now.getDate() - 7);
    if (timeRange === "month") from.setMonth(now.getMonth() - 1);
    return items.filter((i) => new Date(i[field]) >= from);
  };

  const filteredOrders = filterByTime(orders);
  const filteredPayments = filterByTime(payments);
  const paidPayments = filteredPayments.filter((p) => p.status === "paid");
  const totalRevenue = paidPayments.reduce((s, p) => s + p.amount, 0);
  const pendingRev = filteredPayments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);
  const avgOrderVal = paidPayments.length
    ? totalRevenue / paidPayments.length
    : 0;
  const conversionRate = filteredPayments.length
    ? Math.round((paidPayments.length / filteredPayments.length) * 100)
    : 0;
  const lowStock = products.filter((p) => p.instock <= 10);
  const outOfStock = products.filter((p) => p.instock === 0);

  const buildRevenueChart = () => {
    const labels = [
      "12a",
      "2a",
      "4a",
      "6a",
      "8a",
      "10a",
      "12p",
      "2p",
      "4p",
      "6p",
      "8p",
      "10p",
    ];
    const buckets = Array(12).fill(0);
    paidPayments.forEach((p) => {
      buckets[Math.floor(new Date(p.createdAt).getHours() / 2)] += p.amount;
    });
    const maxIdx = buckets.indexOf(Math.max(...buckets));
    return labels.map((label, i) => ({
      label,
      value: buckets[i],
      highlight: i === maxIdx,
    }));
  };

  const revenueChartData = buildRevenueChart();
  const payStatusMap = {};
  filteredPayments.forEach((p) => {
    payStatusMap[p.status] = (payStatusMap[p.status] || 0) + 1;
  });
  const donutSegments = Object.entries(payStatusMap).map(([label, value]) => ({
    label,
    value,
    color: COLORS[label] || "var(--border)",
  }));

  const orderStatusMap = {};
  filteredOrders.forEach((o) => {
    orderStatusMap[o.status] = (orderStatusMap[o.status] || 0) + 1;
  });
  const orderDonut = Object.entries(orderStatusMap).map(([label, value]) => ({
    label,
    value,
    color: COLORS[label] || "var(--border)",
  }));

  const productSales = {};
  filteredOrders.forEach((o) =>
    o.items?.forEach((item) => {
      productSales[item.name] =
        (productSales[item.name] || 0) +
        (item.subtotal || item.price * item.quantity);
    }),
  );
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxProductRev = topProducts[0]?.[1] || 1;
  const catMap = {};
  products.forEach((p) => {
    catMap[p.category] = (catMap[p.category] || 0) + 1;
  });
  const maxCat = Math.max(...Object.values(catMap), 1);
  const revSpark = paidPayments.slice(-12).map((p) => p.amount);

  if (loadingPay)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "4rem",
        }}
      >
        <Spinner size="lg" />
      </div>
    );

  const cols = isMobile ? "1fr" : "1fr 1fr";

  const tabBtnStyle = (val) => ({
    padding: isMobile ? "0.55rem 0.65rem" : "0.65rem 1.25rem",
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    border: "none",
    background: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    color: activeTab === val ? "var(--accent)" : "var(--text-muted)",
    borderBottom: `2px solid ${activeTab === val ? "var(--accent)" : "transparent"}`,
    marginBottom: -1,
    whiteSpace: "nowrap",
  });

  const DonutRow = ({ segments }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <DonutChart segments={segments} size={isMobile ? 100 : 140} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.65rem",
        }}
      >
        {segments.map((seg) => (
          <div
            key={seg.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: seg.color,
                }}
              />
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text)",
                  textTransform: "capitalize",
                }}
              >
                {seg.label}
              </span>
            </div>
            <span
              style={{ fontSize: "0.82rem", fontWeight: 700, color: seg.color }}
            >
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "0.3rem",
            }}
          >
            ✦ Live Insights
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Analytics
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.3rem",
            background: "var(--surface)",
            padding: "0.3rem",
            borderRadius: "0.6rem",
            border: "1px solid var(--border)",
          }}
        >
          {[
            ["all", "All"],
            ["today", "Today"],
            ["week", "7d"],
            ["month", "30d"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTimeRange(val)}
              style={{
                padding: "0.35rem 0.6rem",
                borderRadius: "0.4rem",
                fontSize: "0.68rem",
                fontWeight: 600,
                border: "none",
                background: timeRange === val ? "var(--accent)" : "none",
                color: timeRange === val ? "var(--bg)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <StatCard
          label="Total Revenue"
          value={fmt(totalRevenue)}
          icon={DollarSign}
          color="#22c55e"
          spark={revSpark}
        />
        <StatCard
          label="Pending Revenue"
          value={fmt(pendingRev)}
          icon={Activity}
          color="#f59e0b"
        />
        <StatCard
          label="Avg Order Value"
          value={fmt(Math.round(avgOrderVal))}
          icon={TrendingUp}
          color="var(--accent)"
        />
        <StatCard
          label="Conversion"
          value={`${conversionRate}%`}
          icon={CreditCard}
          color="#6366f1"
        />
        <StatCard
          label="Total Orders"
          value={filteredOrders.length}
          icon={ShoppingBag}
          color="#ec4899"
        />
        <StatCard
          label="Low Stock"
          value={lowStock.length}
          icon={AlertCircle}
          color="#ef4444"
        />
      </div>

      <div
        style={{
          display: "flex",
          marginBottom: "1.25rem",
          borderBottom: "1px solid var(--border)",
          overflowX: "auto",
        }}
      >
        {[
          ["revenue", "Revenue"],
          ["orders", "Orders"],
          ["payments", "Payments"],
          ["products", "Products"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setActiveTab(val)}
            style={tabBtnStyle(val)}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "revenue" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: cols,
                gap: "1rem",
              }}
            >
              <Card style={{ padding: "1.25rem", gridColumn: "1 / -1" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.25rem",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontWeight: 700,
                        color: "var(--text)",
                        fontSize: "0.92rem",
                      }}
                    >
                      Revenue by Hour
                    </h3>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        marginTop: "0.2rem",
                      }}
                    >
                      Based on confirmed payments
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      {fmt(totalRevenue)}
                    </p>
                    <p
                      style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                    >
                      total confirmed
                    </p>
                  </div>
                </div>
                <BarChart
                  data={revenueChartData}
                  height={150}
                  color="var(--accent)"
                />
              </Card>
              <Card style={{ padding: "1.25rem" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.92rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  Payment Status
                </h3>
                <DonutRow segments={donutSegments} />
              </Card>
              <Card style={{ padding: "1.25rem" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.92rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  Revenue Breakdown
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {[
                    {
                      label: "Confirmed Revenue",
                      value: totalRevenue,
                      color: "#22c55e",
                      bar: true,
                    },
                    {
                      label: "Pending Revenue",
                      value: pendingRev,
                      color: "#f59e0b",
                      bar: true,
                    },
                    {
                      label: "Avg Transaction",
                      value: Math.round(avgOrderVal),
                      color: "var(--accent)",
                      bar: false,
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.3rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-sub)",
                          }}
                        >
                          {item.label}
                        </span>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: item.color,
                          }}
                        >
                          {fmt(item.value)}
                        </span>
                      </div>
                      {item.bar && (
                        <div
                          style={{
                            height: 5,
                            borderRadius: 3,
                            background: "var(--surface)",
                            overflow: "hidden",
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(item.value / (totalRevenue + pendingRev || 1)) * 100}%`,
                            }}
                            transition={{
                              duration: 0.9,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            style={{
                              height: "100%",
                              borderRadius: 3,
                              background: item.color,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.75rem",
                      borderRadius: "0.6rem",
                      background: "var(--surface)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{ fontSize: "0.78rem", color: "var(--text-sub)" }}
                    >
                      Conversion Rate
                    </span>
                    <span
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: conversionRate >= 50 ? "#22c55e" : "#f59e0b",
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {conversionRate}%
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: cols,
                gap: "1rem",
              }}
            >
              <Card style={{ padding: "1.25rem" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.92rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  Order Status
                </h3>
                <DonutRow segments={orderDonut} />
              </Card>
              <Card style={{ padding: "1.25rem" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.92rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  Order Metrics
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {[
                    {
                      label: "Total Orders",
                      value: filteredOrders.length,
                      color: "var(--accent)",
                    },
                    {
                      label: "Paid",
                      value: filteredOrders.filter((o) => o.status === "paid")
                        .length,
                      color: "#22c55e",
                    },
                    {
                      label: "Pending",
                      value: filteredOrders.filter(
                        (o) => o.status === "pending",
                      ).length,
                      color: "#f59e0b",
                    },
                    {
                      label: "Failed",
                      value: filteredOrders.filter((o) => o.status === "failed")
                        .length,
                      color: "#ef4444",
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.65rem 0.9rem",
                        borderRadius: "0.6rem",
                        background: "var(--surface)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-sub)",
                        }}
                      >
                        {m.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          color: m.color,
                        }}
                      >
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card style={{ padding: "1.25rem", gridColumn: "1 / -1" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.92rem",
                    marginBottom: "1rem",
                  }}
                >
                  Recent Orders
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {[...filteredOrders]
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                    )
                    .slice(0, 8)
                    .map((order) => (
                      <div
                        key={order.id}
                        style={{
                          padding: "0.7rem 0.9rem",
                          borderRadius: "0.6rem",
                          background: "var(--surface)",
                        }}
                      >
                        {isMobile ? (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "0.3rem",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  color: "var(--text)",
                                  fontFamily: "monospace",
                                }}
                              >
                                #{order.id?.slice(-6).toUpperCase()}
                              </span>
                              <Badge
                                color={
                                  {
                                    paid: "green",
                                    pending: "yellow",
                                    failed: "red",
                                  }[order.status] || "gray"
                                }
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {order.delivery?.fullName}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.82rem",
                                  fontWeight: 700,
                                  color: "var(--accent)",
                                }}
                              >
                                ₦{order.total?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "120px 1fr 140px 100px 120px",
                              gap: "1rem",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                color: "var(--text)",
                                fontFamily: "monospace",
                              }}
                            >
                              #{order.id?.slice(-6).toUpperCase()}
                            </span>
                            <span
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--text-muted)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {order.delivery?.fullName} ·{" "}
                              {order.delivery?.city}
                            </span>
                            <span
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                color: "var(--accent)",
                              }}
                            >
                              ₦{order.total?.toLocaleString()}
                            </span>
                            <Badge
                              color={
                                {
                                  paid: "green",
                                  pending: "yellow",
                                  failed: "red",
                                }[order.status] || "gray"
                              }
                            >
                              {order.status}
                            </Badge>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric" },
                                  )
                                : "—"}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "payments" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: cols,
                gap: "1rem",
              }}
            >
              <Card style={{ padding: "1.25rem", gridColumn: "1 / -1" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.92rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  Payment Timeline
                </h3>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    marginBottom: "1.25rem",
                  }}
                >
                  All payments in chronological order
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    maxHeight: 360,
                    overflowY: "auto",
                  }}
                >
                  {[...filteredPayments]
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                    )
                    .map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          justifyContent: "space-between",
                          gap: isMobile ? "0.3rem" : "1rem",
                          alignItems: isMobile ? "flex-start" : "center",
                          padding: "0.75rem 0.9rem",
                          borderRadius: "0.6rem",
                          background: "var(--surface)",
                          borderLeft: `3px solid ${COLORS[p.status] || "var(--border)"}`,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              color: "var(--text)",
                              fontFamily: "monospace",
                            }}
                          >
                            #{p.orderId?.slice(-6).toUpperCase()}
                          </p>
                          <p
                            style={{
                              fontSize: "0.68rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {p.currency}
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: 700,
                              color: COLORS[p.status] || "var(--text)",
                            }}
                          >
                            {fmt(p.amount)}
                          </span>
                          <Badge
                            color={
                              {
                                paid: "green",
                                pending: "yellow",
                                failed: "red",
                              }[p.status] || "gray"
                            }
                          >
                            {p.status}
                          </Badge>
                          {!isMobile && (
                            <span
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {new Date(p.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </Card>
              <Card style={{ padding: "1.25rem" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.92rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  Payment Stats
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {[
                    {
                      label: "Confirmed",
                      value: totalRevenue,
                      count: paidPayments.length,
                      bg: "#22c55e12",
                      border: "#22c55e30",
                      color: "#22c55e",
                    },
                    {
                      label: "Pending",
                      value: pendingRev,
                      count: filteredPayments.filter(
                        (p) => p.status === "pending",
                      ).length,
                      bg: "#f59e0b12",
                      border: "#f59e0b30",
                      color: "#f59e0b",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        padding: "0.9rem",
                        borderRadius: "0.75rem",
                        background: item.bg,
                        border: `1px solid ${item.border}`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: item.color,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: "0.3rem",
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: "1.4rem",
                          fontWeight: 700,
                          color: item.color,
                        }}
                      >
                        {fmt(item.value)}
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: `${item.color}90`,
                        }}
                      >
                        {item.count} payments
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card style={{ padding: "1.25rem" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.92rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  Conversion Funnel
                </h3>
                {[
                  {
                    label: "Total Initiated",
                    value: filteredPayments.length,
                    color: "var(--accent)",
                  },
                  {
                    label: "Successfully Paid",
                    value: paidPayments.length,
                    color: "#22c55e",
                  },
                  {
                    label: "Still Pending",
                    value: filteredPayments.filter(
                      (p) => p.status === "pending",
                    ).length,
                    color: "#f59e0b",
                  },
                  {
                    label: "Failed",
                    value: filteredPayments.filter((p) => p.status === "failed")
                      .length,
                    color: "#ef4444",
                  },
                ].map((item) => (
                  <HBar
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    max={filteredPayments.length}
                    color={item.color}
                    suffix={`${item.value} (${filteredPayments.length ? Math.round((item.value / filteredPayments.length) * 100) : 0}%)`}
                  />
                ))}
              </Card>
            </div>
          )}

          {activeTab === "products" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: cols,
                gap: "1rem",
              }}
            >
              <Card style={{ padding: "1.25rem", gridColumn: "1 / -1" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.92rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  Top Products by Revenue
                </h3>
                {topProducts.length === 0 ? (
                  <p
                    style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}
                  >
                    No sales data yet
                  </p>
                ) : (
                  topProducts.map(([name, rev], i) => (
                    <HBar
                      key={name}
                      label={`#${i + 1} ${name}`}
                      value={rev}
                      max={maxProductRev}
                      color={
                        i === 0
                          ? "var(--accent)"
                          : `var(--accent)${Math.round(90 - i * 12).toString(16)}`
                      }
                      suffix={fmt(rev)}
                    />
                  ))
                )}
              </Card>
              <Card style={{ padding: "1.25rem" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.92rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  By Category
                </h3>
                {Object.entries(catMap).map(([cat, count]) => (
                  <HBar
                    key={cat}
                    label={cat}
                    value={count}
                    max={maxCat}
                    color="var(--accent)"
                    suffix={`${count} products`}
                  />
                ))}
              </Card>
              <Card style={{ padding: "1.25rem" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.92rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  Stock Health
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.6rem",
                    marginBottom: "1rem",
                  }}
                >
                  {[
                    {
                      label: "Total",
                      value: products.length,
                      color: "var(--accent)",
                    },
                    {
                      label: "Healthy",
                      value: products.filter((p) => p.instock > 10).length,
                      color: "#22c55e",
                    },
                    {
                      label: "Low Stock",
                      value: lowStock.length,
                      color: "#f59e0b",
                    },
                    {
                      label: "Out of Stock",
                      value: outOfStock.length,
                      color: "#ef4444",
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "0.6rem",
                        background: "var(--surface)",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: "1.3rem",
                          fontWeight: 700,
                          color: m.color,
                        }}
                      >
                        {m.value}
                      </p>
                      <p
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--text-muted)",
                          marginTop: "0.2rem",
                        }}
                      >
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
                {lowStock.length > 0 && (
                  <>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#ef4444",
                        marginBottom: "0.65rem",
                        fontWeight: 600,
                      }}
                    >
                      ⚠ Needs Restocking
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.45rem",
                      }}
                    >
                      {lowStock.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.55rem 0.75rem",
                            borderRadius: "0.5rem",
                            background: "#ef444410",
                            border: "1px solid #ef444420",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              flex: 1,
                            }}
                          >
                            {p.name}
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: p.instock === 0 ? "#ef4444" : "#f59e0b",
                              flexShrink: 0,
                              marginLeft: "0.5rem",
                            }}
                          >
                            {p.instock === 0 ? "OUT" : `${p.instock} left`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isMobile, isTablet } = useBreakpoint();
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        productsAPI.getAll(),
        ordersAPI.getAllAdmin(),
      ]);
      setProducts(Array.isArray(pRes?.data || pRes) ? pRes?.data || pRes : []);
      const ord = oRes?.data || oRes || [];
      setOrders(Array.isArray(ord) ? ord : []);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user || user.role !== "admin") return null;

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "var(--bg)",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: 56,
            background: "var(--card)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1rem",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            FUSION{" "}
            <span style={{ color: "var(--accent)", fontSize: "0.65rem" }}>
              ADMIN
            </span>
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={fetchData}
              disabled={loading}
              style={{
                width: 34,
                height: 34,
                borderRadius: "0.4rem",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              <motion.div
                animate={{ rotate: loading ? 360 : 0 }}
                transition={{
                  duration: 0.8,
                  repeat: loading ? Infinity : 0,
                  ease: "linear",
                }}
              >
                <RefreshCw
                  size={13}
                  style={{
                    color: loading ? "var(--accent)" : "var(--text-muted)",
                  }}
                />
              </motion.div>
            </button>
            <button
              onClick={() => setMobileNavOpen(true)}
              style={{
                width: 34,
                height: 34,
                borderRadius: "0.4rem",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              <Menu size={16} />
            </button>
          </div>
        </div>

        {/* Slide-out nav drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileNavOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.5)",
                  zIndex: 40,
                }}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 220,
                  background: "var(--card)",
                  borderLeft: "1px solid var(--border)",
                  zIndex: 50,
                  display: "flex",
                  flexDirection: "column",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    Navigation
                  </span>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "0.4rem",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
                <nav
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                    const active = tab === id;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setTab(id);
                          setMobileNavOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem 0.9rem",
                          borderRadius: "0.6rem",
                          border: "none",
                          background: active ? "var(--accent)" : "transparent",
                          color: active ? "var(--bg)" : "var(--text-sub)",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: active ? 600 : 400,
                          width: "100%",
                          textAlign: "left",
                        }}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    );
                  })}
                </nav>
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <button
                    onClick={() => {
                      navigate("/");
                      setMobileNavOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 0.9rem",
                      borderRadius: "0.6rem",
                      border: "none",
                      background: "transparent",
                      color: "var(--text-sub)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <Eye size={16} /> View Store
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 0.9rem",
                      borderRadius: "0.6rem",
                      border: "none",
                      background: "transparent",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page content */}
        <div style={{ flex: 1, padding: "1rem", overflowX: "hidden" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "4rem",
              }}
            >
              <Spinner size="lg" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {tab === "dashboard" && (
                  <Dashboard products={products} orders={orders} />
                )}
                {tab === "products" && (
                  <Products products={products} onRefresh={fetchData} />
                )}
                {tab === "orders" && <AdminOrders orders={orders} />}
                {tab === "analytics" && (
                  <Analytics products={products} orders={orders} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Bottom tab bar */}
        <div
          style={{
            height: 60,
            background: "var(--card)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            position: "sticky",
            bottom: 0,
            zIndex: 20,
            flexShrink: 0,
          }}
        >
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.2rem",
                  padding: "0.4rem 0.75rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  transition: "color 0.15s",
                }}
              >
                <Icon size={18} />
                <span
                  style={{
                    fontSize: "0.58rem",
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── DESKTOP / TABLET LAYOUT ────────────────────────────────────────────────
  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
    >
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? (isTablet ? 200 : 240) : 64 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "var(--card)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            height: 64,
            minHeight: 64,
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            padding: "0 0.75rem",
            gap: "0.5rem",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{
              opacity: sidebarOpen ? 1 : 0,
              width: sidebarOpen ? "auto" : 0,
            }}
            transition={{ duration: 0.2 }}
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "0.05em",
              }}
            >
              FUSION{" "}
              <span style={{ color: "var(--accent)", fontSize: "0.65rem" }}>
                ADMIN
              </span>
            </span>
          </motion.div>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={{
              flexShrink: 0,
              width: 30,
              height: 30,
              borderRadius: "0.4rem",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              animate={{ rotate: sidebarOpen ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronRight size={14} />
            </motion.div>
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            padding: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
          }}
        >
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                title={!sidebarOpen ? label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.7rem 0.85rem",
                  borderRadius: "0.6rem",
                  border: "none",
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "var(--bg)" : "var(--text-sub)",
                  cursor: "pointer",
                  transition: "background 0.18s, color 0.18s",
                  fontSize: "0.82rem",
                  fontWeight: active ? 600 : 400,
                  width: "100%",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                <motion.span
                  animate={{
                    opacity: sidebarOpen ? 1 : 0,
                    width: sidebarOpen ? "auto" : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                >
                  {label}
                </motion.span>
              </button>
            );
          })}
        </nav>

        <div
          style={{
            padding: "0.75rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
          }}
        >
          {[
            {
              icon: Eye,
              label: "View Store",
              color: "var(--text-sub)",
              action: () => navigate("/"),
            },
            {
              icon: LogOut,
              label: "Logout",
              color: "#ef4444",
              action: handleLogout,
            },
          ].map(({ icon: Icon, label, color, action }) => (
            <button
              key={label}
              onClick={action}
              title={!sidebarOpen ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.7rem 0.85rem",
                borderRadius: "0.6rem",
                border: "none",
                background: "transparent",
                color,
                cursor: "pointer",
                fontSize: "0.82rem",
                width: "100%",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              <motion.span
                animate={{
                  opacity: sidebarOpen ? 1 : 0,
                  width: sidebarOpen ? "auto" : 0,
                }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden", whiteSpace: "nowrap" }}
              >
                {label}
              </motion.span>
            </button>
          ))}
        </div>
      </motion.aside>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        <div
          style={{
            padding: "0.85rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--card)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Welcome back,{" "}
            <strong style={{ color: "var(--text)" }}>
              {user?.name || "Admin"}
            </strong>
          </p>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              padding: "0.5rem 0.85rem",
              color: "var(--text-sub)",
              fontSize: "0.75rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <motion.div
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{
                duration: 0.8,
                repeat: loading ? Infinity : 0,
                ease: "linear",
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  color: loading ? "var(--accent)" : "var(--text-muted)",
                }}
              />
            </motion.div>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div style={{ padding: isTablet ? "1.25rem" : "2rem" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "5rem",
              }}
            >
              <Spinner size="lg" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {tab === "dashboard" && (
                  <Dashboard products={products} orders={orders} />
                )}
                {tab === "products" && (
                  <Products products={products} onRefresh={fetchData} />
                )}
                {tab === "orders" && <AdminOrders orders={orders} />}
                {tab === "analytics" && (
                  <Analytics products={products} orders={orders} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
