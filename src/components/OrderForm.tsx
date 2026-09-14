"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  AlertTriangle,
  Sparkles,
  Layers,
  User,
  Zap,
  ChevronRight,
} from "lucide-react";
import { formatRupiah, getDaysRemaining } from "@/lib/utils";
import { suggestComplexityTier } from "@/lib/pricing";

export const JOB_TYPES = [
  { value: "TUGAS_MINGGUAN", label: "Tugas Mingguan", badge: "Tugas" },
  { value: "TUBES", label: "Tugas Besar (Tubes) Semester", badge: "Tubes" },
  { value: "LAPORAN_MAGANG", label: "Laporan Magang", badge: "Magang" },
  { value: "KONSULTASI_ANALISIS_DATA", label: "Konsultasi Analisis Data / Statistik", badge: "Statistik" },
  { value: "DEVELOPMENT_PROJECT", label: "Development Project (App/Web/Script)", badge: "Dev" },
  { value: "LAINNYA", label: "Lainnya", badge: "Lainnya" },
];

export interface OrderFormValues {
  clientName: string;
  clientContact: string;
  jobType: string;
  notes: string;
  deadline: string; // yyyy-mm-dd
  estimatedHours: number;
  baseRate: number;
  complexityTierLabel: string;
  complexityMultiplier: number;
  additionalCost: number;
  numFeatures: number;
  needsResearch: boolean;
  externalApiDependency: boolean;
  needsArchitectureDesign: boolean;
}

export const DEFAULT_ORDER_FORM_VALUES: OrderFormValues = {
  clientName: "",
  clientContact: "",
  jobType: "TUGAS_MINGGUAN",
  notes: "",
  deadline: "",
  estimatedHours: 4,
  baseRate: 50000,
  complexityTierLabel: "LOW",
  complexityMultiplier: 1.0,
  additionalCost: 0,
  numFeatures: 1,
  needsResearch: false,
  externalApiDependency: false,
  needsArchitectureDesign: false,
};

export interface SubmitResult {
  ok: boolean;
  error?: string;
  feasibilityWarning?: string;
}

interface UrgencyTierConfig {
  id: string;
  label: string;
  minDays: number | null;
  maxDays: number | null;
  multiplier: number;
  notLayak: boolean;
  sortOrder: number;
}

interface JobTypeBaselineConfig {
  jobType: string;
  minHours: number;
  maxHours: number;
}

