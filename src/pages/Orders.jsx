import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ArrowRight } from "lucide-react";
import { ordersAPI, paymentsAPI } from "../api";
import { FadeUp, Spinner, Badge, Button, Card } from "../components/UI";
import toast from "react-hot-toast";
import { useAuthStore } from '../context/store'

const STATUS_COLOR = {
  paid: "green",
  pending: "yellow",
  completed: "green",
  failed: "red",
  cancelled: "gray",
  processing: "yellow",
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    ordersAPI
      .getAll()
      .then((d) => {
        // handle all possible response shapes
        const result = d?.data || d?.orders || d;
        setOrders(Array.isArray(result) ? result : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async (orderId) => {
    setPayingId(orderId);
    try {
      const res = await paymentsAPI.initiate(orderId, user?.email); // ← pass email
      const authorizationUrl = res?.authorization_url;
      const reference = res?.reference;

      if (authorizationUrl) {
        sessionStorage.setItem("fusion_paystack_reference", reference);
        sessionStorage.setItem("fusion_order_id", orderId);
        window.location.href = authorizationUrl;
      } else {
        toast.error("Could not initiate payment. Try again.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Payment failed. Try again.", {
        style: {
          background: "var(--card)",
          color: "var(--text)",
          border: "1px solid var(--border)",
        },
      });
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <FadeUp>
          <h1
            className="font-serif font-bold mb-1"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              color: "var(--text)",
            }}
          >
            Your Orders
          </h1>
          <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
        </FadeUp>

        {loading ? (
          // Skeleton
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border p-5"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "flex-start",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "0.5rem",
                        background: "var(--surface)",
                        flexShrink: 0,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: "linear",
                          delay: i * 0.1,
                        }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(90deg, transparent, var(--border), transparent)",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          height: 12,
                          borderRadius: 6,
                          background: "var(--surface)",
                          width: "50%",
                          marginBottom: "0.5rem",
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
                            delay: i * 0.1,
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
                          width: "30%",
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
                            delay: i * 0.1,
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
                  <div
                    style={{
                      width: 60,
                      height: 28,
                      borderRadius: 6,
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
                        delay: i * 0.1,
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
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <Package size={52} className="mx-auto mb-5 opacity-10" />
            <p
              className="text-base mb-2 font-medium"
              style={{ color: "var(--text-sub)" }}
            >
              No orders yet
            </p>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              Your order history will appear here
            </p>
            <Button onClick={() => navigate("/shop")}>
              Start Shopping <ArrowRight size={14} />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 items-start">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <Package size={16} style={{ color: "var(--accent)" }} />
                      </div>
                      <div>
                        <p
                          className="font-semibold text-sm mb-0.5"
                          style={{ color: "var(--text)" }}
                        >
                          Order #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <p
                          className="text-xs mb-2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "Recent"}
                        </p>
                        <Badge color={STATUS_COLOR[order.status] || "yellow"}>
                          {order.status || "pending"}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-serif font-bold text-xl mb-2"
                        style={{ color: "var(--accent)" }}
                      >
                        ${order.total?.toLocaleString()}
                      </p>
                      {(order.status === "pending" || !order.status) && (
                        <button
                          onClick={() => handlePay(order.id)}
                          disabled={payingId === order.id}
                          className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-md transition-opacity hover:opacity-80"
                          style={{
                            background: "var(--accent)",
                            color: "var(--bg)",
                            border: "none",
                            cursor: "pointer",
                            opacity: payingId === order.id ? 0.6 : 1,
                          }}
                        >
                          {payingId === order.id ? "Loading..." : "Pay Now"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order items */}
                  {order.items?.length > 0 && (
                    <div
                      className="mt-4 pt-4 border-t"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="flex flex-col gap-2">
                        {order.items.map((item, j) => (
                          <div
                            key={j}
                            className="flex justify-between items-center text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <span>
                              {item.name} × {item.quantity}
                              {item.size && (
                                <span
                                  style={{
                                    color: "var(--text-sub)",
                                    marginLeft: "0.35rem",
                                  }}
                                >
                                  · {item.size}
                                </span>
                              )}
                            </span>
                            <span
                              style={{
                                color: "var(--text-sub)",
                                fontWeight: 500,
                              }}
                            >
                              ${item.subtotal?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
