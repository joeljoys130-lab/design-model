/* src/components/login-view.tsx */
import { useState } from "react";
import { Mail, Lock, ArrowRight, Building2 } from "lucide-react";
import { useRouter } from "next/router";

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const router = useRouter();

  /* ── state ─────────────────────────────────────────────────────── */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [step, setStep]   = useState<"login" | "otp">("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp]     = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  /* ── helpers ────────────────────────────────────────────────────── */
  async function doLogin(u: string, p: string) {
    setLoading(true);
    setError("");
    try {
      const loginRes  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: u, password: p }),
      });
      const loginData = await loginRes.json();

      if (!loginData.success) {
        setError(loginData.error ?? "Invalid credentials");
        return;
      }

      setEmail(loginData.user.email);

      await fetch("/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.user.email }),
      });

      setStep("otp");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setLoading(true);
    try {
      await fetch("/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  /* ── handlers ───────────────────────────────────────────────────── */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(username, password);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        router.push("/");
      } else {
        setError(data.error ?? "Invalid OTP");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex bg-white text-black font-sans">

      {/* ── Left panel (brand) ── */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-black text-white flex-col justify-between p-12 border-r border-neutral-800">
        {/* Logo / brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-white flex items-center justify-center font-bold text-sm">
            A
          </div>
          <span className="font-bold text-sm tracking-widest uppercase">
            Aravind Associates
          </span>
        </div>

        {/* Centre copy */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-neutral-400" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              BuildCorp ERP
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Enterprise<br />Construction<br />Management
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Manage contracts, materials, expenses, and site operations from a single platform.
          </p>
        </div>

        {/* Footer note */}
        <p className="text-xs text-neutral-600 tracking-wide">
          Secured with OTP authentication
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-neutral-50">
        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 border border-black flex items-center justify-center font-bold text-xs">A</div>
            <span className="font-bold text-sm tracking-widest uppercase">Aravind Associates</span>
          </div>

          {/* Card */}
          <div className="bg-white border border-neutral-200 rounded p-8 space-y-6">

            {/* Header */}
            <div className="border-b border-neutral-100 pb-5">
              <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-1">
                {step === "login" ? "Sign in" : "Verify OTP"}
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                {step === "login" ? "Welcome back" : "Check your email"}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {step === "login"
                  ? "Enter your credentials to continue."
                  : <>OTP sent to <span className="font-semibold text-black">{email}</span></>
                }
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            {/* ── Login form ── */}
            {step === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Username / Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 bg-white rounded text-sm focus:outline-none focus:border-black transition-colors text-black placeholder-neutral-400"
                      placeholder="e.g. admin or you@email.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 bg-white rounded text-sm focus:outline-none focus:border-black transition-colors text-black placeholder-neutral-400"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white text-sm font-bold rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

            ) : (
              /* ── OTP form ── */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    One-Time Password
                  </label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-3 border border-neutral-200 bg-white rounded text-xl font-mono tracking-[0.4em] text-center focus:outline-none focus:border-black transition-colors text-black"
                    placeholder="------"
                    maxLength={6}
                    inputMode="numeric"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white text-sm font-bold rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Verify & Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep("login"); setOtp(""); setError(""); }}
                    className="text-xs text-neutral-500 hover:text-black underline transition-colors cursor-pointer"
                  >
                    ← Back to login
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={resendOtp}
                    className="text-xs text-neutral-500 hover:text-black underline transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Footer */}
          <p className="text-center text-xs text-neutral-400 mt-6">
            BuildCorp ERP · Construction Management Platform
          </p>
        </div>
      </div>

    </div>
  );
}