export function OrderForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues?: OrderFormValues;
  submitLabel: string;
  onSubmit: (values: OrderFormValues, overrideFeasibilityWarning: boolean) => Promise<SubmitResult>;
}) {
  const [values, setValues] = useState<OrderFormValues>(initialValues ?? DEFAULT_ORDER_FORM_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [feasibilityWarning, setFeasibilityWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Configuration for live calculation
  const [urgencyTiers, setUrgencyTiers] = useState<UrgencyTierConfig[]>([]);
  const [baselines, setBaselines] = useState<JobTypeBaselineConfig[]>([]);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.urgencyTiers) setUrgencyTiers(data.urgencyTiers);
          if (data.jobTypeBaselines) setBaselines(data.jobTypeBaselines);
        }
      })
      .catch(() => {});
  }, []);

  function set<K extends keyof OrderFormValues>(key: K, value: OrderFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  // Quick preset deadline helper
  function setQuickDeadline(daysAhead: number) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const isoDate = d.toISOString().split("T")[0];
    set("deadline", isoDate);
  }

  // Suggested complexity tier based on checklist
  const suggestedTier = useMemo(() => {
    return suggestComplexityTier({
      numFeatures: values.numFeatures,
      needsResearch: values.needsResearch,
      externalApiDependency: values.externalApiDependency,
      needsArchitectureDesign: values.needsArchitectureDesign,
    });
  }, [values.numFeatures, values.needsResearch, values.externalApiDependency, values.needsArchitectureDesign]);

  const defaultMultiplierMap: Record<string, number> = {
    LOW: 1.0,
    MEDIUM: 1.2,
    HIGH: 1.5,
    EXPERT: 1.8,
  };

  function applySuggestedTier() {
    set("complexityTierLabel", suggestedTier);
    set("complexityMultiplier", defaultMultiplierMap[suggestedTier] ?? 1.0);
  }

  // Live calculation metrics
  const liveDays = useMemo(() => {
    if (!values.deadline) return 7; // default fallback
    const d = new Date(values.deadline);
    const now = new Date();
    const ms = d.getTime() - now.getTime();
    return Math.max(Math.ceil(ms / (1000 * 60 * 60 * 24)), 0);
  }, [values.deadline]);

  const liveUrgencyTier = useMemo(() => {
    if (urgencyTiers.length === 0) {
      // Fallback default multiplier heuristic
      if (liveDays <= 1) return { label: "Sangat Urgent (1 hari)", multiplier: 2.0 };
      if (liveDays <= 3) return { label: "Urgent (2-3 hari)", multiplier: 1.5 };
      if (liveDays <= 7) return { label: "Moderat (4-7 hari)", multiplier: 1.2 };
      return { label: "Normal (>7 hari)", multiplier: 1.0 };
    }
    const sorted = [...urgencyTiers].sort((a, b) => a.sortOrder - b.sortOrder);
    for (const tier of sorted) {
      const min = tier.minDays ?? 0;
      const max = tier.maxDays;
      if (liveDays >= min && (max === null || liveDays <= max)) {
        return tier;
      }
    }
    return sorted[sorted.length - 1] ?? { label: "Normal", multiplier: 1.0 };
  }, [liveDays, urgencyTiers]);

  const liveSubtotal = values.estimatedHours * values.baseRate;
  const liveUrgencyMultiplier = liveUrgencyTier.multiplier;
  const liveComplexityMultiplier = values.complexityMultiplier || 1.0;
  const liveAdditionalCost = values.additionalCost || 0;

  const liveTotalPrice = Math.round(
    liveSubtotal * liveUrgencyMultiplier * liveComplexityMultiplier + liveAdditionalCost
  );

  const effectiveDays = Math.max(liveDays, 1);
  const liveHoursPerDay = values.estimatedHours / effectiveDays;
  const isFeasibilityExceeded = liveHoursPerDay > 12;

  // Baseline hint for selected job type
  const currentBaseline = baselines.find((b) => b.jobType === values.jobType);

  async function submit(overrideFeasibilityWarning = false) {
    setSubmitting(true);
    setError(null);
    setFeasibilityWarning(null);

    if (!values.clientName.trim()) {
      setError("Nama klien wajib diisi.");
      setSubmitting(false);
      return;
    }
    if (!values.deadline) {
      setError("Deadline pekerjaan wajib dipilih.");
      setSubmitting(false);
      return;
    }

    const result = await onSubmit(values, overrideFeasibilityWarning);
    setSubmitting(false);
    if (result.feasibilityWarning) {
      setFeasibilityWarning(result.feasibilityWarning);
      return;
    }
    if (!result.ok) {
      setError(result.error ?? "Gagal menyimpan order.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Input Forms (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Card 1: Informasi Klien & Proyek */}
        <div className="zentra-rivet-card rounded-3xl border border-white/10 bg-[#0B1916]/85 p-6 backdrop-blur-md shadow-xl text-white">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/10">
            <User className="h-5 w-5 text-[#D4E751]" />
            <h2 className="font-semibold text-white text-base font-sans">Informasi Klien &amp; Pekerjaan</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Nama Klien <span className="text-rose-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-500 focus:border-[#D4E751] focus:outline-none focus:ring-1 focus:ring-[#D4E751]/20"
                    value={values.clientName}
                    onChange={(e) => set("clientName", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Kontak (WhatsApp / Email)
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    placeholder="0812xxxx atau user@mail.com"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-500 focus:border-[#D4E751] focus:outline-none focus:ring-1 focus:ring-[#D4E751]/20"
                    value={values.clientContact}
                    onChange={(e) => set("clientContact", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Kategori Pekerjaan <span className="text-rose-400">*</span>
              </label>
              <div className="mt-1.5">
                <select
                  className="w-full rounded-xl border border-white/15 bg-[#0B1916] px-3 py-2.5 text-xs font-mono text-white focus:border-[#D4E751] focus:outline-none"
                  value={values.jobType}
                  onChange={(e) => set("jobType", e.target.value)}
                >
                  {JOB_TYPES.map((jt) => (
                    <option key={jt.value} value={jt.value}>
                      {jt.label}
                    </option>
                  ))}
                </select>
                {currentBaseline && (
                  <p className="mt-1.5 text-xs font-mono text-[#D4E751] flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      Rekomendasi baseline: {currentBaseline.minHours} &ndash; {currentBaseline.maxHours} jam kerja
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Target Deadline <span className="text-rose-400">*</span>
                </label>
                {values.deadline && (
                  <span className="text-xs font-mono text-[#D4E751]">
                    {getDaysRemaining(values.deadline).label}
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  required
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-mono text-white focus:border-[#D4E751] focus:outline-none"
                  value={values.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickDeadline(1)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    +1 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDeadline(3)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    +3 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDeadline(7)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    +1 Minggu
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDeadline(14)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    +2 Minggu
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Catatan / Spesifikasi Singkat
              </label>
              <textarea
                rows={3}
                placeholder="Rincian fitur, batasan teknologi, lampiran referensi, dll..."
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-500 focus:border-[#D4E751] focus:outline-none"
                value={values.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Effort & Rate Dasar */}
        <div className="zentra-rivet-card rounded-3xl border border-white/10 bg-[#0B1916]/85 p-6 backdrop-blur-md shadow-xl text-white">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/10">
            <Clock className="h-5 w-5 text-[#D4E751]" />
            <h2 className="font-semibold text-white text-base font-sans">Effort &amp; Rate Dasar</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Estimasi Jam Kerja
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 pr-12 text-xs font-mono font-bold text-white focus:border-[#D4E751] focus:outline-none"
                  value={values.estimatedHours}
                  onChange={(e) => set("estimatedHours", Math.max(0, Number(e.target.value)))}
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-mono text-zinc-500">
                  jam
                </span>
              </div>
              <p className="mt-1 text-[11px] font-mono text-zinc-500">Total estimasi jam murni pengerjaan</p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Rate Dasar per Jam
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-mono text-zinc-500">
                  Rp
                </span>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  className="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-3 py-2 text-xs font-mono font-bold text-white focus:border-[#D4E751] focus:outline-none"
                  value={values.baseRate}
                  onChange={(e) => set("baseRate", Math.max(0, Number(e.target.value)))}
                />
              </div>
              <p className="mt-1 text-[11px] font-mono text-zinc-500">Standar umum: Rp 50.000 / jam</p>
            </div>
          </div>
        </div>

        {/* Card 3: Checklist Kompleksitas & Fitur Tambahan */}
        <div className="zentra-rivet-card rounded-3xl border border-white/10 bg-[#0B1916]/85 p-6 backdrop-blur-md shadow-xl text-white">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#D4E751]" />
              <h2 className="font-semibold text-white text-base font-sans">Checklist &amp; Kompleksitas</h2>
            </div>
            {/* Auto-suggest button */}
            <button
              type="button"
              onClick={applySuggestedTier}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4E751]/30 bg-[#D4E751]/10 px-2.5 py-1 text-xs font-mono font-semibold text-[#D4E751] hover:bg-[#D4E751]/20 transition-colors"
              title="Terapkan saran tier berdasarkan checklist"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Saran: {suggestedTier}</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Interactive checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#D4E751] focus:ring-[#D4E751]"
                  checked={values.needsResearch}
                  onChange={(e) => set("needsResearch", e.target.checked)}
                />
                <span className="text-xs font-mono text-zinc-300">Butuh riset / eksplorasi khusus</span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#D4E751] focus:ring-[#D4E751]"
                  checked={values.externalApiDependency}
                  onChange={(e) => set("externalApiDependency", e.target.checked)}
                />
                <span className="text-xs font-mono text-zinc-300">Integrasi API eksternal / 3rd party</span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 cursor-pointer transition-colors sm:col-span-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#D4E751] focus:ring-[#D4E751]"
                  checked={values.needsArchitectureDesign}
                  onChange={(e) => set("needsArchitectureDesign", e.target.checked)}
                />
                <span className="text-xs font-mono text-zinc-300">
                  Desain arsitektur sistem &amp; perancangan database dari nol
                </span>
              </label>
            </div>

            {/* Inputs: Features & Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Jumlah Fitur Terintegrasi
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-mono font-bold text-white focus:border-[#D4E751] focus:outline-none"
                  value={values.numFeatures}
                  onChange={(e) => set("numFeatures", Math.max(1, Number(e.target.value)))}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Tier Kompleksitas
                </label>
                <select
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0B1916] px-3 py-2 text-xs font-mono text-white focus:border-[#D4E751] focus:outline-none"
                  value={values.complexityTierLabel}
                  onChange={(e) => {
                    const tier = e.target.value;
                    set("complexityTierLabel", tier);
                    if (defaultMultiplierMap[tier]) {
                      set("complexityMultiplier", defaultMultiplierMap[tier]);
                    }
                  }}
                >
                  <option value="LOW">Low (1.0x)</option>
                  <option value="MEDIUM">Medium (1.2x)</option>
                  <option value="HIGH">High (1.5x)</option>
                  <option value="EXPERT">Expert (1.8x)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Multiplier Kompleksitas
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-mono font-bold text-white focus:border-[#D4E751] focus:outline-none"
                  value={values.complexityMultiplier}
                  onChange={(e) => set("complexityMultiplier", Number(e.target.value))}
                />
              </div>
            </div>

            {/* Additional Cost */}
            <div className="pt-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Biaya Tambahan Langsung (Hosting, API key, Aset berbayar)
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-mono text-zinc-500">
                  Rp
                </span>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  placeholder="0"
                  className="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-3 py-2 text-xs font-mono font-bold text-white focus:border-[#D4E751] focus:outline-none"
                  value={values.additionalCost}
                  onChange={(e) => set("additionalCost", Math.max(0, Number(e.target.value)))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Live Calculation Preview & Submit (5 cols, sticky) */}
      <div className="lg:col-span-5 sticky top-20 space-y-4">
        {/* Live Pricing Breakdown Card */}
        <div className="zentra-rivet-card rounded-3xl border border-white/15 bg-[#081916] p-6 shadow-2xl zentra-cta-glow text-white">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#D4E751]">
              <Zap className="h-4 w-4" />
              Live Pricing Preview
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-mono text-[#D4E751]">
              {liveUrgencyTier.label}
            </span>
          </div>

          {/* Grand Total */}
          <div className="py-5 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Estimasi Total Biaya</p>
            <p className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#D4E751] font-mono">
              {formatRupiah(liveTotalPrice)}
            </p>
          </div>

          {/* Step by Step Breakdown */}
          <div className="space-y-2.5 rounded-2xl bg-white/[0.035] p-4 text-xs font-mono backdrop-blur-md border border-white/10 shadow-2xs">
            <div className="flex items-center justify-between text-zinc-300">
              <span>
                Subtotal ({values.estimatedHours} jam &times; {formatRupiah(values.baseRate)})
              </span>
              <span className="font-semibold text-white">{formatRupiah(liveSubtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-1">
                Multiplier Urgensi ({liveDays} hari tersisa)
              </span>
              <span className="font-semibold text-[#D4E751]">&times; {liveUrgencyMultiplier}</span>
            </div>

            <div className="flex items-center justify-between text-zinc-300">
              <span>Multiplier Kompleksitas ({values.complexityTierLabel})</span>
              <span className="font-semibold text-[#D4E751]">&times; {liveComplexityMultiplier}</span>
            </div>

            {liveAdditionalCost > 0 && (
              <div className="flex items-center justify-between text-zinc-300">
                <span>Biaya Tambahan</span>
                <span className="font-semibold text-emerald-400">+ {formatRupiah(liveAdditionalCost)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-bold text-white text-sm">
              <span>Total Dihitung</span>
              <span className="text-[#D4E751]">{formatRupiah(liveTotalPrice)}</span>
            </div>
          </div>

          {/* Feasibility Indicator */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-zinc-400">Feasibility Beban Kerja</span>
              <span
                className={`font-bold ${
                  isFeasibilityExceeded
                    ? "text-red-400"
                    : liveHoursPerDay > 8
                    ? "text-amber-400"
                    : "text-[#D4E751]"
                }`}
              >
                {liveHoursPerDay.toFixed(1)} jam / hari
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full transition-all duration-300 ${
                  isFeasibilityExceeded
                    ? "bg-red-500"
                    : liveHoursPerDay > 8
                    ? "bg-amber-500"
                    : "bg-[#D4E751]"
                }`}
                style={{ width: `${Math.min((liveHoursPerDay / 16) * 100, 100)}%` }}
              />
            </div>

            <p className="mt-2 text-[11px] font-mono text-zinc-400">
              {isFeasibilityExceeded ? (
                <span className="text-red-400">
                  &bull; Melebihi batas aman (12 jam/hari). Butuh konfirmasi override.
                </span>
              ) : liveHoursPerDay > 8 ? (
                <span className="text-amber-400">
                  &bull; Jadwal padat (8&ndash;12 jam/hari).
                </span>
              ) : (
                <span className="text-[#D4E751]">
                  &bull; Beban kerja realistis &amp; aman (&le; 8 jam/hari).
                </span>
              )}
            </p>
          </div>

          {/* Feasibility Warning Message Box */}
          {feasibilityWarning && (
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs font-mono text-amber-300 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p>{feasibilityWarning}</p>
                  <button
                    type="button"
                    onClick={() => submit(true)}
                    className="w-full rounded-xl bg-amber-500 py-2 font-bold text-black shadow-xs hover:bg-amber-400 transition-colors"
                  >
                    Tetap Lanjutkan (Override Gate Feasibility)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-mono text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-5">
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4E751] hover:bg-[#C2D640] py-3.5 px-4 text-xs font-bold text-[#05100E] shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? (
                <span>Menghitung &amp; Menyimpan...</span>
              ) : (
                <>
                  <span>{submitLabel}</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Small Notice */}
        <p className="text-center font-mono text-[11px] text-zinc-500">
          Formula pricing otomatis: (Jam &times; Rate) &times; Urgensi &times; Kompleksitas.
        </p>
      </div>
    </div>
  );
}
