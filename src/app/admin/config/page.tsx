"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  Zap,
  Layers,
  Save,
  Info,
} from "lucide-react";
import { JOB_TYPE_CONFIG } from "@/lib/utils";

interface JobTypeBaseline {
  jobType: string;
  minHours: number;
  maxHours: number;
}

interface UrgencyTier {
  id: string;
  label: string;
  minDays: number | null;
  maxDays: number | null;
  multiplier: number;
  notLayak: boolean;
  sortOrder: number;
}

interface ComplexityTier {
  label: string;
  minMultiplier: number;
  maxMultiplier: number;
}

export default function ConfigPage() {
  const [jobTypeBaselines, setJobTypeBaselines] = useState<JobTypeBaseline[]>([]);
  const [urgencyTiers, setUrgencyTiers] = useState<UrgencyTier[]>([]);
  const [complexityTiers, setComplexityTiers] = useState<ComplexityTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        setJobTypeBaselines(d.jobTypeBaselines ?? []);
        setUrgencyTiers(d.urgencyTiers ?? []);
        setComplexityTiers(d.complexityTiers ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTypeBaselines,
          urgencyTiers,
          complexityTiers,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setSaveError(d.error ?? "Gagal menyimpan konfigurasi.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("Gagal menyimpan konfigurasi — periksa koneksi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05100E] text-white zentra-grid-bg py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#D4E751] border-r-transparent" />
        <p className="mt-3 text-xs font-mono text-zinc-400">Memuat konfigurasi pricing...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05100E] text-white zentra-grid-bg py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Sticky Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <Link href="/admin" className="hover:text-[#D4E751] transition-colors">
                Daftar Order
              </Link>
              <span>/</span>
              <span className="text-white font-semibold">Pengaturan Pricing</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
              Pengaturan Parameter Pricing
            </h1>
            <p className="text-sm text-zinc-400">
              Kelola tabel acuan baseline jam, multiplier urgensi, dan rentang tier kompleksitas.
            </p>
            {saveError && (
              <p className="text-xs font-mono text-red-400">{saveError}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali</span>
            </Link>

            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D4E751] hover:bg-[#C2D640] px-5 py-2 text-xs font-bold text-[#05100E] shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Tersimpan!</span>
                </>
              ) : saving ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Callout */}
        <div className="zentra-rivet-card rounded-2xl border border-white/10 bg-[#0B1916]/80 p-5 text-xs text-zinc-300 flex items-start gap-3 backdrop-blur-sm">
          <Info className="h-5 w-5 text-[#D4E751] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white font-mono uppercase tracking-wider">Formula Dinamis Aktif:</p>
            <p className="text-zinc-400 leading-relaxed font-mono">
              Harga akhir = (Estimasi Jam &times; Rate Dasar) &times; Multiplier Urgensi &times; Multiplier Kompleksitas + Biaya Tambahan.
            </p>
          </div>
        </div>

        {/* SECTION 1: Baseline Jam per Kategori */}
        <section className="zentra-rivet-card rounded-3xl border border-white/10 bg-[#0B1916]/80 p-6 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Clock className="h-5 w-5 text-[#D4E751]" />
            <div>
              <h2 className="font-bold text-white text-base font-sans">Baseline Jam per Kategori Pekerjaan</h2>
              <p className="text-xs text-zinc-400">Rentang jam kerja yang wajar untuk masing-masing jenis permintaan.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-400 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Deskripsi Singkat</th>
                  <th className="px-4 py-3">Min Jam</th>
                  <th className="px-4 py-3">Max Jam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobTypeBaselines.map((b, i) => {
                  const conf = JOB_TYPE_CONFIG[b.jobType];
                  return (
                    <tr key={b.jobType} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">
                        <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-mono text-zinc-300">
                          {conf?.label ?? b.jobType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400 max-w-xs font-sans">
                        {conf?.desc ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative inline-flex items-center">
                          <input
                            type="number"
                            min="1"
                            className="w-24 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 pr-9 text-xs font-mono font-bold text-white focus:border-[#D4E751] focus:outline-none"
                            value={b.minHours}
                            onChange={(e) => {
                              const v = [...jobTypeBaselines];
                              v[i] = { ...v[i], minHours: Number(e.target.value) };
                              setJobTypeBaselines(v);
                            }}
                          />
                          <span className="pointer-events-none absolute right-2.5 text-[11px] font-mono text-zinc-500">
                            jam
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative inline-flex items-center">
                          <input
                            type="number"
                            min="1"
                            className="w-24 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 pr-9 text-xs font-mono font-bold text-white focus:border-[#D4E751] focus:outline-none"
                            value={b.maxHours}
                            onChange={(e) => {
                              const v = [...jobTypeBaselines];
                              v[i] = { ...v[i], maxHours: Number(e.target.value) };
                              setJobTypeBaselines(v);
                            }}
                          />
                          <span className="pointer-events-none absolute right-2.5 text-[11px] font-mono text-zinc-500">
                            jam
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 2: Multiplier Urgensi */}
        <section className="zentra-rivet-card rounded-3xl border border-white/10 bg-[#0B1916]/80 p-6 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Zap className="h-5 w-5 text-[#D4E751]" />
            <div>
              <h2 className="font-bold text-white text-base font-sans">Multiplier Urgensi (Timeline Sisa Hari)</h2>
              <p className="text-xs text-zinc-400">
                Pengali harga berdasarkan sisa hari menuju deadline pekerjaan.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-400 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Label Tier</th>
                  <th className="px-4 py-3">Min Hari</th>
                  <th className="px-4 py-3">Max Hari</th>
                  <th className="px-4 py-3">Multiplier (x)</th>
                  <th className="px-4 py-3">Tidak Layak?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {urgencyTiers.map((t, i) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">
                      <span className="inline-flex items-center rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-mono font-bold text-[#D4E751]">
                        {t.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-20 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-white focus:border-[#D4E751] focus:outline-none"
                        value={t.minDays ?? ""}
                        placeholder="0"
                        onChange={(e) => {
                          const v = [...urgencyTiers];
                          v[i] = { ...v[i], minDays: e.target.value === "" ? null : Number(e.target.value) };
                          setUrgencyTiers(v);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-20 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-white focus:border-[#D4E751] focus:outline-none"
                        value={t.maxDays ?? ""}
                        placeholder="∞"
                        onChange={(e) => {
                          const v = [...urgencyTiers];
                          v[i] = { ...v[i], maxDays: e.target.value === "" ? null : Number(e.target.value) };
                          setUrgencyTiers(v);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-flex items-center">
                        <input
                          type="number"
                          step="0.05"
                          className="w-24 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 pr-6 text-xs font-mono font-bold text-white focus:border-[#D4E751] focus:outline-none"
                          value={t.multiplier}
                          onChange={(e) => {
                            const v = [...urgencyTiers];
                            v[i] = { ...v[i], multiplier: Number(e.target.value) };
                            setUrgencyTiers(v);
                          }}
                        />
                        <span className="pointer-events-none absolute right-2 text-[11px] font-mono text-zinc-500">
                          x
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer font-mono">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#D4E751] focus:ring-[#D4E751]"
                          checked={t.notLayak}
                          onChange={(e) => {
                            const v = [...urgencyTiers];
                            v[i] = { ...v[i], notLayak: e.target.checked };
                            setUrgencyTiers(v);
                          }}
                        />
                        <span className={`text-xs font-semibold ${t.notLayak ? "text-red-400" : "text-zinc-500"}`}>
                          {t.notLayak ? "Ya (Tolak)" : "Tidak"}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 3: Multiplier Kompleksitas */}
        <section className="zentra-rivet-card rounded-3xl border border-white/10 bg-[#0B1916]/80 p-6 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Layers className="h-5 w-5 text-[#D4E751]" />
            <div>
              <h2 className="font-bold text-white text-base font-sans">Rentang Multiplier Kompleksitas</h2>
              <p className="text-xs text-zinc-400">Rentang batas multiplier minimum dan maksimum per tingkat kesulitan.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-400 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Tier Kompleksitas</th>
                  <th className="px-4 py-3">Min Multiplier (x)</th>
                  <th className="px-4 py-3">Max Multiplier (x)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {complexityTiers.map((c, i) => (
                  <tr key={c.label} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">
                      <span className="inline-flex items-center rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-zinc-300">
                        {c.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.05"
                        className="w-24 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-white focus:border-[#D4E751] focus:outline-none"
                        value={c.minMultiplier}
                        onChange={(e) => {
                          const v = [...complexityTiers];
                          v[i] = { ...v[i], minMultiplier: Number(e.target.value) };
                          setComplexityTiers(v);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.05"
                        className="w-24 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-white focus:border-[#D4E751] focus:outline-none"
                        value={c.maxMultiplier}
                        onChange={(e) => {
                          const v = [...complexityTiers];
                          v[i] = { ...v[i], maxMultiplier: Number(e.target.value) };
                          setComplexityTiers(v);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {saveError && (
            <span className="text-xs font-mono text-red-400">{saveError}</span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D4E751] hover:bg-[#C2D640] px-6 py-3 text-xs font-bold text-[#05100E] shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                <span>Perubahan Disimpan!</span>
              </>
            ) : saving ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Semua Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
