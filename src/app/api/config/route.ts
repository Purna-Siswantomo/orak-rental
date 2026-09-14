import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// FR-2.2/2.3/2.4: baseline jam, multiplier urgensi, multiplier kompleksitas — dapat dikonfigurasi admin
export async function GET() {
  const [jobTypeBaselines, urgencyTiers, complexityTiers] = await Promise.all([
    prisma.jobTypeBaseline.findMany(),
    prisma.urgencyTier.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.complexityTier.findMany(),
  ]);
  return NextResponse.json({ jobTypeBaselines, urgencyTiers, complexityTiers });
}

interface ConfigBody {
  jobTypeBaselines?: { jobType: string; minHours: number; maxHours: number }[];
  urgencyTiers?: {
    id: string;
    label: string;
    minDays: number | null;
    maxDays: number | null;
    multiplier: number;
    notLayak: boolean;
    sortOrder: number;
  }[];
  complexityTiers?: { label: string; minMultiplier: number; maxMultiplier: number }[];
}

export async function PATCH(req: NextRequest) {
  let body: ConfigBody;
  try {
    body = (await req.json()) as ConfigBody;
  } catch {
    return NextResponse.json({ error: "Body request bukan JSON yang valid." }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const b of body.jobTypeBaselines ?? []) {
        await tx.jobTypeBaseline.update({
          where: { jobType: b.jobType as never },
          data: { minHours: b.minHours, maxHours: b.maxHours },
        });
      }
      for (const t of body.urgencyTiers ?? []) {
        await tx.urgencyTier.update({
          where: { id: t.id },
          data: {
            label: t.label,
            minDays: t.minDays,
            maxDays: t.maxDays,
            multiplier: t.multiplier,
            notLayak: t.notLayak,
            sortOrder: t.sortOrder,
          },
        });
      }
      for (const c of body.complexityTiers ?? []) {
        await tx.complexityTier.update({
          where: { label: c.label as never },
          data: { minMultiplier: c.minMultiplier, maxMultiplier: c.maxMultiplier },
        });
      }
    });
  } catch (err) {
    console.error("PATCH /api/config gagal:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan konfigurasi — periksa kembali nilai yang dikirim." },
      { status: 400 }
    );
  }

  return GET();
}
