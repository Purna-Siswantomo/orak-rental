"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MessageCircle,
  ArrowRight,
  ClipboardCheck,
  Calculator,
  PackageCheck,
  SlidersHorizontal,
  Ban,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  Code2,
  Terminal,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { ZentraEmblem } from "@/components/icons/ZentraEmblem";
import { CategoryBento } from "@/components/CategoryBento";
import { InteractiveWorkflowShowcase } from "@/components/InteractiveWorkflowShowcase";
import { InteractivePricingCalculator } from "@/components/InteractivePricingCalculator";
import { FaqAccordion } from "@/components/FaqAccordion";

const WHATSAPP_LINK = "https://wa.me/6288221401935";
const INSTAGRAM_LINK = "https://www.instagram.com/otakrental/";

const STEPS = [
  {
    step: "STEP 1",
    title: "Brief & Intake",
    body: "Kirimkan modul soal, spesifikasi dokumen, dan target tenggat waktu ke admin melalui WhatsApp.",
    tag: "Review < 15 Menit",
    icon: MessageCircle,
  },
  {
    step: "STEP 2",
    title: "Kalkulasi Formula Terbuka",
    body: "Harga dihitung rasional dari jam kerja, urgensi, dan kompleksitas tanpa mark-up sepihak.",
    tag: "Transparan 100%",
    icon: Calculator,
  },
  {
    step: "STEP 3",
    title: "Eksekusi & Feasibility",
    body: "Dikerjakan oleh software engineer berpengalaman dengan code standard & uji keaslian logika.",
    tag: "No Plagiarism",
    icon: Code2,
  },
  {
    step: "STEP 4",
    title: "Penyerahan & Video Demo",
    body: "Source code lengkap, petunjuk instalasi, video cara menjalankan, serta garansi revisi.",
    tag: "Garansi 7 Hari",
    icon: PackageCheck,
  },
];

const PRINCIPLES = [
  {
    icon: SlidersHorizontal,
    title: "Formula Terbuka Tanpa Tebak Harga",
    body: "Rumus baku: (Jam Kerja × Rate Standar) × Urgensi × Kompleksitas + Biaya Khusus. Kami buka estimasi jam dan faktor pengali sebelum Anda membayar sepeser pun.",
    badge: "TRANSPARENCY FIRST",
  },
  {
    icon: ClipboardCheck,
    title: "Feasibility Gate: Menolak Jika Mustahil",
    body: "Kami tidak asal menerima pekerjaan. Jika deadline terlalu mepet atau kapasitas tidak memungkinkan hasil sempurna, kami sampaikan secara jujur di awal.",
    badge: "NO EMPTY PROMISES",
  },
  {
    icon: Ban,
    title: "Batasan Etis Tegas: Bebas Joki Skripsi",
    body: "Otak Rental menolak pengerjaan skripsi, tesis, dan disertasi atas nama klien. Untuk konsultasi analisis data, layanan kami berfokus pada asistensi teknis dan bimbingan logika.",
    badge: "STRICT ETHICS",
  },
];

const FAQ_ITEMS = [
  {
    question: "Bagaimana cara menentukan estimasi jam pengerjaan?",
    answer:
      "Admin menganalisis kompleksitas modul, jumlah endpoint/halaman, library yang digunakan, dan pengujian. Tiap kategori memiliki jam baseline acuan yang disesuaikan setelah menelaah berkas soal.",
  },
  {
    question: "Apakah hasil pengerjaan disertai penjelasan dan cara menjalankannya?",
    answer:
      "Ya. Setiap pekerjaan development dan tugas pemrograman selalu disertai dokumentasi README, dependensi yang dibutuhkan, dan rekaman video panduan menjalankan program di komputer Anda.",
  },
  {
    question: "Bagaimana kebijakan garansi revisi?",
    answer:
      "Garansi revisi berlaku 7 hari setelah pengiriman berkas selama masih dalam koridor brief dan spesifikasi yang disepakati di awal. Kami memastikan aplikasi atau tugas dapat berjalan sesuai ketentuan.",
  },
  {
    question: "Kenapa Otak Rental tegas menolak joki skripsi dan tesis?",
    answer:
      "Integritas akademik adalah batasan fundamental platform kami. Kami tidak pernah menyediakan jasa ghostwriting karya ilmiah kelulusan. Kami hanya melayani konsultasi coding tugas praktikum, tubes, pengembangan website/aplikasi, dan olah data teknis.",
  },
  {
    question: "Bagaimana mekanisme pembayaran aman?",
    answer:
      "Pembayaran dapat dilakukan setelah ruang lingkup dan estimasi harga disepakati. Sistem mendukung termin Down Payment (DP) atau pelunasan setelah demo progres awal.",
  },
];

