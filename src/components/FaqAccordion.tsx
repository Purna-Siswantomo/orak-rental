"use client";

import { useState } from "react";
import { HelpCircle, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3.5">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <motion.div
            key={item.question}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className={`rounded-2xl border transition-colors duration-200 bg-white ${
              isOpen
                ? "border-zinc-400 shadow-md shadow-zinc-900/5"
                : "border-[#DCE3DF] hover:border-zinc-300"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 p-6 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    isOpen
                      ? "bg-zinc-900 border-zinc-800 text-[#D4E751]"
                      : "bg-zinc-100 border-zinc-200 text-zinc-500"
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                </div>
                <span className="font-semibold text-zinc-900 text-base font-sans">
                  {item.question}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isOpen
                    ? "bg-zinc-100 border-zinc-300 text-zinc-900"
                    : "border-zinc-200 text-zinc-400"
                }`}
              >
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-1 pl-[4.5rem]">
                    <p className="text-sm leading-relaxed text-zinc-600 font-sans">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

