"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { OrderForm, type OrderFormValues, type SubmitResult } from "@/components/OrderForm";

export default function NewOrderPage() {
  const router = useRouter();

  async function handleSubmit(
    values: OrderFormValues,
    overrideFeasibilityWarning: boolean
  ): Promise<SubmitResult> {
    const res = await fetch("/api/orders", {
      method: "POST",
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

    router.push(`/admin/orders/${data.order.id}`);
    return { ok: true };
  }

  return (
    <main className="min-h-screen bg-[#05100E] text-white zentra-grid-bg py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <Link href="/admin" className="hover:text-[#D4E751] transition-colors">
                Daftar Order
              </Link>
              <span>/</span>
              <span className="text-white font-semibold">Buat Order Baru</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
              Kalkulator &amp; Buat Order Baru
            </h1>
            <p className="text-sm text-zinc-400">
              Masukkan parameter pengerjaan untuk kalkulasi harga otomatis berbasis effort, urgensi, dan kompleksitas.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Daftar</span>
          </Link>
        </div>

        {/* Ethical Guard Banner */}
        <div className="zentra-rivet-card rounded-2xl border border-white/10 bg-[#0B1916]/80 p-5 text-xs text-zinc-300 flex items-start gap-3 backdrop-blur-sm">
          <ShieldAlert className="h-5 w-5 text-[#D4E751] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white font-mono uppercase tracking-wider">
              Kebijakan Etis Platform Otak Rental:
            </p>
            <p className="text-zinc-400 leading-relaxed font-sans">
              Platform secara ketat menolak pengerjaan joki skripsi, tesis, disertasi, atau naskah publikasi ilmiah.
              Untuk kategori <strong className="text-white">Konsultasi Analisis Data</strong>, keterlibatan sebatas bimbingan metodologi/statistik
              dengan disclosure yang disetujui pembimbing.
            </p>
          </div>
        </div>

        {/* Enhanced Order Form */}
        <OrderForm submitLabel="Simpan &amp; Proses Order" onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
