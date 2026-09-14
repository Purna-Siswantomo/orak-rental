"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Copy,
  Check,
  Calculator,
} from "lucide-react";
import { OrderForm, type OrderFormValues, type SubmitResult } from "@/components/OrderForm";
import {
  formatRupiah,
  formatDateIndo,
  getDaysRemaining,
  JOB_TYPE_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from "@/lib/utils";

interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  clientContact: string | null;
  jobType: string;
  notes: string | null;
  deadline: string;
  estimatedHours: number;
  baseRate: number;
  urgencyMultiplier: number;
  complexityTierLabel: string;
  complexityMultiplier: number;
  additionalCost: number;
  totalPrice: number;
  complexityChecklist: string | null;
  feasibilityWarning: string | null;
  paymentStatus: string;
}

function toFormValues(order: Order): OrderFormValues {
  const checklist = order.complexityChecklist
    ? JSON.parse(order.complexityChecklist)
    : { numFeatures: 1, needsResearch: false, externalApiDependency: false, needsArchitectureDesign: false };

  return {
    clientName: order.clientName,
    clientContact: order.clientContact ?? "",
    jobType: order.jobType,
    notes: order.notes ?? "",
    deadline: order.deadline.slice(0, 10),
    estimatedHours: order.estimatedHours,
    baseRate: order.baseRate,
    complexityTierLabel: order.complexityTierLabel,
    complexityMultiplier: order.complexityMultiplier,
    additionalCost: order.additionalCost,
    numFeatures: checklist.numFeatures ?? 1,
    needsResearch: checklist.needsResearch ?? false,
    externalApiDependency: checklist.externalApiDependency ?? false,
    needsArchitectureDesign: checklist.needsArchitectureDesign ?? false,
  };
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data: Order) => {
        setOrder(data);
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(
    values: OrderFormValues,
    overrideFeasibilityWarning: boolean
  ): Promise<SubmitResult> {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: values.clientName,
        clientContact: values.clientContact || undefined,
        jobType: values.jobType,
        notes: values.notes || undefined,
        deadline: values.deadline,
        estimatedHours: values.estimatedHours,
        baseRate: values.baseRate,
        complexityTierLabel: values.complexityTierLabel,
        complexityMultiplier: values.complexityMultiplier,
        additionalCost: values.additionalCost,
        complexityChecklist: {
          numFeatures: values.numFeatures,
          needsResearch: values.needsResearch,
          externalApiDependency: values.externalApiDependency,
          needsArchitectureDesign: values.needsArchitectureDesign,
        },
        overrideFeasibilityWarning,
      }),
    });
    const data = await res.json();

    if (res.status === 422) {
      return { ok: false, feasibilityWarning: data.message };
    }
    if (!res.ok) {
      return { ok: false, error: data.error };
    }

    load();
    return { ok: true };
  }

  async function handlePaymentStatusChange(newStatus: string) {
    setSavingPayment(true);
    setStatusMessage(null);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: newStatus }),
    });
    const data = await res.json();
    setSavingPayment(false);
    if (!res.ok) {
      setStatusMessage(data.error ?? "Gagal memperbarui status.");
      return;
    }
    setStatusMessage("Status pembayaran berhasil diperbarui!");
    setTimeout(() => setStatusMessage(null), 3000);
    load();
  }

  async function handleDelete() {
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin");
    }
  }

  function copyWhatsAppQuote() {
    if (!order) return;
    const jobInfo = JOB_TYPE_CONFIG[order.jobType]?.label ?? order.jobType;
    const daysInfo = getDaysRemaining(order.deadline);

    const message = `Halo Kak ${order.clientName},
Berikut rincian penawaran & jadwal untuk pengerjaan *${jobInfo}*:

📅 Target Deadline: ${formatDateIndo(order.deadline)} (${daysInfo.label})
⏱ Estimasi Jam Kerja: ${order.estimatedHours} jam
📊 Tingkat Kompleksitas: ${order.complexityTierLabel}
💰 Total Estimasi Biaya: *${formatRupiah(order.totalPrice)}*
${order.notes ? `📝 Catatan: ${order.notes}\n` : ""}
Sistem kalkulasi menggunakan standar perhitungan transparan (Effort × Urgensi × Kompleksitas).
Silakan kabari apabila detail di atas sudah sesuai agar dapat segera dijadwalkan pengerjaannya. Terima kasih! 🙏`;

    navigator.clipboard.writeText(message);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2500);
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
        <p className="mt-3 text-sm text-slate-500">Memuat rincian order...</p>
      </main>
    );
  }

  const jobInfo = JOB_TYPE_CONFIG[order.jobType] ?? {
    label: order.jobType,
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  };
  const paymentInfo = PAYMENT_STATUS_CONFIG[order.paymentStatus] ?? {
    label: order.paymentStatus,
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  };
  const daysInfo = getDaysRemaining(order.deadline);
  const subtotal = order.estimatedHours * order.baseRate;

  return (
    <main className="min-h-screen bg-[#05100E] text-white zentra-grid-bg py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <Link href="/admin" className="hover:text-[#D4E751] transition-colors">
              Daftar Order
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">Detail Order #{order.id.slice(-6)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali</span>
            </Link>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-mono text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Order</span>
            </button>
          </div>
        </div>

        {/* Hero Overview Card */}
        <div className="zentra-rivet-card rounded-3xl border border-white/10 bg-[#0B1916]/85 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-bold ${jobInfo.bg} ${jobInfo.text} ${jobInfo.border}`}
              >
                {jobInfo.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${paymentInfo.badge}`}
              >
                <span className={`h-2 w-2 rounded-full ${paymentInfo.dot}`} />
                {paymentInfo.label}
              </span>
              {order.feasibilityWarning && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Feasibility Warning</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              {order.clientName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
              <span>
                Kontak: <strong className="text-white">{order.clientContact || "Tidak dicantumkan"}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Deadline: <strong className="text-white">{formatDateIndo(order.deadline)}</strong> ({daysInfo.label})
              </span>
              <span>&bull;</span>
              <span>Dibuat: {formatDateIndo(order.createdAt)}</span>
            </div>
          </div>

          {/* Large Total Price & WhatsApp Action */}
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <div className="text-left md:text-right">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">Total Biaya Order</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#D4E751] tracking-tight font-mono">
                {formatRupiah(order.totalPrice)}
              </p>
            </div>

            <button
              onClick={copyWhatsAppQuote}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D4E751] hover:bg-[#C2D640] px-4 py-2.5 text-xs font-bold text-[#05100E] shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              {copiedWa ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Format WhatsApp Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Salin Penawaran WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Payment Status Selector */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              Ubah Status Pembayaran:
            </span>
            <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-mono">
              {[
                { id: "UNPAID", label: "Belum Dibayar" },
                { id: "PAID", label: "Lunas / Dibayar" },
                { id: "REFUNDED", label: "Dikembalikan" },
              ].map((st) => (
                <button
                  key={st.id}
                  disabled={savingPayment}
                  onClick={() => handlePaymentStatusChange(st.id)}
                  className={`rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
                    order.paymentStatus === st.id
                      ? "bg-white/15 text-[#D4E751] shadow-xs font-bold border border-white/10"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {statusMessage && (
            <span className="text-xs font-mono text-[#D4E751] animate-in fade-in">
              {statusMessage}
            </span>
          )}
        </div>
      </div>

      {/* Visual Pricing Formula Breakdown Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 font-sans">
          <Calculator className="h-4 w-4 text-[#D4E751]" />
          <span>Rincian Kalkulasi Rumus Pricing</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1: Base Effort */}
          <div className="zentra-rivet-card rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              1. Base Effort
            </span>
            <p className="text-lg font-bold text-white font-mono">
              {order.estimatedHours} jam &times; {formatRupiah(order.baseRate)}
            </p>
            <p className="text-xs font-mono text-[#D4E751]">
              Subtotal: {formatRupiah(subtotal)}
            </p>
          </div>

          {/* Step 2: Urgency Multiplier */}
          <div className="zentra-rivet-card rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              2. Multiplier Urgensi
            </span>
            <p className="text-lg font-bold text-white font-mono">
              &times; {order.urgencyMultiplier}x
            </p>
            <p className="text-xs font-mono text-zinc-400">
              Sisa {daysInfo.days} hari ke deadline
            </p>
          </div>

          {/* Step 3: Complexity Multiplier */}
          <div className="zentra-rivet-card rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              3. Multiplier Kompleksitas
            </span>
            <p className="text-lg font-bold text-white font-mono">
              &times; {order.complexityMultiplier}x
            </p>
            <p className="text-xs font-mono text-[#D4E751]">
              Tier: {order.complexityTierLabel}
            </p>
          </div>

          {/* Step 4: Additional Cost */}
          <div className="zentra-rivet-card rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              4. Biaya Tambahan
            </span>
            <p className="text-lg font-bold text-white font-mono">
              + {formatRupiah(order.additionalCost)}
            </p>
            <p className="text-xs font-mono text-zinc-400">
              Hosting, API, atau aset luar
            </p>
          </div>
        </div>

        {/* Formula Summary Line */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs font-mono text-zinc-300 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong className="text-white">Formula Lengkap:</strong> ({order.estimatedHours} jam &times; {formatRupiah(order.baseRate)}) &times; {order.urgencyMultiplier} (Urgensi) &times; {order.complexityMultiplier} (Kompleksitas) + {formatRupiah(order.additionalCost)}
          </span>
          <span className="font-bold text-[#D4E751] text-sm whitespace-nowrap">
            = {formatRupiah(order.totalPrice)}
          </span>
        </div>
      </div>

      {/* Edit Order Section */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white font-sans">Edit &amp; Hitung Ulang Order</h2>
          <p className="text-xs text-zinc-400">
            Perubahan parameter di bawah akan langsung menghitung ulang total harga dan mengecek ambang feasibility.
          </p>
        </div>

        <OrderForm
          key={order.updatedAt}
          initialValues={toFormValues(order)}
          submitLabel="Hitung Ulang &amp; Simpan Perubahan"
          onSubmit={handleSubmit}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0B1916] p-6 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Konfirmasi Hapus Order</h3>
            </div>

            <p className="text-sm text-zinc-300">
              Apakah Anda yakin ingin menghapus order atas nama <strong className="text-white">{order.clientName}</strong>? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono text-zinc-300 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-mono font-bold text-white shadow-xs hover:bg-red-500"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
