"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, User, LogIn, ArrowLeft } from "lucide-react";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Hanya terima path internal — cegah open redirect lewat ?next=//situs-lain.com
  const rawNext = searchParams.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Gagal login.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#05100E] px-4 py-20 zentra-grid-bg overflow-hidden">
      {/* Ambient glow behind card */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-[#D4E751]/10 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/15 p-2 shadow-xl overflow-hidden">
            <Image
              src="/logo-icon.png"
              alt="Otak Rental"
              width={48}
              height={48}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white font-sans">
            Admin Portal
          </h1>
          <p className="mt-1.5 font-mono text-xs text-zinc-400">
            Otak Rental &bull; Restricted Authentication
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="zentra-rivet-card space-y-4 rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl backdrop-blur-xl"
        >
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-zinc-600 focus:border-[#D4E751] focus:outline-none focus:ring-1 focus:ring-[#D4E751]/30 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-zinc-600 focus:border-[#D4E751] focus:outline-none focus:ring-1 focus:ring-[#D4E751]/30 transition-all font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-mono text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D4E751] hover:bg-[#C2D640] py-3 text-xs font-bold text-[#05100E] shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            <span>{submitting ? "Memverifikasi..." : "Masuk ke Dashboard"}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke beranda publik</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

