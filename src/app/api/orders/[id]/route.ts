import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computePriceBreakdown, checkFeasibility, daysUntil, findUrgencyTier } from "@/lib/pricing";
import type { PaymentStatus } from "@/generated/prisma/client";
import type { OrderInput } from "../route";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json(order);
}

interface UpdateBody extends Partial<OrderInput> {
  paymentStatus?: PaymentStatus;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: UpdateBody;
  try {
    body = (await req.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: "Body request bukan JSON yang valid." }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
  }

  // Hanya field pricing yang di-recompute kalau salah satu inputnya dikirim ulang.
  const isRepricing =
    body.estimatedHours !== undefined ||
    body.baseRate !== undefined ||
    body.complexityMultiplier !== undefined ||
    body.additionalCost !== undefined ||
    body.deadline !== undefined;

  const deadline = body.deadline ? new Date(body.deadline) : existing.deadline;
  if (isNaN(deadline.getTime())) {
    return NextResponse.json({ error: "Format deadline tidak valid." }, { status: 400 });
  }

  const estimatedHours = body.estimatedHours ?? existing.estimatedHours;
  const baseRate = body.baseRate ?? existing.baseRate;
  const complexityMultiplier = body.complexityMultiplier ?? existing.complexityMultiplier;
  const additionalCost = body.additionalCost ?? existing.additionalCost;

  if (
    !Number.isFinite(estimatedHours) ||
    !Number.isFinite(baseRate) ||
    !Number.isFinite(complexityMultiplier) ||
    !Number.isFinite(additionalCost)
  ) {
    return NextResponse.json(
      { error: "Estimasi jam, rate, multiplier kompleksitas, dan biaya tambahan harus berupa angka." },
      { status: 400 }
    );
  }

  let urgencyMultiplier = existing.urgencyMultiplier;
  let feasibilityWarning = existing.feasibilityWarning;
  let totalPrice = existing.totalPrice;

  if (isRepricing) {
    const tiers = await prisma.urgencyTier.findMany();
    const days = daysUntil(deadline);
    const urgencyTier = findUrgencyTier(days, tiers);
    if (!urgencyTier) {
      return NextResponse.json({ error: "Tabel multiplier urgensi belum dikonfigurasi." }, { status: 500 });
    }

    const feasibility = checkFeasibility(estimatedHours, days);
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

    urgencyMultiplier = urgencyTier.multiplier;
    feasibilityWarning = feasibility.isWarning
      ? `${feasibility.hoursPerDay.toFixed(1)} jam/hari (di-override admin)`
      : null;
    const breakdown = computePriceBreakdown({
      estimatedHours,
      baseRate,
      urgencyMultiplier,
      complexityMultiplier,
      additionalCost,
    });
    totalPrice = breakdown.totalPrice;
  }

  let updated;
  try {
    updated = await prisma.order.update({
      where: { id },
      data: {
        clientName: body.clientName ?? existing.clientName,
        clientContact: body.clientContact ?? existing.clientContact,
        jobType: body.jobType ?? existing.jobType,
        notes: body.notes ?? existing.notes,
        deadline,
        estimatedHours,
        baseRate,
        urgencyMultiplier,
        complexityTierLabel: body.complexityTierLabel ?? existing.complexityTierLabel,
        complexityMultiplier,
        additionalCost,
        totalPrice,
        complexityChecklist: body.complexityChecklist
          ? JSON.stringify(body.complexityChecklist)
          : existing.complexityChecklist,
        feasibilityWarning,
        paymentStatus: body.paymentStatus ?? existing.paymentStatus,
      },
    });
  } catch (err) {
    console.error(`PATCH /api/orders/${id} gagal:`, err);
    return NextResponse.json(
      { error: "Gagal menyimpan perubahan — periksa kembali jobType/complexityTierLabel/paymentStatus yang dikirim." },
      { status: 400 }
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
  }
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
