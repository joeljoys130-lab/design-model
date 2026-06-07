"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions";
import { Shield, Key, Mail, Lock, CheckCircle, ArrowRight } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginAction({ username, passwordHash: password });
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoUser: string, pass: string) => {
    setLoading(true);
    setError("");
    setUsername(demoUser);
    setPassword(pass);
    
    try {
      const res = await loginAction({ username: demoUser, passwordHash: pass });
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { username: "superadmin", role: "Super Admin", desc: "Full system access & logs", pass: "super123", color: "from-purple-500 to-indigo-600" },
    { username: "admin", role: "Administrator", desc: "Project & contract setups", pass: "admin123", color: "from-blue-500 to-indigo-500" },
    { username: "accountant", role: "Accountant", desc: "Ledgers, invoices & reports", pass: "finance123", color: "from-teal-500 to-emerald-500" },
    { username: "engineer", role: "Site Engineer", desc: "Work progress & deliveries", pass: "site123", color: "from-amber-500 to-orange-500" },
    { username: "store", role: "Store Manager", desc: "Material stock & cement loads", pass: "store123", color: "from-pink-500 to-rose-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Branding Panel */}
      <div className="md:w-1/2 flex flex-col justify-between p-8 md:p-16 bg-slate-900/40 backdrop-blur-md border-r border-slate-900 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            BUILDCORP ERP
          </span>
        </div>

        <div className="my-auto py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white mb-6">
            Enterprise-Grade <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Construction Management
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-8">
            Streamline contracts, manage material inventories, automate site deliveries, record executions, and analyze financial reports. Designed for scale.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">Real-time Stock Register</h4>
                <p className="text-slate-400 text-sm">Automatic inventory adjustments from load entries and site deliveries.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">Double-entry Vendor Ledgers</h4>
                <p className="text-slate-400 text-sm">Every cement and tar load records payments and adjusts balance sheets instantly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-slate-500 text-sm">
          © 2026 BuildCorp Engineering & Infrastructure. All rights reserved.
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-16 bg-slate-950 relative">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Portal Access</h2>
            <p className="text-slate-400 text-sm mt-2">Sign in to access your dashboard and active projects.</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 transition-all text-sm"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 transition-all text-sm"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="pt-6 border-t border-slate-900">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Quick Login (Demo Roles)
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => handleQuickLogin(acc.username, acc.pass)}
                  disabled={loading}
                  className="w-full text-left p-3.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-800/80 rounded-xl flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold group-hover:text-indigo-400 transition-colors">
                        {acc.username}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-400">
                        {acc.role}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">{acc.desc}</p>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${acc.color} shadow-sm`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
