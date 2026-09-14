// Utility functions for formatting and badges

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function getDaysRemaining(deadlineStr: string | Date): {
  days: number;
  label: string;
  isUrgent: boolean;
  isOverdue: boolean;
} {
  const d = typeof deadlineStr === "string" ? new Date(deadlineStr) : deadlineStr;
  const now = new Date();
  // reset hours to midnight for date-only comparison
  const dMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.ceil((dMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: diffDays, label: `Lewat ${Math.abs(diffDays)} hari`, isUrgent: true, isOverdue: true };
  }
  if (diffDays === 0) {
    return { days: 0, label: "Hari ini", isUrgent: true, isOverdue: false };
  }
  if (diffDays === 1) {
    return { days: 1, label: "Besok (1 hari)", isUrgent: true, isOverdue: false };
  }
  return {
    days: diffDays,
    label: `${diffDays} hari lagi`,
    isUrgent: diffDays <= 3,
    isOverdue: false,
  };
}

export const JOB_TYPE_CONFIG: Record<
  string,
  { label: string; shortLabel: string; bg: string; text: string; border: string; desc: string }
> = {
  TUGAS_MINGGUAN: {
    label: "Tugas Mingguan",
    shortLabel: "Tugas",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    desc: "Tugas lab, kuis, atau PR mingguan kuliah",
  },
  TUBES: {
    label: "Tugas Besar (Tubes)",
    shortLabel: "Tubes",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    desc: "Tubes semester, project kelompok/individu",
  },
  LAPORAN_MAGANG: {
    label: "Laporan Magang",
    shortLabel: "Magang",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    desc: "Laporan teknis magang non-akademik final",
  },
  KONSULTASI_ANALISIS_DATA: {
    label: "Konsultasi Analisis Data / Statistik",
    shortLabel: "Statistik",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    desc: "Pendampingan data/analisis ber-disclosure",
  },
  DEVELOPMENT_PROJECT: {
    label: "Development Project",
    shortLabel: "Dev",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    desc: "Aplikasi, website MVP, skrip otomasi",
  },
  LAINNYA: {
    label: "Lainnya",
    shortLabel: "Lainnya",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    desc: "Permintaan teknis lainnya",
  },
};

export const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  UNPAID: {
    label: "Belum Dibayar",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  PAID: {
    label: "Lunas / Dibayar",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  REFUNDED: {
    label: "Dikembalikan",
    badge: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
  },
};

export const COMPLEXITY_TIER_CONFIG: Record<
  string,
  { label: string; badge: string; color: string }
> = {
  LOW: { label: "Low", badge: "bg-slate-100 text-slate-700 border-slate-200", color: "text-slate-600" },
  MEDIUM: { label: "Medium", badge: "bg-blue-50 text-blue-700 border-blue-200", color: "text-blue-600" },
  HIGH: { label: "High", badge: "bg-orange-50 text-orange-700 border-orange-200", color: "text-orange-600" },
  EXPERT: { label: "Expert", badge: "bg-purple-50 text-purple-700 border-purple-200", color: "text-purple-600" },
};
