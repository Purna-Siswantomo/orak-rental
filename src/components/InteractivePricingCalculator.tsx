"use client";

import { useState } from "react";
import {
  Calculator,
  Sliders,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface JobTypeOption {
  key: string;
  name: string;
  defaultHours: number;
  ratePerHour: number;
  description: string;
}

const JOB_OPTIONS: JobTypeOption[] = [
  {
    key: "DEVELOPMENT_PROJECT",
    name: "Development Project / Web / App",
    defaultHours: 25,
    ratePerHour: 50000,
    description: "Pembuatan aplikasi, website, bot, atau sistem backend/frontend.",
  },
  {
    key: "TUBES",
    name: "Tugas Besar (Tubes) Pemrograman",
    defaultHours: 15,
    ratePerHour: 45000,
    description: "Proyek tubes praktikum, algoritma, database, OOP, struktur data.",
  },
  {
    key: "KONSULTASI_ANALISIS_DATA",
    name: "Konsultasi Analisis Data (SPSS/Python/R)",
    defaultHours: 10,
    ratePerHour: 60000,
    description: "Pengolahan statistik, visualisasi data, machine learning dasar.",
  },
  {
    key: "TUGAS_MINGGUAN",
    name: "Tugas Mingguan & Praktikum",
    defaultHours: 4,
    ratePerHour: 35000,
    description: "Soal coding mingguan, laporan modul lab, bug fix ringan.",
  },
  {
    key: "LAPORAN_MAGANG",
    name: "Laporan Teknis / Magang",
    defaultHours: 12,
    ratePerHour: 35000,
    description: "Dokumentasi arsitektur sistem, flow chart, laporan magang teknis.",
  },
];

const URGENCIES = [
  { id: "SANTAI", label: "Santai (> 7 Hari)", mult: 1.0 },
  { id: "NORMAL", label: "Normal (4 - 7 Hari)", mult: 1.15 },
  { id: "MEPET", label: "Mepet (2 - 3 Hari)", mult: 1.35 },
  { id: "KILAT", label: "Kilat (< 24 - 48 Jam)", mult: 1.65 },
];

const COMPLEXITIES = [
  { id: "STANDARD", label: "Standar (Sesuai Modul)", mult: 1.0 },
  { id: "MEDIUM", label: "Medium (Integrasi API/DB)", mult: 1.25 },
  { id: "HARD", label: "Kompleks (Multi-service/AI)", mult: 1.55 },
];

export function InteractivePricingCalculator() {
  const [selectedJobKey, setSelectedJobKey] = useState<string>("DEVELOPMENT_PROJECT");
  const currentJob = JOB_OPTIONS.find((j) => j.key === selectedJobKey) || JOB_OPTIONS[0];

  const [hours, setHours] = useState<number>(currentJob.defaultHours);
  const [urgencyIndex, setUrgencyIndex] = useState<number>(1); // Normal
  const [complexityIndex, setComplexityIndex] = useState<number>(1); // Medium

  const urgency = URGENCIES[urgencyIndex];
  const complexity = COMPLEXITIES[complexityIndex];

  // Calculation formula
  const baseSubtotal = hours * currentJob.ratePerHour;
  const totalPrice = Math.round(baseSubtotal * urgency.mult * complexity.mult);

  function handleSelectJob(jobKey: string) {
    setSelectedJobKey(jobKey);
    const found = JOB_OPTIONS.find((j) => j.key === jobKey);
    if (found) {
      setHours(found.defaultHours);
    }
  }

  // Pre-filled WhatsApp link
  const waMessage = encodeURIComponent(
    `Halo Otak Rental, saya ingin konsultasi kebutuhan:\n` +
      `- Kategori: ${currentJob.name}\n` +
      `- Estimasi Kerja: ${hours} Jam\n` +
      `- Urgensi: ${urgency.label}\n` +
      `- Kompleksitas: ${complexity.label}\n` +
      `- Hasil Simulasi: ${formatRupiah(totalPrice)}\n\n` +
      `Boleh minta review feasibility dan diskusi detailnya? Terima kasih!`
  );
  const waUrl = `https://wa.me/6288221401935?text=${waMessage}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-5xl mx-auto rounded-3xl border border-[#DCE3DF] bg-white p-6 sm:p-10 shadow-xl shadow-zinc-900/5"
    >
      {/* Top Header of Calculator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-zinc-200/80 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4E751]/25 px-3 py-1 text-xs font-mono font-semibold text-[#05100E] border border-[#D4E751]/40">
            <Calculator className="h-3.5 w-3.5" />
            SIMULASI HARGA REAL-TIME
          </span>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 font-sans">
            Hitung perkiraan biaya, <span className="font-serif-italic text-2xl text-emerald-950">secara transparan</span>
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Formula yang sama dengan yang dipakai admin: (Jam × Rate) × Urgensi × Kompleksitas.
          </p>
        </div>

        <div className="text-left sm:text-right sm:border-l sm:border-zinc-200 sm:pl-8 min-w-[200px]">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Estimasi Biaya</p>
          <div className="mt-1 h-10 flex items-center sm:justify-end overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={totalPrice}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-950 font-mono"
              >
                {formatRupiah(totalPrice)}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Job Type Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
              1. Pilih Kategori Pekerjaan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {JOB_OPTIONS.map((job) => {
                const isSelected = job.key === selectedJobKey;
                return (
                  <motion.button
                    key={job.key}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectJob(job.key)}
                    className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? "border-emerald-900 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-900/20"
                        : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${isSelected ? "text-emerald-950" : "text-zinc-800"}`}>
                      {job.name}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-500 mt-1">
                      Rate: {formatRupiah(job.ratePerHour)}/jam
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 2. Working Hours Slider */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-600">
                2. Estimasi Durasi Pengerjaan
              </label>
              <span className="inline-flex items-center rounded-lg bg-white border border-zinc-200 px-3 py-1 font-mono text-sm font-bold text-emerald-950 shadow-2xs">
                {hours} Jam
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={60}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-900"
            />
            <div className="flex justify-between text-[11px] font-mono text-zinc-400 mt-2">
              <span>1 Jam (Tugas Singkat)</span>
              <span>25 Jam (Standar Proyek)</span>
              <span>60 Jam (Skala Besar)</span>
            </div>
          </div>

          {/* 3. Urgency & Complexity Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Urgency */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                3. Urgensi Waktu
              </label>
              <div className="space-y-1.5">
                {URGENCIES.map((u, idx) => (
                  <motion.button
                    key={u.id}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUrgencyIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-colors cursor-pointer ${
                      urgencyIndex === idx
                        ? "border-emerald-900 bg-emerald-50 text-emerald-950 font-semibold shadow-2xs"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <span>{u.label}</span>
                    <span className="font-mono text-[11px] text-zinc-500">×{u.mult}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Complexity */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                4. Tingkat Kompleksitas
              </label>
              <div className="space-y-1.5">
                {COMPLEXITIES.map((c, idx) => (
                  <motion.button
                    key={c.id}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setComplexityIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-colors cursor-pointer ${
                      complexityIndex === idx
                        ? "border-emerald-900 bg-emerald-50 text-emerald-950 font-semibold shadow-2xs"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="font-mono text-[11px] text-zinc-500">×{c.mult}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary & WhatsApp CTA (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200 bg-zinc-900 text-white p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Rincian Perhitungan</span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-mono text-[#D4E751]">
              Formula Terbuka
            </span>
          </div>

          <div className="mt-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between text-zinc-300">
              <span>Baseline jam kerja ({hours} jam × {formatRupiah(currentJob.ratePerHour)})</span>
              <span className="font-mono text-white font-medium">{formatRupiah(baseSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span>Pengali Urgensi ({urgency.label.split("(")[0]})</span>
              <span className="font-mono text-[#D4E751]">×{urgency.mult}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span>Pengali Kompleksitas ({complexity.label.split("(")[0]})</span>
              <span className="font-mono text-[#D4E751]">×{complexity.mult}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Total Estimasi</span>
              <span className="text-2xl font-bold font-mono text-white tracking-tight">
                {formatRupiah(totalPrice)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              *Harga final dipastikan saat peninjauan berkas &amp; brief di WhatsApp agar adil untuk kedua pihak.
            </p>
          </div>

          <motion.a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-[#D4E751] hover:bg-[#C2D640] py-3 text-xs font-bold text-[#05100E] shadow-sm transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Diskusi Hasil Ini via WhatsApp</span>
          </motion.a>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-400 justify-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#D4E751]" />
            <span>Tanpa komitmen bayar di awal sebelum sepakat</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
