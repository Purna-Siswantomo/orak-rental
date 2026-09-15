"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClipboardList,
  PlusCircle,
  Sliders,
  Menu,
  X,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_LINK = "https://wa.me/6288221401935";

function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Cara Kerja", href: "#cara-kerja" },
    { label: "Kategori", href: "#kategori" },
    { label: "Kalkulator", href: "#kalkulator" },
    { label: "Transparansi", href: "#transparansi" },
    { label: "FAQ", href: "#faq" },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        const navOffset = 90; // Floating navbar clearance
        const elementPosition = elem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        window.history.pushState(null, "", href);
      }
    }
  };

  return (
    <div className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-[#05100E]/95 backdrop-blur-xl px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-2xl shadow-black/60 pointer-events-auto transition-all"
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 p-1 overflow-hidden"
            >
              <Image
                src="/logo-icon.png"
                alt="Otak Rental"
                width={28}
                height={28}
                className="h-full w-full object-contain"
                priority
              />
            </motion.div>
            <span className="font-semibold text-white tracking-tight text-base font-sans">
              Otak Rental
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action */}
          <div className="hidden sm:flex items-center gap-3">
            <motion.a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D4E751] hover:bg-[#C2D640] px-4 py-2 text-xs font-semibold text-[#05100E] shadow-sm transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Konsultasi WA</span>
            </motion.a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-300 hover:bg-white/10 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden md:hidden"
            >
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      setMobileOpen(false);
                      handleScrollTo(e, link.href);
                    }}
                    className="block px-2 py-1.5 text-sm font-medium text-zinc-300 hover:text-white cursor-pointer"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4E751] px-3.5 py-1.5 text-xs font-semibold text-[#05100E]"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Konsultasi</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdminArea = pathname.startsWith("/admin");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!isAdminArea) {
    return <PublicHeader />;
  }

  const navItems = [
    {
      label: "Daftar Order",
      href: "/admin",
      icon: ClipboardList,
      isActive: pathname === "/admin",
    },
    {
      label: "Order Baru",
      href: "/admin/orders/new",
      icon: PlusCircle,
      isActive: pathname === "/admin/orders/new",
    },
    {
      label: "Pengaturan Pricing",
      href: "/admin/config",
      icon: Sliders,
      isActive: pathname.startsWith("/admin/config"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05100E]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 p-1.5 transition-transform group-hover:scale-105 overflow-hidden">
              <Image
                src="/logo-icon.png"
                alt="Otak Rental"
                width={32}
                height={32}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-tight text-base">Otak Rental</span>
                <span className="inline-flex items-center rounded-full bg-[#D4E751]/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[#D4E751] border border-[#D4E751]/20">
                  ADMIN PORTAL
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 ml-4 border-l border-white/10 pl-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                    item.isActive
                      ? "bg-white/10 text-[#D4E751] font-semibold border border-white/10"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${item.isActive ? "text-[#D4E751]" : "text-zinc-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section / Action */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span>Preview Web</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>

          <Link
            href="/admin/orders/new"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#D4E751] hover:bg-[#C2D640] px-3.5 py-1.5 text-xs font-semibold text-[#05100E] shadow-sm transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Order Baru</span>
          </Link>

          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar</span>
          </button>

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-zinc-300 hover:bg-white/10"
            aria-label="Buka menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0B1916] px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  item.isActive
                    ? "bg-white/10 text-[#D4E751] font-semibold"
                    : "text-zinc-300 hover:bg-white/5"
                }`}
              >
                <Icon className={`h-4 w-4 ${item.isActive ? "text-[#D4E751]" : "text-zinc-400"}`} />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/admin/orders/new"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4E751] py-2 text-xs font-semibold text-[#05100E]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Buat Order Baru</span>
            </Link>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-xs font-mono text-zinc-400 hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

