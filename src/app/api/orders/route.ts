import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computePriceBreakdown, checkFeasibility, daysUntil, findUrgencyTier } from "@/lib/pricing";
import type { ComplexityTierLabel, JobType } from "@/generated/prisma/client";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export interface OrderInput {
  clientName: string;
  clientContact?: string;
  jobType: JobType;
  notes?: string;
  deadline: string;
  estimatedHours: number;
  baseRate: number;
  complexityTierLabel: ComplexityTierLabel;
  complexityMultiplier: number;
  additionalCost: number;
  complexityChecklist?: {
    numFeatures: number;
    needsResearch: boolean;
    externalApiDependency: boolean;
    needsArchitectureDesign: boolean;
  };
  overrideFeasibilityWarning?: boolean;
}

export async function POST(req: NextRequest) {
  let body: OrderInput;
  try {
    body = (await req.json()) as OrderInput;
  } catch {
    return NextResponse.json({ error: "Body request bukan JSON yang valid." }, { status: 400 });
  }

  if (!body.clientName || !body.jobType || !body.deadline) {
    return NextResponse.json({ error: "Field wajib belum lengkap." }, { status: 400 });
  }

  const deadline = new Date(body.deadline);
  if (isNaN(deadline.getTime())) {
    return NextResponse.json({ error: "Format deadline tidak valid." }, { status: 400 });
  }

  if (
    !Number.isFinite(body.estimatedHours) ||
    !Number.isFinite(body.baseRate) ||
    !Number.isFinite(body.complexityMultiplier) ||
    !Number.isFinite(body.additionalCost)
  ) {
    return NextResponse.json(
      { error: "Estimasi jam, rate, multiplier kompleksitas, dan biaya tambahan harus berupa angka." },
      { status: 400 }
    );
  }

  const tiers = await prisma.urgencyTier.findMany();
  const days = daysUntil(deadline);
  const urgencyTier = findUrgencyTier(days, tiers);
  if (!urgencyTier) {
    return NextResponse.json({ error: "Tabel multiplier urgensi belum dikonfigurasi." }, { status: 500 });
  }

  // FR-2.5: feasibility gate — jangan diam-diam terima harga dari scope yang tidak realistis
  const feasibility = checkFeasibility(body.estimatedHours, days);
  if (feasibility.isWarning && !body.overrideFeasibilityWarning) {
    return NextResponse.json(
      {
        warning: true,
        message: `Estimasi ${feasibility.hoursPerDay.toFixed(1)} jam/hari efektif melebihi ambang realistis (12 jam/hari). Kurangi scope, negosiasikan deadline, atau kirim ulang dengan overrideFeasibilityWarning=true jika tetap ingin melanjutkan.`,
        hoursPerDay: feasibility.hoursPerDay,
      },
      { status: 422 }
    );
  }

  const breakdown = computePriceBreakdown({
    estimatedHours: body.estimatedHours,
    baseRate: body.baseRate,
    urgencyMultiplier: urgencyTier.multiplier,
    complexityMultiplier: body.complexityMultiplier,
    additionalCost: body.additionalCost,
  });

  let order;
  try {
    order = await prisma.order.create({
      data: {
        clientName: body.clientName,
        clientContact: body.clientContact,
        jobType: body.jobType,
        notes: body.notes,
        deadline,
        estimatedHours: body.estimatedHours,
        baseRate: body.baseRate,
        urgencyMultiplier: urgencyTier.multiplier,
        complexityTierLabel: body.complexityTierLabel,
        complexityMultiplier: body.complexityMultiplier,
        additionalCost: body.additionalCost,
        totalPrice: breakdown.totalPrice,
        complexityChecklist: body.complexityChecklist ? JSON.stringify(body.complexityChecklist) : null,
        feasibilityWarning: feasibility.isWarning
          ? `${feasibility.hoursPerDay.toFixed(1)} jam/hari (di-override admin)`
          : null,
      },
    });
  } catch (err) {
    console.error("POST /api/orders gagal:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan order — periksa kembali jobType/complexityTierLabel yang dikirim." },
      { status: 400 }
    );
  }

  return NextResponse.json({ order, breakdown, urgencyTierLabel: urgencyTier.label }, { status: 201 });
}
