"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

type WorkflowStage = "intake" | "formula" | "quality" | "delivery";

const STAGES: { id: WorkflowStage; label: string; icon: any }[] = [
  { id: "intake", label: "Brief & Scope", icon: FileText },
  { id: "formula", label: "Formula Engine", icon: Cpu },
  { id: "quality", label: "Quality Gate", icon: ShieldCheck },
  { id: "delivery", label: "Delivery & Handover", icon: Zap },
];

const STAGE_DATA: Record<
  WorkflowStage,
  {
    leftCards: { title: string; subtitle: string; icon: any; tag: string }[];
    centerLabel: string;
    rightCards: { title: string; subtitle: string; icon: any; value: string; badgeColor: string }[];
  }
> = {
  intake: {
    leftCards: [
      {
        title: "Brief Kebutuhan Masuk",
        subtitle: "Spesifikasi & lampiran modul dianalisis",
        icon: FileText,
        tag: "12 modul terdeteksi",
      },
      {
        title: "Target Deadline",
        subtitle: "Pemeriksaan jadwal & kapasitas",
        icon: Clock,
        tag: "Sisa 3 hari (72 Jam)",
      },
      {
        title: "Kategori Pekerjaan",
        subtitle: "Tugas Besar / Development Fullstack",
        icon: Layers,
        tag: "Baseline 20 Jam",
      },
    ],
    centerLabel: "Intake Scanner",
    rightCards: [
      {
        title: "Feasibility Score",
        subtitle: "Kapasitas & kelayakan waktu",
        icon: CheckCircle2,
        value: "98% Layak",
        badgeColor: "text-[#D4E751] bg-[#D4E751]/10 border-[#D4E751]/20",
      },
      {
        title: "Batasan Etis Otak Rental",
        subtitle: "Bukan ghostwriting karya ilmiah skripsi",
        icon: ShieldCheck,
        value: "Verified Aman",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
    ],
  },
  formula: {
    leftCards: [
      {
        title: "Baseline Effort",
        subtitle: "20 Jam × Rp 50.000",
        icon: Layers,
        tag: "Subtotal: Rp 1.000.000",
      },
      {
        title: "Multiplier Urgensi",
        subtitle: "Tenggat waktu 3 hari (Mepet)",
        icon: Clock,
        tag: "Multiplier ×1.2",
      },
      {
        title: "Multiplier Kompleksitas",
        subtitle: "Fullstack Next.js + Database",
        icon: Cpu,
        tag: "Multiplier ×1.5",
      },
    ],
    centerLabel: "Pricing Engine",
    rightCards: [
      {
        title: "Total Estimasi Harga",
        subtitle: "(20j × 50rb) × 1.2 × 1.5",
        icon: Sparkles,
        value: "Rp 1.800.000",
        badgeColor: "text-[#D4E751] bg-[#D4E751]/10 border-[#D4E751]/20",
      },
      {
        title: "Breakdown Formula",
        subtitle: "Transparan per jam & risiko",
        icon: CheckCircle2,
        value: "Terbuka 100%",
        badgeColor: "text-white bg-white/10 border-white/15",
      },
    ],
  },
  quality: {
    leftCards: [
      {
        title: "Code Quality & Linting",
        subtitle: "ESLint, TypeScript strict check",
        icon: Cpu,
        tag: "0 Error, Clean Code",
      },
      {
        title: "Anti-Plagiarisme & Original",
        subtitle: "Struktur logika dibangun dari nol",
        icon: ShieldCheck,
        tag: "Similary < 5%",
      },
      {
        title: "Test Runs & Output Validation",
        subtitle: "Menjalankan test case sesuai soal",
        icon: CheckCircle2,
        tag: "100% Test Passed",
      },
    ],
    centerLabel: "Quality Gate",
    rightCards: [
      {
        title: "Standard Approval",
        subtitle: "Siap dipresentasikan ke dosen/tim",
        icon: CheckCircle2,
        value: "Siap Kirim",
        badgeColor: "text-[#D4E751] bg-[#D4E751]/10 border-[#D4E751]/20",
      },
      {
        title: "Dokumentasi & Readme",
        subtitle: "Langkah instalasi & penjelasan code",
        icon: FileText,
        value: "Termasuk",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
    ],
  },
  delivery: {
    leftCards: [
      {
        title: "Source Code & Deliverables",
        subtitle: "Repository Git / Zip terstruktur rapi",
        icon: Layers,
        tag: "Lengkap & Modular",
      },
      {
        title: "Panduan Jalankan Program",
        subtitle: "Video demo singkat & penjelasan cara run",
        icon: FileText,
        tag: "Mudah Dipahami",
      },
      {
        title: "Garansi Revisi Scope",
        subtitle: "Revisi sesuai kesepakatan brief awal",
        icon: ShieldCheck,
        tag: "Covered 7 Hari",
      },
    ],
    centerLabel: "Handover Node",
    rightCards: [
      {
        title: "Client Satisfaction",
        subtitle: "Nilai rata-rata review pengguna",
        icon: Sparkles,
        value: "4.9 / 5.0",
        badgeColor: "text-[#D4E751] bg-[#D4E751]/10 border-[#D4E751]/20",
      },
      {
        title: "WhatsApp After-Sales",
        subtitle: "Dukungan tanya jawab jika bingung",
        icon: CheckCircle2,
        value: "Responsif",
        badgeColor: "text-white bg-white/10 border-white/15",
      },
    ],
  },
};

export function InteractiveWorkflowShowcase() {
  const [activeStage, setActiveStage] = useState<WorkflowStage>("formula");
  const stage = STAGE_DATA[activeStage];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Top Segmented Controls - Responsive Swipeable Bar on Mobile */}
      <div className="w-full flex justify-center mb-6 px-2">
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0B1916]/90 p-1.5 backdrop-blur-md">
          {STAGES.map((s) => {
            const Icon = s.icon;
            const isActive = activeStage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStage(s.id)}
                className={`relative flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-mono transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive ? "text-[#D4E751] font-semibold" : "text-zinc-400 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePipelineStage"
                    className="absolute inset-0 rounded-xl bg-white/15 border border-white/10 shadow-inner"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`relative z-10 h-3.5 w-3.5 ${isActive ? "text-[#D4E751]" : "text-zinc-500"}`} />
                <span className="relative z-10">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Showcase Window Frame - Zentra Dark Glass Canvas */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-[#071412]/90 backdrop-blur-md p-4 sm:p-8 zentra-grid-bg shadow-2xl overflow-hidden">
        {/* Ambient radial glow inside window */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-[#D4E751]/10 blur-[100px]" />

        {/* Window Top Controls (3 dots) */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70 border border-red-400/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70 border border-yellow-400/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70 border border-green-400/30" />
            <span className="ml-3 font-mono text-[11px] text-zinc-500 uppercase tracking-widest hidden sm:inline">
              OTAK_RENTAL_CORE_ENGINE v2.4 // {activeStage.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-[#D4E751]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#D4E751] animate-pulse" />
            <span>LIVE PIPELINE</span>
          </div>
        </div>

        {/* Interactive Node Flow Canvas */}
        <div className="relative mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-11 items-center gap-4 sm:gap-6">
          {/* Left Column: Input Nodes (3 cards) */}
          <div className="lg:col-span-4 space-y-2.5 sm:space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35 }}
                className="space-y-2.5 sm:space-y-3"
              >
                {stage.leftCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                      whileHover={{ y: -3, x: 2, scale: 1.01 }}
                      className="zentra-rivet-card rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 hover:border-[#D4E751]/40 hover:bg-white/[0.05] transition-all group cursor-default text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#D4E751] shrink-0 group-hover:scale-105 transition-transform">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white leading-tight">{card.title}</p>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-normal">{card.subtitle}</p>
                          <span className="mt-2 inline-block rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                            {card.tag}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center Column: Processing Hub with Zentra Emblem */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center py-4 lg:py-0">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-20 sm:h-24 w-20 sm:w-24 rounded-full border border-[#D4E751]/40"
              />
              <div className="absolute h-16 sm:h-20 w-16 sm:w-20 rounded-full border border-[#D4E751]/20" />

              {/* Central spinning emblem badge */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative flex h-14 sm:h-16 w-14 sm:w-16 items-center justify-center rounded-2xl border border-white/20 bg-[#0B1E1A] shadow-xl zentra-rivet-card cursor-pointer p-2 overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="h-full w-full"
                >
                  <Image
                    src="/logo-icon.png"
                    alt="Otak Rental"
                    width={56}
                    height={56}
                    className="h-full w-full object-contain"
                  />
                </motion.div>
              </motion.div>
            </div>

            <p className="mt-3 sm:mt-4 font-mono text-xs text-[#D4E751] font-semibold uppercase tracking-wider">
              {stage.centerLabel}
            </p>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 font-mono mt-0.5">Automated Logic Pipeline</p>
          </div>

          {/* Right Column: Output / Result Nodes (2 cards) */}
          <div className="lg:col-span-4 space-y-2.5 sm:space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage + "-right"}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35 }}
                className="space-y-2.5 sm:space-y-3 text-left"
              >
                {stage.rightCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      whileHover={{ y: -3, x: -2, scale: 1.01 }}
                      className="zentra-rivet-card rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 hover:border-[#D4E751]/50 transition-all group cursor-default"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="h-4 w-4 text-[#D4E751] shrink-0" />
                          <p className="text-xs font-semibold text-white leading-tight truncate">{card.title}</p>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] sm:text-xs font-mono font-semibold shrink-0 ${card.badgeColor}`}
                        >
                          {card.value}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal">{card.subtitle}</p>
                    </motion.div>
                  );
                })}

                {/* Micro Action Button under right cards */}
                <a
                  href="#kalkulator"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#D4E751]/30 bg-[#D4E751]/10 hover:bg-[#D4E751]/20 py-2.5 text-xs font-semibold text-[#D4E751] transition-all cursor-pointer"
                >
                  <span>Coba Simulasi Harga Mandiri</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
