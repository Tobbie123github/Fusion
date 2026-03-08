import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { paymentsAPI } from "../api";
import toast from "react-hot-toast";

export default function Payment() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verify = async () => {
      // Paystack redirects back with ?reference=xxx in URL
      const urlParams = new URLSearchParams(window.location.search);
      const reference =
        urlParams.get("reference") ||
        sessionStorage.getItem("fusion_paystack_reference");

      if (!reference) {
        navigate("/orders");
        return;
      }

      try {
        const res = await paymentsAPI.verify(reference);
        const status = res?.data?.data?.status;

        if (status === "success") {
          setStatus("success");
          sessionStorage.removeItem("fusion_paystack_reference");
          sessionStorage.removeItem("fusion_order_id");
          toast.success("Payment successful! 🎉", {
            style: {
              background: "var(--card)",
              color: "var(--text)",
              border: "1px solid var(--border)",
            },
          });
          setTimeout(() => navigate("/orders"), 2500);
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Verify error:", err);
        setStatus("failed");
      }
    };

    verify();
  }, [navigate]);

  return (
    <div
      style={{
        paddingTop: 64,
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", padding: "2rem" }}
      >
        {status === "verifying" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-block", marginBottom: "1.5rem" }}
            >
              <Loader
                size={48}
                style={{ color: "var(--accent)", opacity: 0.8 }}
              />
            </motion.div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "0.5rem",
              }}
            >
              Verifying Payment
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              style={{ marginBottom: "1.5rem" }}
            >
              <CheckCircle size={64} style={{ color: "#22c55e" }} />
            </motion.div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "0.5rem",
              }}
            >
              Payment Successful!
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
              }}
            >
              Your order has been confirmed. Redirecting to orders...
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              style={{ marginBottom: "1.5rem" }}
            >
              <XCircle size={64} style={{ color: "#ef4444" }} />
            </motion.div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "0.5rem",
              }}
            >
              Payment Failed
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
              }}
            >
              Something went wrong with your payment.
            </p>
            <button
              onClick={() => navigate("/orders")}
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
                border: "none",
                padding: "0.85rem 2rem",
                borderRadius: "0.5rem",
                fontSize: "0.78rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try Again from Orders
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
