// Pricing engine — FR-2.1..2.6 (PRD.md §6.2)
// Harga = (Estimasi Jam x Rate Dasar) x Multiplier Urgensi x Multiplier Kompleksitas + Biaya Tambahan

import type { UrgencyTier } from "@/generated/prisma/client";

export const FEASIBILITY_HOURS_PER_DAY_THRESHOLD = 12;

export function daysUntil(deadline: Date, now: Date = new Date()): number {
  const ms = deadline.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function findUrgencyTier(days: number, tiers: UrgencyTier[]): UrgencyTier | null {
  const clamped = Math.max(days, 0);
  const sorted = [...tiers].sort((a, b) => a.sortOrder - b.sortOrder);

  for (const tier of sorted) {
    const min = tier.minDays ?? 0;
    const max = tier.maxDays;
    if (clamped >= min && (max === null || clamped <= max)) {
      return tier;
    }
  }
  // Tidak ada tier yang cocok (mis. deadline sudah lewat) -> pakai tier paling ketat
  return sorted[sorted.length - 1] ?? null;
}

export interface FeasibilityResult {
  hoursPerDay: number;
  isWarning: boolean;
}

// FR-2.5: feasibility gate
export function checkFeasibility(estimatedHours: number, deadlineDays: number): FeasibilityResult {
  const effectiveDays = Math.max(deadlineDays, 1);
  const hoursPerDay = estimatedHours / effectiveDays;
  return {
    hoursPerDay,
    isWarning: hoursPerDay > FEASIBILITY_HOURS_PER_DAY_THRESHOLD,
  };
}

export interface PriceBreakdownInput {
  estimatedHours: number;
  baseRate: number;
  urgencyMultiplier: number;
  complexityMultiplier: number;
  additionalCost: number;
}

export interface PriceBreakdown extends PriceBreakdownInput {
  subtotal: number; // estimatedHours x baseRate
  totalPrice: number;
}

export function computePriceBreakdown(input: PriceBreakdownInput): PriceBreakdown {
  const subtotal = input.estimatedHours * input.baseRate;
  const totalPrice =
    subtotal * input.urgencyMultiplier * input.complexityMultiplier + input.additionalCost;
  return { ...input, subtotal, totalPrice };
}

export interface ComplexityChecklist {
  numFeatures: number;
  needsResearch: boolean;
  externalApiDependency: boolean;
  needsArchitectureDesign: boolean;
}

// Heuristik sederhana untuk menyarankan tier kompleksitas dari checklist (FR-2.4).
// Admin tetap bisa override tier secara manual — ini hanya saran awal.
export function suggestComplexityTier(
  checklist: ComplexityChecklist
): "LOW" | "MEDIUM" | "HIGH" | "EXPERT" {
  let score = 0;
  if (checklist.numFeatures > 5) score += 2;
  else if (checklist.numFeatures > 2) score += 1;
  if (checklist.needsResearch) score += 1;
  if (checklist.externalApiDependency) score += 1;
  if (checklist.needsArchitectureDesign) score += 2;

  if (score >= 5) return "EXPERT";
  if (score >= 3) return "HIGH";
  if (score >= 1) return "MEDIUM";
  return "LOW";
}
