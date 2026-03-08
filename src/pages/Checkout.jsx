import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, Package, Check } from "lucide-react";
import { ordersAPI, paymentsAPI, cartAPI } from "../api";
import { useCartStore, useAuthStore } from "../context/store";
import { Divider, Spinner } from "../components/UI";
import toast from "react-hot-toast";

// ─── RESPONSIVE HOOK ──────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return isMobile;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const ep = (item) => (item.discount > 0 ? item.discount : item.price);

const inputStyle = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  padding: "0.8rem 1rem",
  color: "var(--text)",
  fontSize: "0.86rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
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

function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

const STEPS = ["Delivery", "Review", "Payment"];
const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
  "Canada",
];

function StepIndicator({ step }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        marginBottom: "2rem",
        flexWrap: "nowrap",
        overflowX: "auto",
      }}
    >
      {STEPS.map((s, i) => (
        <div
          key={s}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.68rem",
              fontWeight: 700,
              background: step >= i ? "var(--accent)" : "var(--surface)",
              color: step >= i ? "var(--bg)" : "var(--text-muted)",
              border: `1px solid ${step >= i ? "var(--accent)" : "var(--border)"}`,
              transition: "all 0.25s",
              flexShrink: 0,
            }}
          >
            {step > i ? <Check size={11} /> : i + 1}
          </div>
          <span
            style={{
              fontSize: "0.68rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: step === i ? "var(--text)" : "var(--text-muted)",
              transition: "color 0.25s",
            }}
          >
            {s}
          </span>
          {i < STEPS.length - 1 && (
            <div
              style={{
                width: 20,
                height: 1,
                background: step > i ? "var(--accent)" : "var(--border)",
                margin: "0 0.1rem",
                transition: "background 0.25s",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderSummary({
  items,
  shipping,
  total,
  collapsed,
  onToggle,
  isMobile,
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        overflow: "hidden",
        position: isMobile ? "static" : "sticky",
        top: isMobile ? "auto" : 80,
      }}
    >
      {/* Mobile: collapsible header */}
      {isMobile ? (
        <button
          onClick={onToggle}
          style={{
            width: "100%",
            padding: "1rem 1.25rem",
            background: "none",
            border: "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            {collapsed ? "Show" : "Hide"} Order Summary
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--accent)",
            }}
          >
            ₦{total.toLocaleString()}
          </span>
        </button>
      ) : (
        <div style={{ padding: "1.5rem 1.5rem 0" }}>
          <h3
            style={{
              fontWeight: 600,
              color: "var(--text)",
              fontSize: "0.88rem",
              marginBottom: "1.25rem",
            }}
          >
            Order Summary
          </h3>
        </div>
      )}

      <AnimatePresence initial={false}>
        {(!isMobile || !collapsed) && (
          <motion.div
            initial={isMobile ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: isMobile ? "0 1.25rem 1.25rem" : "0 1.5rem 1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  marginBottom: "1rem",
                }}
              >
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--text-sub)",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name} × {item.quantity}
                    </span>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ color: "var(--text)" }}>
                        ₦{(ep(item) * item.quantity).toLocaleString()}
                      </span>
                      {item.discount > 0 && (
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            textDecoration: "line-through",
                          }}
                        >
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Divider />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  margin: "1rem 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.82rem",
                  }}
                >
                  <span style={{ color: "var(--text-sub)" }}>Subtotal</span>
                  <span style={{ color: "var(--text)" }}>
                    ₦
                    {items
                      .reduce((s, i) => s + ep(i) * i.quantity, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.82rem",
                  }}
                >
                  <span style={{ color: "var(--text-sub)" }}>Shipping</span>
                  <span
                    style={{
                      color: shipping === 0 ? "var(--accent)" : "var(--text)",
                    }}
                  >
                    {shipping === 0 ? "Free" : `₦${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <Divider />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1rem",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "0.9rem",
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    color: "var(--accent)",
                  }}
                >
                  ₦{total.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
  });

  const subtotalAmt = items.reduce((s, i) => s + ep(i) * i.quantity, 0);
  const shipping = subtotalAmt > 150 ? 0 : 9.99;
  const total = subtotalAmt + shipping;

  const setField = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const isFormValid =
    form.fullName.trim() &&
    form.phone.trim() &&
    form.address.trim() &&
    form.city.trim() &&
    form.state.trim();

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const authState = JSON.parse(
        localStorage.getItem("fusion-auth") || "{}",
      )?.state;
      const userId = authState?.user?.id;

      if (!userId) {
        toast.error("Please sign in to continue");
        navigate("/login");
        return;
      }

      for (const item of items) {
        await cartAPI.addItem(item.id, userId, item.quantity, item.size);
      }

      const orderRes = await ordersAPI.create(form);
      const orderId = orderRes?.order?.id;
      if (!orderId) throw new Error("No order ID returned");

      const payRes = await paymentsAPI.initiate(orderId, user?.email);
      const authorizationUrl = payRes?.authorization_url;
      const reference = payRes?.reference;
      if (!authorizationUrl) throw new Error("No payment URL returned");

      sessionStorage.setItem("fusion_paystack_reference", reference);
      sessionStorage.setItem("fusion_order_id", orderId);

      clearCart();
      window.location.href = authorizationUrl;
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "Something went wrong.",
        {
          style: {
            background: "var(--card)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          },
        },
      );
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          paddingTop: 120,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "3rem", opacity: 0.12 }}>◻</div>
        <p style={{ color: "var(--text-sub)", fontSize: "0.95rem" }}>
          Your cart is empty
        </p>
        <button
          onClick={() => navigate("/shop")}
          style={{
            color: "var(--accent)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.82rem",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ paddingTop: 64, minHeight: "100vh", background: "var(--bg)" }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: isMobile ? "1.5rem 1rem 5rem" : "3rem 1.5rem 5rem",
        }}
      >
        <button
          onClick={() =>
            step === 0 ? navigate("/cart") : setStep((s) => s - 1)
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            color: "var(--text-sub)",
            fontSize: "0.72rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginBottom: "1.5rem",
          }}
        >
          <ArrowLeft size={14} /> {step === 0 ? "Back to Cart" : "Back"}
        </button>

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
            Checkout
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {step === 0 ? "Delivery Details" : "Review Order"}
          </h1>
        </div>

        <StepIndicator step={step} />

        {/* Mobile: summary on top, collapsible */}
        {isMobile && (
          <div style={{ marginBottom: "1.25rem" }}>
            <OrderSummary
              items={items}
              shipping={shipping}
              total={total}
              collapsed={summaryCollapsed}
              onToggle={() => setSummaryCollapsed((c) => !c)}
              isMobile={true}
            />
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 300px",
            gap: isMobile ? "1rem" : "2.5rem",
            alignItems: "start",
          }}
        >
          <AnimatePresence mode="wait">
            {/* STEP 0 — Delivery */}
            {step === 0 && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "1rem",
                  padding: isMobile ? "1.25rem" : "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <h2
                  style={{
                    fontWeight: 600,
                    color: "var(--text)",
                    fontSize: "0.95rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Where should we deliver?
                </h2>

                <Field
                  label="Full Name"
                  value={form.fullName}
                  onChange={setField("fullName")}
                  placeholder="Emmanuel Ayomikun"
                />
                <Field
                  label="Phone Number"
                  value={form.phone}
                  onChange={setField("phone")}
                  type="tel"
                  placeholder="+234 800 000 0000"
                />
                <Field
                  label="Street Address"
                  value={form.address}
                  onChange={setField("address")}
                  placeholder="12 Banana Island Road"
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  <Field
                    label="City"
                    value={form.city}
                    onChange={setField("city")}
                    placeholder="Lagos"
                  />
                  <Field
                    label="State"
                    value={form.state}
                    onChange={setField("state")}
                    placeholder="Lagos State"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Country</label>
                  <select
                    value={form.country}
                    onChange={setField("country")}
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--accent)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setStep(1)}
                  disabled={!isFormValid}
                  style={{
                    background: "var(--accent)",
                    color: "var(--bg)",
                    border: "none",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.78rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    cursor: isFormValid ? "pointer" : "not-allowed",
                    opacity: isFormValid ? 1 : 0.4,
                    marginTop: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "opacity 0.2s",
                  }}
                >
                  Continue to Review <ArrowRight size={14} />
                </button>
              </motion.div>
            )}

            {/* STEP 1 — Review */}
            {step === 1 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* Delivery summary */}
                <div
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "1rem",
                    padding: isMobile ? "1.25rem" : "1.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: 600,
                        color: "var(--text)",
                        fontSize: "0.88rem",
                      }}
                    >
                      Delivering to
                    </h3>
                    <button
                      onClick={() => setStep(0)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent)",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: 3,
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.2rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {form.fullName}
                    </p>
                    <p
                      style={{ fontSize: "0.82rem", color: "var(--text-sub)" }}
                    >
                      {form.phone}
                    </p>
                    <p
                      style={{ fontSize: "0.82rem", color: "var(--text-sub)" }}
                    >
                      {form.address}
                    </p>
                    <p
                      style={{ fontSize: "0.82rem", color: "var(--text-sub)" }}
                    >
                      {form.city}, {form.state}, {form.country}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "1rem",
                    padding: isMobile ? "1.25rem" : "1.5rem",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: 600,
                      color: "var(--text)",
                      fontSize: "0.88rem",
                      marginBottom: "1.1rem",
                    }}
                  >
                    {items.length} {items.length === 1 ? "Item" : "Items"}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.85rem",
                    }}
                  >
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.size}`}
                        style={{
                          display: "flex",
                          gap: "0.9rem",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 58,
                            borderRadius: "0.45rem",
                            overflow: "hidden",
                            flexShrink: 0,
                            background: "var(--surface)",
                          }}
                        >
                          {item.imageUrl?.[0] ? (
                            <img
                              src={item.imageUrl[0]}
                              alt={item.name}
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
                              fontWeight: 500,
                              color: "var(--text)",
                              marginBottom: "0.2rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name}
                          </p>
                          <p
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {item.size && `Size: ${item.size} · `}Qty:{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: 600,
                              color: "var(--text)",
                            }}
                          >
                            ₦{(ep(item) * item.quantity).toLocaleString()}
                          </span>
                          {item.discount > 0 && (
                            <div
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--text-muted)",
                                textDecoration: "line-through",
                              }}
                            >
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secure note */}
                <div
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "flex-start",
                  }}
                >
                  <Lock
                    size={15}
                    style={{
                      color: "var(--accent)",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        marginBottom: "0.2rem",
                      }}
                    >
                      Secure Payment via Paystack
                    </p>
                    <p
                      style={{
                        fontSize: "0.74rem",
                        color: "var(--text-sub)",
                        lineHeight: 1.6,
                      }}
                    >
                      Clicking "Place Order" creates your order and takes you to
                      the secure payment page to complete your purchase of{" "}
                      <strong style={{ color: "var(--accent)" }}>
                        ₦{total.toLocaleString()}
                      </strong>
                      .
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  onClick={handleCreateOrder}
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: "var(--accent)",
                    color: "var(--bg)",
                    border: "none",
                    padding: "1.05rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.8rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.6rem",
                    transition: "opacity 0.2s",
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" /> Creating Order...
                    </>
                  ) : (
                    <>
                      <Package size={15} /> Place Order · ₦
                      {total.toLocaleString()}
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop: sidebar summary */}
          {!isMobile && (
            <OrderSummary
              items={items}
              shipping={shipping}
              total={total}
              isMobile={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
