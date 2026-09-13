"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Shield,
  AlertCircle,
  CheckCircle2,
  Play,
} from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated, redirect directly to chat
    if (api.getToken() && api.getUser()) {
      router.push("/chat");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await api.register(email, password, name || email.split("@")[0]);
        setSuccessMsg("Account created. Routing to console...");
      } else {
        await api.login(email, password);
        setSuccessMsg("Authenticated. Loading workspace...");
      }

      setTimeout(() => {
        router.push("/chat");
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Check credentials or backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Demo authentication using verified operator credentials against Render backend
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      try {
        await api.login("testoperator@example.com", "operator123");
      } catch {
        await api.register("testoperator@example.com", "operator123", "Operator");
      }
      setSuccessMsg("Authenticated with Render Core. Loading workspace...");
      setTimeout(() => {
        router.push("/chat");
      }, 300);
    } catch (err: any) {
      setErrorMsg("Failed to authenticate demo account on Render: " + (err.message || ""));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-[#e2e8f0] flex flex-col justify-between items-center px-4 py-8 dev-subtle-lines font-sans selection:bg-white/20 selection:text-white">
      
      {/* Top Bar / Logo */}
      <div className="w-full max-w-6xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white group-hover:border-white/25 transition-colors">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-white">Opada</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#252c3f] bg-[#121622] text-[#8e9bb0]">
              auth
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono text-[#7888a2] hover:text-white transition-colors"
        >
          ← Back to overview
        </Link>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md my-auto">
        <div className="rounded-xl border border-[#1c2336] bg-[#0b0e17] p-7 shadow-2xl">
          
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isRegister ? "Create operator account" : "Sign in to Opada"}
            </h1>
            <p className="text-xs text-[#8e9bb0] mt-1">
              {isRegister
                ? "Provision credentials for the agent runtime and sandbox"
                : "Enter your credentials to access the autonomous workspace"}
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="flex rounded-lg border border-[#181f30] bg-[#080a11] p-1 mb-6 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 rounded text-center transition-colors cursor-pointer ${
                !isRegister
                  ? "bg-[#182133] text-white font-medium"
                  : "text-[#697992] hover:text-[#a0b2cd]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 rounded text-center transition-colors cursor-pointer ${
                isRegister
                  ? "bg-[#182133] text-white font-medium"
                  : "text-[#697992] hover:text-[#a0b2cd]"
              }`}
            >
              Register
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 text-xs flex items-start gap-2.5 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs flex items-start gap-2.5 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-mono text-[#8e9bb0] mb-1.5">
                  FULL NAME
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#54647c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Operator Dave"
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1b2336] bg-[#080b12] text-xs text-white placeholder-[#455269] focus:outline-none focus:border-white/30 transition-colors font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-[#8e9bb0] mb-1.5">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#54647c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@opada.dev"
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1b2336] bg-[#080b12] text-xs text-white placeholder-[#455269] focus:outline-none focus:border-white/30 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-[#8e9bb0]">
                  PASSWORD
                </label>
                {!isRegister && (
                  <span className="text-[11px] font-mono text-[#54647c]">
                    min 8 chars
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#54647c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1b2336] bg-[#080b12] text-xs text-white placeholder-[#455269] focus:outline-none focus:border-white/30 transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 rounded-lg bg-white text-[#08090d] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#e2e8f0] transition-colors disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-[#08090d] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#161c2b]" />
            </div>
            <span className="relative px-3 bg-[#0b0e17] text-[11px] font-mono text-[#54647c]">
              OR FAST ACCESS
            </span>
          </div>

          {/* Demo Guest Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full h-9 rounded-lg border border-[#1c2438] bg-[#0e121d] text-xs font-mono text-[#c0ccdf] hover:border-white/20 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#7888a2]" />
            <span>Enter as Guest Operator (Instant Demo)</span>
          </button>

          {/* Security note */}
          <div className="mt-6 pt-4 border-t border-[#141926] flex items-center justify-center gap-2 text-[11px] font-mono text-[#54647c]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>JWT Session • bcrypt-hashed • Isolated Workspace</span>
          </div>

        </div>
      </div>

      {/* Bottom info */}
      <div className="text-[10px] sm:text-[11px] font-mono text-[#455269] flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-8 text-center px-4">
        <span>Opada Runtime v1.0.4</span>
        <span className="hidden sm:inline">•</span>
        <span>PostgreSQL 16 Engine</span>
        <span className="hidden sm:inline">•</span>
        <a href="http://localhost:8080/health" target="_blank" rel="noreferrer" className="hover:text-[#8e9bb0] transition-colors">
          Health Check
        </a>
      </div>

    </div>
  );
}
