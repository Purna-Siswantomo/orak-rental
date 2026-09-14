"use client";

import { ArrowUpRight, Code2, Database, Terminal, Cpu, FileText } from "lucide-react";
import { JOB_TYPE_CONFIG } from "@/lib/utils";
import { motion } from "framer-motion";

const BENTO_ORDER: {
  key: keyof typeof JOB_TYPE_CONFIG;
  span: string;
  icon: any;
  techTags: string[];
  metrics: string;
}[] = [
  {
    key: "DEVELOPMENT_PROJECT",
    span: "md:col-span-2 md:row-span-2",
    icon: Code2,
    techTags: ["Next.js", "React", "Python", "Node.js", "PostgreSQL", "Tailwind", "Docker"],
    metrics: "Baseline 25 Jam // Fullstack & API",
  },
  {
    key: "TUBES",
    span: "md:col-span-2",
    icon: Terminal,
    techTags: ["OOP", "Algoritma", "Struktur Data", "Java / C++"],
    metrics: "Milestone Terstruktur & Laporan",
  },
  {
    key: "KONSULTASI_ANALISIS_DATA",
    span: "md:col-span-1",
    icon: Database,
    techTags: ["Python", "R", "SPSS"],
    metrics: "Regresi & Visualisasi",
  },
  {
    key: "TUGAS_MINGGUAN",
    span: "md:col-span-1",
    icon: Cpu,
    techTags: ["Lab", "Quiz", "Mini Code"],
    metrics: "< 24 Jam Turnaround",
  },
  {
    key: "LAPORAN_MAGANG",
    span: "md:col-span-2",
    icon: FileText,
    techTags: ["UML", "DFD", "ERD", "Arsitektur"],
    metrics: "Dokumentasi Teknis Siap Uji",
  },
  {
    key: "LAINNYA",
    span: "md:col-span-2",
    icon: Terminal,
    techTags: ["Automation", "Scripting", "Custom Bot"],
    metrics: "Scope Fleksibel & Terbuka",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function CategoryBento() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-1 gap-4 md:grid-flow-row-dense md:grid-cols-4 md:grid-rows-3"
    >
      {BENTO_ORDER.map(({ key, span, icon: Icon, techTags, metrics }) => {
        const conf = JOB_TYPE_CONFIG[key];
        const isFeatured = key === "DEVELOPMENT_PROJECT";

        return (
          <motion.div
            key={key}
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`group relative flex flex-col justify-between rounded-3xl border border-[#DCE3DF] bg-white p-7 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-zinc-900/5 hover:border-zinc-400/60 ${span} ${
              isFeatured ? "min-h-[300px]" : "min-h-[170px]"
            }`}
          >
            <div>
              {/* Top Card Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 group-hover:scale-105 transition-transform">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                    {metrics}
                  </span>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition-all group-hover:border-zinc-800 group-hover:text-zinc-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Title & Description */}
              <h3
                className={`mt-5 font-bold tracking-tight text-zinc-900 font-sans ${
                  isFeatured ? "text-2xl" : "text-lg"
                }`}
              >
                {conf.label}
              </h3>
              <p
                className={`mt-2 text-zinc-600 leading-relaxed font-sans ${
                  isFeatured ? "max-w-md text-sm" : "text-xs"
                }`}
              >
                {conf.desc}
              </p>
            </div>

            {/* Tech Tags / Micro-Widget Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-100">
              <div className="flex flex-wrap gap-1.5">
                {techTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-mono text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

