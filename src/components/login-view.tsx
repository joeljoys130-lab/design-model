/* src/components/login-view.tsx */
import { useState, useEffect, useRef } from "react";
import { Mail, Lock, ArrowRight, Building2, Phone, ShieldCheck } from "lucide-react";
import { useRouter } from "next/router";

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const router = useRouter();
  const otpInputRef = useRef<HTMLInputElement>(null);

  /* ── state ─────────────────────────────────────────────────────── */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [step, setStep] = useState<"login" | "select-method" | "otp">("login");
  const [email, setEmail] = useState("");
  const [userInfo, setUserInfo] = useState<{
    id: string;
    email: string;
    phoneNumber?: string | null;
    preferredOtpMethod?: 'email' | 'phone';
    isPhoneVerified?: boolean;
  } | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone'>('email');
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── timer effect ──────────────────────────────────────────────── */
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /* ── auto-focus effect ─────────────────────────────────────────── */
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  /* ── masking helpers ───────────────────────────────────────────── */
  function maskEmail(emailStr: string): string {
    if (!emailStr) return '';
    const [name, domain] = emailStr.split('@');
    if (!name || !domain) return emailStr;
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.substring(0, 2)}***@${domain}`;
  }

  function maskPhone(phoneStr: string): string {
    if (!phoneStr) return '';
    const cleaned = phoneStr.trim();
    if (cleaned.length < 7) return '******';
    const countryCodeLength = cleaned.startsWith('+') ? 3 : 0;
    const prefix = cleaned.substring(0, countryCodeLength + 2);
    const suffix = cleaned.substring(cleaned.length - 4);
    return `${prefix} ******${suffix}`;
  }

  /* ── helpers ────────────────────────────────────────────────────── */
  async function doLogin(u: string, p: string) {
    setLoading(true);
    setError("");
    try {
      const loginRes = await fetch("/api/auth/login", {
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

      setUserInfo(loginData.user);
      setEmail(loginData.user.email);
      setSelectedMethod(loginData.user.preferredOtpMethod === 'phone' && loginData.user.phoneNumber ? 'phone' : 'email');
      setStep("select-method");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp() {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, method: selectedMethod }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Failed to send OTP.");
        return;
      }
      setTimer(30); // 30-second cooldown
      setStep("otp");
    } catch {
      setError("Failed to request OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (timer > 0 || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, method: selectedMethod }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Failed to resend OTP.");
        return;
      }
      setTimer(30);
    } catch {
      setError("Failed to resend OTP.");
    } finally {
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
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp, method: selectedMethod }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error ?? "Invalid OTP");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("Text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData);
    }
  };

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex bg-white text-black font-sans">

      {/* ── Left panel (brand) ── */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-black text-white flex-col justify-between p-12 border-r border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-white flex items-center justify-center font-bold text-sm">
            A
          </div>
          <span className="font-bold text-sm tracking-widest uppercase">
            Aravind Associates
          </span>
        </div>

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
                {step === "login" ? "Sign in" : step === "select-method" ? "Verification Method" : "Verify OTP"}
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                {step === "login" ? "Welcome back" : step === "select-method" ? "Choose OTP Delivery" : "Enter Verification Code"}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {step === "login"
                  ? "Enter your credentials to continue."
                  : step === "select-method"
                  ? "Select where you would like to receive your login code."
                  : <>OTP sent to your <span className="font-semibold text-black">{selectedMethod === 'email' ? 'email' : 'mobile number'}</span></>
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
            {step === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white text-sm font-bold rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Continue <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}

            {/* ── Method Selection form ── */}
            {step === "select-method" && userInfo && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3.5 border rounded cursor-pointer transition-colors hover:bg-neutral-50 border-neutral-200">
                    <input
                      type="radio"
                      name="otp-method"
                      value="email"
                      checked={selectedMethod === 'email'}
                      onChange={() => setSelectedMethod('email')}
                      className="mt-1 accent-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-sm text-black">
                        <Mail className="w-4 h-4 text-neutral-500" />
                        Email OTP
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        Send OTP to {maskEmail(userInfo.email)}
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3.5 border rounded transition-colors ${
                    userInfo.phoneNumber 
                      ? "cursor-pointer hover:bg-neutral-50 border-neutral-200" 
                      : "opacity-50 cursor-not-allowed border-neutral-100"
                  }`}>
                    <input
                      type="radio"
                      name="otp-method"
                      value="phone"
                      disabled={!userInfo.phoneNumber}
                      checked={selectedMethod === 'phone'}
                      onChange={() => setSelectedMethod('phone')}
                      className="mt-1 accent-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-sm text-black">
                        <Phone className="w-4 h-4 text-neutral-500" />
                        Mobile Phone OTP
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {userInfo.phoneNumber 
                          ? `Send OTP to ${maskPhone(userInfo.phoneNumber)}`
                          : "No verified phone number registered."
                        }
                      </div>
                    </div>
                  </label>
                </div>

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white text-sm font-bold rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Send OTP <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("login"); setError(""); }}
                  className="text-xs text-neutral-500 hover:text-black underline transition-colors cursor-pointer block text-center w-full"
                >
                  ← Back to credentials
                </button>
              </div>
            )}

            {/* ── OTP form ── */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    One-Time Password
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    onPaste={handlePaste}
                    className="w-full px-3 py-3 border border-neutral-200 bg-white rounded text-xl font-mono tracking-[0.4em] text-center focus:outline-none focus:border-black transition-colors text-black"
                    placeholder="------"
                    maxLength={6}
                    inputMode="numeric"
                    autoFocus
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
                    onClick={() => { setStep("select-method"); setOtp(""); setError(""); }}
                    className="text-xs text-neutral-500 hover:text-black underline transition-colors cursor-pointer"
                  >
                    ← Change delivery method
                  </button>
                  <button
                    type="button"
                    disabled={loading || timer > 0}
                    onClick={resendOtp}
                    className="text-xs text-neutral-500 hover:text-black underline transition-colors cursor-pointer disabled:opacity-50 disabled:no-underline"
                  >
                    {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                  </button>
                </div>
              </form>
            )}

          </div>

          <p className="text-center text-xs text-neutral-400 mt-6">
            BuildCorp ERP · Construction Management Platform
          </p>
        </div>
      </div>

    </div>
  );
}