export default function LandingPage() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const id = targetId.replace("#", "");
    const elem = document.getElementById(id);
    if (elem) {
      const navOffset = 90;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      window.history.pushState(null, "", `#${id}`);
    }
  };

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href === "#") return;

      const targetId = href.replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        e.preventDefault();
        const navOffset = 90;
        const elementPosition = elem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        window.history.pushState(null, "", href);
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <main className="min-h-screen bg-[#05100E] text-white">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Dark Forest Emerald + Radial Glow + Zentra Typography)  */}
      {/* ========================================================================= */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-28 overflow-hidden zentra-hero-glow">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 zentra-grid-bg opacity-40 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Version Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 sm:px-4 py-1 sm:py-1.5 backdrop-blur-md max-w-[90vw]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4E751] animate-pulse shrink-0" />
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest text-zinc-300 truncate">
              V.2 THE TRANSPARENT TECHNICAL SERVICE PLATFORM
            </span>
          </motion.div>

          {/* Headline with signature Zentra hybrid sans + italic serif */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto font-sans leading-[1.2] sm:leading-[1.15]"
          >
            Sewa otak teknis,{" "}
            <span className="font-serif-italic font-normal text-zinc-300 block sm:inline">
              sebelum deadline mencekik
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 sm:mt-6 max-w-2xl mx-auto text-sm sm:text-lg text-zinc-400 leading-relaxed font-sans px-2"
          >
            Kalkulasi harga transparan untuk tugas kuliah, tugas besar pemrograman, dan project development. Dihitung rasional dari effort jam kerja, urgensi, dan kompleksitas tanpa mark-up sepihak.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm sm:max-w-none mx-auto"
          >
            <motion.a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4E751] hover:bg-[#C2D640] px-6 py-3.5 text-sm font-bold text-[#05100E] shadow-lg shadow-[#D4E751]/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Konsultasi via WhatsApp</span>
            </motion.a>
            <motion.a
              href="#kalkulator"
              onClick={(e) => scrollToSection(e, "kalkulator")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] px-6 py-3.5 text-sm font-medium text-zinc-200 transition-colors cursor-pointer"
            >
              <Calculator className="h-4 w-4 text-[#D4E751]" />
              <span>Simulasi Harga Mandiri</span>
            </motion.a>
          </motion.div>

          {/* Interactive Workflow Node Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-14"
          >
            <InteractiveWorkflowShowcase />
          </motion.div>

          {/* Social Proof Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 pt-10 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto text-left"
          >
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">420+</p>
              <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider mt-1">
                Tugas &amp; Proyek Sukses
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-[#D4E751] tracking-tight">100%</p>
              <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider mt-1">
                Formula Terbuka
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">0%</p>
              <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider mt-1">
                Plagiarisme Code
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">4.9 / 5</p>
              <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider mt-1">
                Kepuasan Mahasiswa &amp; Klien
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CARA KERJA (Warm Sage Light Canvas #E8ECE9 - Zentra Style)              */}
      {/* ========================================================================= */}
      <section id="cara-kerja" className="bg-[#E8ECE9] text-zinc-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="inline-block rounded-md border border-zinc-300 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-zinc-600 uppercase">
              CARA KERJA
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 font-sans leading-tight">
              Empat langkah praktis,{" "}
              <span className="font-serif-italic font-normal text-emerald-950 block sm:inline">
                dari brief sampai serah terima
              </span>
            </h2>
            <p className="mt-3 text-base text-zinc-600">
              Alur kerja terstruktur dan terdokumentasi rapi agar Anda tahu persis setiap tahap pengerjaan tugas Anda.
            </p>
          </motion.div>

          {/* 4 Process Cards */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="rounded-3xl border border-[#DCE3DF] bg-white p-7 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-zinc-900/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-zinc-400 tracking-wider">
                        {step.step}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                    </div>

                    <h3 className="mt-6 text-lg font-bold text-zinc-900 font-sans">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                      {step.body}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-600">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      {step.tag}
                    </span>
                    <span className="font-mono text-xs text-zinc-400">0{idx + 1}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. KATEGORI PEKERJAAN (Bento Grid on Sage Background)                     */}
      {/* ========================================================================= */}
      <section id="kategori" className="bg-[#E8ECE9] text-zinc-900 py-20 sm:py-28 border-t border-zinc-300/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block rounded-md border border-zinc-300 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-zinc-600 uppercase">
              KATEGORI PEKERJAAN
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 font-sans leading-tight">
              Solusi terstruktur untuk{" "}
              <span className="font-serif-italic font-normal text-emerald-950 block sm:inline">
                berbagai skala kebutuhan teknis
              </span>
            </h2>
            <p className="mt-3 text-base text-zinc-600">
              Baseline jam kerja disesuaikan secara realistis berdasarkan kategori, lalu dikalikan dengan parameter urgensi dan kompleksitas.
            </p>
          </div>

          <div className="mt-14">
            <CategoryBento />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE PRICING CALCULATOR (Sage Background, Crisp White Box)       */}
      {/* ========================================================================= */}
      <section id="kalkulator" className="bg-[#E8ECE9] text-zinc-900 py-20 sm:py-28 border-t border-zinc-300/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <InteractivePricingCalculator />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BATASAN ETIS & TRANSPARANSI (Dark Forest Emerald Canvas)               */}
      {/* ========================================================================= */}
      <section id="transparansi" className="bg-[#05100E] text-white py-24 sm:py-32 zentra-grid-bg relative border-t border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-[#D4E751] uppercase">
              PRINSIP &amp; BATASAN ETIS
            </span>
            <h2 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight text-white font-sans leading-tight">
              Rasional, terbuka, dan{" "}
              <span className="font-serif-italic font-normal text-zinc-300 block sm:inline">
                berkomitmen pada integritas
              </span>
            </h2>
            <p className="mt-4 text-base text-zinc-400">
              Kami percaya jasa bantuan teknis harus memiliki standar integritas yang jelas, bukan sekadar komersialisasi instan.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRINCIPLES.map((p, idx) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="zentra-rivet-card rounded-3xl border border-white/10 bg-white/[0.035] p-8 backdrop-blur-sm flex flex-col justify-between hover:border-[#D4E751]/40 transition-colors duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[#D4E751]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-zinc-300 tracking-wider">
                        {p.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white font-sans">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400 font-sans">
                      {p.body}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-[#D4E751]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Prinsip Mengikat Layanan</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FAQ SECTION (Warm Sage Background + Crisp Separate White Cards)        */}
      {/* ========================================================================= */}
      <section id="faq" className="bg-[#E8ECE9] text-zinc-900 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="inline-block rounded-md border border-zinc-300 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-zinc-600 uppercase">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 font-sans">
              Jawaban lengkap,{" "}
              <span className="font-serif-italic font-normal text-emerald-950">
                sebelum Anda memulai
              </span>
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Pertanyaan umum mengenai metode kalkulasi, keamanan, dan dukungan pengerjaan.
            </p>
          </motion.div>

          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FINAL CTA BANNER (Deep Emerald + Glow - Zentra Style)                  */}
      {/* ========================================================================= */}
      <section className="bg-[#E8ECE9] pb-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-5xl rounded-3xl border border-white/15 bg-[#081916] text-white p-10 sm:p-16 text-center shadow-2xl overflow-hidden zentra-cta-glow"
        >
          {/* Ambient Glow */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-[#D4E751] blur-[90px]"
          />

          {/* Avatar Stack Social Proof */}
          <div className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6">
            <div className="flex -space-x-2">
              <span className="inline-block h-6 w-6 rounded-full bg-emerald-500 border border-black/40 text-[9px] font-bold text-black flex items-center justify-center">IT</span>
              <span className="inline-block h-6 w-6 rounded-full bg-[#D4E751] border border-black/40 text-[9px] font-bold text-black flex items-center justify-center">CS</span>
              <span className="inline-block h-6 w-6 rounded-full bg-cyan-400 border border-black/40 text-[9px] font-bold text-black flex items-center justify-center">DS</span>
            </div>
            <span className="font-mono text-xs text-zinc-300 uppercase tracking-wider">
              420+ Mahasiswa &amp; Developer Telah Bergabung
            </span>
          </div>

          <h2 className="relative text-3xl sm:text-5xl font-bold tracking-tight text-white font-sans max-w-2xl mx-auto leading-tight">
            Stop menebak harga,{" "}
            <span className="font-serif-italic font-normal text-[#D4E751] block sm:inline">
              selesaikan deadline dengan tenang
            </span>
          </h2>

          <p className="relative mt-4 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Kirimkan berkas soal atau kebutuhan software Anda sekarang. Kami review feasibility dan hitung estimasi harga secara transparan.
          </p>

          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <motion.a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4E751] hover:bg-[#C2D640] px-7 py-3.5 text-sm font-bold text-[#05100E] shadow-lg shadow-[#D4E751]/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Konsultasi Sekarang via WhatsApp</span>
            </motion.a>
            <motion.a
              href="#kalkulator"
              onClick={(e) => scrollToSection(e, "kalkulator")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-6 py-3.5 text-sm font-medium text-white transition-colors cursor-pointer"
            >
              <Calculator className="h-4 w-4 text-[#D4E751]" />
              <span>Hitung Simulasi Harga</span>
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER (Minimalist Off-White / Sage Footing matching Zentra)           */}
      {/* ========================================================================= */}
      <footer className="border-t border-zinc-200 bg-[#E8ECE9] text-zinc-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Col 1: Brand & Bio */}
            <div className="md:col-span-5">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden">
                  <img 
                    src="/logo-dark.png" 
                    alt="Otak Rental Logo" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="font-bold text-zinc-900 tracking-tight text-lg font-sans">
                  Otak Rental
                </span>
              </Link>
              <p className="mt-3 text-sm text-zinc-600 max-w-sm leading-relaxed">
                Platform estimasi harga transparan dan layanan konsultasi pengerjaan teknis untuk mahasiswa, praktisi, dan developer.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Otak Rental"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300 text-zinc-700 hover:bg-white transition-colors"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Otak Rental"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300 text-zinc-700 hover:bg-white transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="md:col-span-3">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                Navigasi Cepat
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                <li><a href="#cara-kerja" onClick={(e) => scrollToSection(e, "cara-kerja")} className="hover:text-zinc-950 cursor-pointer">Cara Kerja</a></li>
                <li><a href="#kategori" onClick={(e) => scrollToSection(e, "kategori")} className="hover:text-zinc-950 cursor-pointer">Kategori Pekerjaan</a></li>
                <li><a href="#kalkulator" onClick={(e) => scrollToSection(e, "kalkulator")} className="hover:text-zinc-950 cursor-pointer">Simulasi Kalkulator</a></li>
                <li><a href="#transparansi" onClick={(e) => scrollToSection(e, "transparansi")} className="hover:text-zinc-950 cursor-pointer">Batasan Etis &amp; Prinsip</a></li>
                <li><a href="#faq" onClick={(e) => scrollToSection(e, "faq")} className="hover:text-zinc-950 cursor-pointer">Tanya Jawab (FAQ)</a></li>
              </ul>
            </div>

            {/* Col 3: Formula & Portal */}
            <div className="md:col-span-4">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                Formula Respon Layanan
              </p>
              <div className="mt-4 rounded-2xl border border-zinc-300 bg-white p-4 text-xs font-mono text-zinc-600 space-y-1 shadow-2xs">
                <p className="text-zinc-900 font-semibold">Total Formula Resmi:</p>
                <p>(Jam Kerja × Hourly Rate) × Urgensi × Kompleksitas + Biaya Khusus</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-900 underline underline-offset-4"
                >
                  <span>Portal Administrator &rarr;</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-zinc-300/70 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
            <p>&copy; {new Date().getFullYear()} Otak Rental. All rights reserved.</p>
            <p className="font-mono text-[11px]">
              Built with precision &bull; Fair pricing for students &amp; developers
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

