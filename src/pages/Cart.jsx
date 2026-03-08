import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Tag,
} from "lucide-react";
import { useCartStore, useAuthStore } from "../context/store";
import {
  ProductPlaceholder,
  FadeUp,
  Button,
  Divider,
  Card,
} from "../components/UI";

// ─── outside component ────────────────────────────────────────────────────────
const effectivePrice = (item) =>
  item.discount > 0 ? item.discount : item.price;

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const subtotal = items.reduce(
    (s, i) => s + effectivePrice(i) * i.quantity,
    0,
  );
  const shipping = subtotal > 150 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <FadeUp>
          <h1
            className="font-serif font-bold mb-1"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "var(--text)" }}
          >
            Your Cart
          </h1>
          <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </FadeUp>

        {items.length === 0 ? (
          <div className="text-center py-28">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ShoppingBag size={52} className="mx-auto mb-5 opacity-10" />
              <p
                className="text-base mb-2 font-medium"
                style={{ color: "var(--text-sub)" }}
              >
                Your cart is empty
              </p>
              <p
                className="text-sm mb-8"
                style={{ color: "var(--text-muted)" }}
              >
                Discover our latest collection
              </p>
              <Button onClick={() => navigate("/shop")}>
                Explore Collection <ArrowRight size={14} />
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
            {/* Items */}
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {items.map((item) => {
                  const price = effectivePrice(item);
                  const hasDiscount = item.discount > 0;

                  return (
                    <motion.div
                      key={`${item.id}-${item.size}`}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-4 rounded-xl border p-4 items-center"
                      style={{
                        background: "var(--card)",
                        borderColor: "var(--border)",
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        className="rounded-lg overflow-hidden flex-shrink-0"
                        style={{
                          width: 80,
                          height: 100,
                          background: "var(--surface)",
                        }}
                      >
                        {item.imageUrl?.length > 0 ? (
                          <img
                            src={item.imageUrl[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ProductPlaceholder
                            gradient={item.gradient || ["#1a1a2e", "#e94560"]}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-sm mb-0.5 truncate"
                          style={{ color: "var(--text)" }}
                        >
                          {item.name}
                        </h3>
                        <p
                          className="text-xs mb-2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.size && `Size: ${item.size}`}{" "}
                          {item.category && `· ${item.category}`}
                        </p>

                        {/* Price with discount */}
                        <div className="flex items-center gap-2">
                          <span
                            className="font-serif font-bold text-base"
                            style={{ color: "var(--accent)" }}
                          >
                            ₦{price.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <>
                              <span
                                className="text-xs line-through"
                                style={{ color: "var(--text-muted)" }}
                              >
                                ₦{item.price.toLocaleString()}
                              </span>
                              <span
                                className="text-xs font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5"
                                style={{
                                  background: "var(--accent)",
                                  color: "var(--bg)",
                                  fontSize: "0.6rem",
                                }}
                              >
                                <Tag size={9} />
                                SALE
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Qty controls */}
                      <div
                        className="flex items-center border rounded-md overflow-hidden flex-shrink-0"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <button
                          onClick={() =>
                            updateQty(item.id, item.size, item.quantity - 1)
                          }
                          className="px-3 py-2.5 transition-opacity hover:opacity-60"
                          style={{
                            color: "var(--text)",
                            background: "none",
                            border: "none",
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          className="w-8 text-center text-sm"
                          style={{ color: "var(--text)" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQty(item.id, item.size, item.quantity + 1)
                          }
                          className="px-3 py-2.5 transition-opacity hover:opacity-60"
                          style={{
                            color: "var(--text)",
                            background: "none",
                            border: "none",
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="text-right flex-shrink-0 w-24">
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "var(--text)" }}
                        >
                          ₦{(price * item.quantity).toLocaleString()}
                        </p>
                        {hasDiscount && (
                          <p
                            className="text-xs line-through"
                            style={{ color: "var(--text-muted)" }}
                          >
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                        style={{
                          color: "var(--text-muted)",
                          background: "var(--surface)",
                          border: "none",
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <button
                onClick={clearCart}
                className="self-start text-xs tracking-widest uppercase underline underline-offset-4 transition-opacity hover:opacity-60"
                style={{
                  color: "var(--text-muted)",
                  background: "none",
                  border: "none",
                }}
              >
                Clear Cart
              </button>
            </div>

            {/* Summary */}
            <Card className="p-6 sticky top-20">
              <h3
                className="font-semibold text-sm tracking-wide mb-5"
                style={{ color: "var(--text)" }}
              >
                Order Summary
              </h3>

              {/* Item breakdown */}
              <div className="flex flex-col gap-2 mb-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex justify-between text-xs"
                    style={{ color: "var(--text-sub)" }}
                  >
                    <span className="truncate flex-1 mr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span style={{ color: "var(--text)" }}>
                      ₦{(effectivePrice(item) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <Divider className="mb-4" />

              <div className="flex flex-col gap-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-sub)" }}>
                    Subtotal ({items.length}{" "}
                    {items.length === 1 ? "item" : "items"})
                  </span>
                  <span style={{ color: "var(--text)" }}>
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-sub)" }}>Shipping</span>
                  <span
                    style={{
                      color: shipping === 0 ? "var(--accent)" : "var(--text)",
                    }}
                  >
                    {shipping === 0 ? "Free" : `₦${shipping.toFixed(2)}`}
                  </span>
                </div>
                {subtotal < 150 && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Add ₦{(150 - subtotal).toLocaleString()} more for free
                    shipping
                  </p>
                )}
              </div>

              <Divider className="mb-5" />

              <div className="flex justify-between items-center mb-6">
                <span
                  className="font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Total
                </span>
                <span
                  className="font-serif font-bold text-2xl"
                  style={{ color: "var(--accent)" }}
                >
                  ₦{total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-opacity hover:opacity-90 mb-3"
                style={{
                  background: "var(--accent)",
                  color: "var(--bg)",
                  border: "none",
                }}
              >
                {user ? "Proceed to Checkout" : "Sign In to Checkout"}
              </button>

              <button
                onClick={() => navigate("/shop")}
                className="w-full py-3 rounded-xl text-xs font-semibold tracking-widest uppercase border transition-colors"
                style={{
                  background: "none",
                  borderColor: "var(--border)",
                  color: "var(--text-sub)",
                }}
              >
                Continue Shopping
              </button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
