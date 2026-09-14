import { formatRupiah } from "@/lib/utils";

// Preview formula asli aplikasi ini (bukan mockup fiktif) dengan angka contoh
// yang jelas dilabeli "Contoh". Kalkulator sungguhan ada di /admin, dipakai
// admin setelah diskusi kebutuhan klien.
const EXAMPLE = {
  category: "Tugas Besar (Tubes)",
  hours: 20,
  rate: 50000,
  urgency: 1.2,
  complexity: 1.5,
};

export function PricingPreview() {
  const subtotal = EXAMPLE.hours * EXAMPLE.rate;
  const total = subtotal * EXAMPLE.urgency * EXAMPLE.complexity;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-zinc-500">Contoh kalkulasi</span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400">
          {EXAMPLE.category}
        </span>
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{formatRupiah(total)}</p>

      <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-sm">
        <div className="flex items-center justify-between text-zinc-400">
          <span>
            {EXAMPLE.hours} jam &times; {formatRupiah(EXAMPLE.rate)}
          </span>
          <span className="font-mono text-zinc-300">{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-400">
          <span>Multiplier urgensi</span>
          <span className="font-mono text-zinc-300">&times;{EXAMPLE.urgency}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-400">
          <span>Multiplier kompleksitas</span>
          <span className="font-mono text-zinc-300">&times;{EXAMPLE.complexity}</span>
        </div>
      </div>
    </div>
  );
}
