"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ClipboardList,
  PlusCircle,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  formatRupiah,
  formatDateIndo,
  getDaysRemaining,
  JOB_TYPE_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from "@/lib/utils";

interface OrderRow {
  id: string;
  createdAt: string;
  clientName: string;
  clientContact: string | null;
  jobType: string;
  deadline: string;
  totalPrice: number;
  paymentStatus: string;
  feasibilityWarning: string | null;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedJobType, setSelectedJobType] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "DEADLINE" | "PRICE">("NEWEST");

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data))
      .catch(() => setOrders([]));
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    if (!orders) return { total: 0, revenue: 0, unpaidCount: 0, unpaidAmount: 0, paidCount: 0, paidAmount: 0 };
    const total = orders.length;
    const revenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const unpaid = orders.filter((o) => o.paymentStatus === "UNPAID");
    const paid = orders.filter((o) => o.paymentStatus === "PAID");

    return {
      total,
      revenue,
      unpaidCount: unpaid.length,
      unpaidAmount: unpaid.reduce((sum, o) => sum + o.totalPrice, 0),
      paidCount: paid.length,
      paidAmount: paid.reduce((sum, o) => sum + o.totalPrice, 0),
    };
  }, [orders]);

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let list = [...orders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.clientName.toLowerCase().includes(q) ||
          (o.clientContact && o.clientContact.toLowerCase().includes(q))
      );
    }

    if (selectedStatus !== "ALL") {
      list = list.filter((o) => o.paymentStatus === selectedStatus);
    }

    if (selectedJobType !== "ALL") {
      list = list.filter((o) => o.jobType === selectedJobType);
    }

    list.sort((a, b) => {
      if (sortBy === "DEADLINE") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "PRICE") {
        return b.totalPrice - a.totalPrice;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [orders, searchQuery, selectedStatus, selectedJobType, sortBy]);

  return (
    <main className="min-h-screen bg-[#05100E] text-white zentra-grid-bg py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Banner / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D4E751]" />
              <span className="font-mono text-xs text-[#D4E751] uppercase tracking-widest">
                PORTAL ADMINISTRASI &bull; LIVE DATABASE
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white font-sans">
              Daftar &amp; Manajemen Order
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Pantau kalkulasi harga dinamis, status pembayaran klien, dan timeline pengerjaan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/config"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
              <span>Pengaturan Pricing</span>
            </Link>
            <Link
              href="/admin/orders/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#D4E751] hover:bg-[#C2D640] px-4 py-2.5 text-xs font-semibold text-[#05100E] shadow-sm transition-all active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Order Baru</span>
            </Link>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Orders */}
          <div className="zentra-rivet-card rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm flex items-center justify-between hover:border-[#D4E751]/30 transition-all">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Total Order</p>
              <p className="mt-1.5 text-2xl font-extrabold text-white font-mono">{metrics.total}</p>
              <p className="mt-1 text-xs text-zinc-500">Semua order tercatat</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#D4E751]">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Total Nilai Omset */}
          <div className="zentra-rivet-card rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm flex items-center justify-between hover:border-[#D4E751]/30 transition-all">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Total Nilai Order</p>
              <p className="mt-1.5 text-2xl font-extrabold text-white font-mono">{formatRupiah(metrics.revenue)}</p>
              <p className="mt-1 text-xs text-zinc-500">Estimasi nilai keseluruhan</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Menunggu Pembayaran */}
          <div className="zentra-rivet-card rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm flex items-center justify-between hover:border-amber-500/30 transition-all">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Belum Dibayar</p>
              <p className="mt-1.5 text-2xl font-extrabold text-amber-400 font-mono">{metrics.unpaidCount} Order</p>
              <p className="mt-1 text-xs font-mono text-zinc-500">{formatRupiah(metrics.unpaidAmount)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          {/* Card 4: Sudah Dibayar */}
          <div className="zentra-rivet-card rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm flex items-center justify-between hover:border-[#D4E751]/30 transition-all">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Lunas / Dibayar</p>
              <p className="mt-1.5 text-2xl font-extrabold text-[#D4E751] font-mono">{metrics.paidCount} Order</p>
              <p className="mt-1 text-xs font-mono text-zinc-500">{formatRupiah(metrics.paidAmount)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4E751]/10 border border-[#D4E751]/20 text-[#D4E751]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 backdrop-blur-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Cari nama klien / nomor kontak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#D4E751] focus:outline-none focus:ring-1 focus:ring-[#D4E751]/20 font-mono text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Pills & Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Status Selector */}
              <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-mono">
                {[
                  { id: "ALL", label: "Semua" },
                  { id: "UNPAID", label: "Belum Bayar" },
                  { id: "PAID", label: "Lunas" },
                  { id: "REFUNDED", label: "Refund" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedStatus(tab.id)}
                    className={`rounded-lg px-3 py-1 text-xs transition-all ${
                      selectedStatus === tab.id
                        ? "bg-white/15 text-[#D4E751] font-semibold border border-white/10 shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Job Type Dropdown */}
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="rounded-xl border border-white/15 bg-[#0B1916] px-3 py-2 text-xs font-mono text-zinc-300 focus:border-[#D4E751] focus:outline-none"
              >
                <option value="ALL">Semua Jenis Pekerjaan</option>
                {Object.entries(JOB_TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "NEWEST" | "DEADLINE" | "PRICE")}
                className="rounded-xl border border-white/15 bg-[#0B1916] px-3 py-2 text-xs font-mono text-zinc-300 focus:border-[#D4E751] focus:outline-none"
              >
                <option value="NEWEST">Urutkan: Terbaru</option>
                <option value="DEADLINE">Urutkan: Deadline Terdekat</option>
                <option value="PRICE">Urutkan: Harga Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table & List */}
        <div className="rounded-3xl border border-white/10 bg-[#0B1916]/80 backdrop-blur-md shadow-2xl overflow-hidden">
          {/* Loading State */}
          {!orders && (
            <div className="p-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#D4E751] border-r-transparent" />
              <p className="mt-3 text-xs font-mono text-zinc-400">Memuat data order...</p>
            </div>
          )}

          {/* Empty State: No Orders at All */}
          {orders && orders.length === 0 && (
            <div className="p-16 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[#D4E751]">
                <ClipboardList className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">Belum ada order</h3>
                <p className="mt-1 text-sm text-zinc-400 max-w-sm mx-auto">
                  Mulai hitung harga dan rekam order baru klien dengan formula pricing otomatis.
                </p>
              </div>
              <Link
                href="/admin/orders/new"
                className="inline-flex items-center gap-2 rounded-xl bg-[#D4E751] hover:bg-[#C2D640] px-4 py-2.5 text-xs font-semibold text-[#05100E]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Buat Order Pertama</span>
              </Link>
            </div>
          )}

          {/* Empty State: Search/Filter No Match */}
          {orders && orders.length > 0 && filteredOrders.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <p className="text-sm font-medium text-zinc-300">
                Tidak ada order yang cocok dengan pencarian atau filter yang dipilih.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("ALL");
                  setSelectedJobType("ALL");
                }}
                className="text-xs font-mono text-[#D4E751] hover:underline"
              >
                Reset semua filter
              </button>
            </div>
          )}

          {/* Orders Table */}
          {orders && filteredOrders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="px-6 py-4">Klien</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4">Total Harga</th>
                    <th className="px-6 py-4">Status Pembayaran</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((o) => {
                    const jobInfo = JOB_TYPE_CONFIG[o.jobType] ?? {
                      label: o.jobType,
                      shortLabel: o.jobType,
                      bg: "bg-white/5",
                      text: "text-zinc-300",
                      border: "border-white/10",
                    };
                    const remaining = getDaysRemaining(o.deadline);
                    const initial = o.clientName.trim().charAt(0).toUpperCase() || "K";

                    // Custom status pill style
                    const isPaid = o.paymentStatus === "PAID";
                    const isUnpaid = o.paymentStatus === "UNPAID";

                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-white/[0.025] transition-colors group"
                      >
                        {/* Client Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#D4E751] font-bold font-mono text-sm">
                              {initial}
                            </div>
                            <div>
                              <p className="font-semibold text-white group-hover:text-[#D4E751] transition-colors">
                                {o.clientName}
                              </p>
                              <p className="font-mono text-xs text-zinc-500">
                                {o.clientContact ? o.clientContact : "Tanpa kontak"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Job Type Badge */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-zinc-300">
                            {jobInfo.label}
                          </span>
                        </td>

                        {/* Deadline & Countdown */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-mono text-zinc-300">
                              {formatDateIndo(o.deadline)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 font-mono text-[11px] mt-0.5 ${
                                remaining.isOverdue
                                  ? "text-red-400 font-semibold"
                                  : remaining.isUrgent
                                  ? "text-amber-400 font-semibold"
                                  : "text-zinc-500"
                              }`}
                            >
                              {remaining.label}
                              {o.feasibilityWarning && (
                                <span
                                  className="inline-flex items-center text-amber-400"
                                  title={`Feasibility: ${o.feasibilityWarning}`}
                                >
                                  <AlertTriangle className="h-3 w-3 inline" />
                                </span>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 font-mono font-bold text-white text-sm">
                          {formatRupiah(o.totalPrice)}
                        </td>

                        {/* Payment Status Pill */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium ${
                              isPaid
                                ? "bg-[#D4E751]/10 text-[#D4E751] border-[#D4E751]/25"
                                : isUnpaid
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/25"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isPaid ? "bg-[#D4E751]" : isUnpaid ? "bg-amber-400" : "bg-zinc-400"
                              }`}
                            />
                            {isPaid ? "Lunas" : isUnpaid ? "Belum Bayar" : o.paymentStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <span>Detail</span>
                            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

