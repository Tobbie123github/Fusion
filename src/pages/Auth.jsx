import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { authAPI } from "../api";
import { useAuthStore } from "../context/store";
import { Input, Button, FadeUp } from "../components/UI";
import toast from "react-hot-toast";

function AuthLayout({ children, title, subtitle, side }) {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <FadeUp>
          <div className="text-center mb-10">
            <Link
              to="/"
              className="font-serif text-2xl font-bold block mb-6"
              style={{ color: "var(--text)" }}
            >
              FUSION
            </Link>
            <h1
              className="font-serif font-bold text-3xl mb-2"
              style={{ color: "var(--text)" }}
            >
              {title}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-sub)" }}>
              {subtitle}
            </p>
          </div>

          <div
            className="rounded-2xl border p-8"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            {children}
          </div>

          <p
            className="text-center text-sm mt-6"
            style={{ color: "var(--text-sub)" }}
          >
            {side}
          </p>
        </FadeUp>
      </div>
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({
        email: form.email,
        password: form.password,
      });
      console.log("Res: ", res);
      const token = res?.user?.token;
      const user = res?.user?.user;

      if (token) {
        setAuth(user, token);
        toast.success("Welcome back!", {
          style: {
            background: "var(--card)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          },
          iconTheme: { primary: "var(--accent)", secondary: "var(--bg)" },
        });

        toast.success(res?.message);
        navigate("/");
      } else {
        toast.error(res?.error || "Invalid credentials");
      }
    } catch {
      toast.error("Sign in failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your Fusion account"
      side={
        <>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold underline underline-offset-4"
            style={{ color: "var(--accent)" }}
          >
            Create one
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@example.com"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <div>
          <label
            className="block text-xs tracking-widest uppercase mb-1.5"
            style={{ color: "var(--text-sub)" }}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full rounded-md px-4 py-3 text-sm border pr-10"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
              }}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full mt-2 justify-center"
          loading={loading}
          onClick={handleSubmit}
        >
          Sign In <ArrowRight size={14} />
        </Button>
      </div>
    </AuthLayout>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      console.log("res", res);
      const token = res?.user?.token;
      const user = res?.user?.user;

      if (token) {
        setAuth(user, token);
        toast.success("Account created! Welcome to Fusion.", {
          style: {
            background: "var(--card)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          },
          iconTheme: { primary: "var(--accent)", secondary: "var(--bg)" },
        });
        toast.success(res?.message);
        navigate("/");
      } else {
        toast.error(res?.error || "Registration failed");
      }
    } catch {
      toast.error("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join Fusion"
      subtitle="Create your account to get started"
      side={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold underline underline-offset-4"
            style={{ color: "var(--accent)" }}
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Full Name"
          value={form.name}
          onChange={set("name")}
          placeholder="Your name"
        />
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@example.com"
        />

        <div>
          <label
            className="block text-xs tracking-widest uppercase mb-1.5"
            style={{ color: "var(--text-sub)" }}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              className="w-full rounded-md px-4 py-3 text-sm border pr-10"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              placeholder="Min. 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
              }}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <Input
          label="Confirm Password"
          type="password"
          value={form.confirm}
          onChange={set("confirm")}
          placeholder="Repeat password"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <Button
          size="lg"
          className="w-full mt-2 justify-center"
          loading={loading}
          onClick={handleSubmit}
        >
          Create Account <ArrowRight size={14} />
        </Button>

        <p
          className="text-xs text-center"
          style={{ color: "var(--text-muted)" }}
        >
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </div>
    </AuthLayout>
  );
}
