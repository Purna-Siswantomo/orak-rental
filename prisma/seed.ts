// Seed nilai default sesuai Lampiran A PRD.md (v1.1)
// Ditulis dengan upsert (bukan createMany) supaya aman dijalankan berulang kali
// (mis. setiap kali container Docker start).
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const jobTypeBaselines = [
    { jobType: "TUGAS_MINGGUAN", minHours: 2, maxHours: 8 },
    { jobType: "TUBES", minHours: 20, maxHours: 80 },
    { jobType: "LAPORAN_MAGANG", minHours: 10, maxHours: 20 },
    { jobType: "KONSULTASI_ANALISIS_DATA", minHours: 3, maxHours: 10 },
    { jobType: "DEVELOPMENT_PROJECT", minHours: 15, maxHours: 100 },
    { jobType: "LAINNYA", minHours: 5, maxHours: 40 },
  ] as const;

  for (const b of jobTypeBaselines) {
    await prisma.jobTypeBaseline.upsert({
      where: { jobType: b.jobType },
      create: b,
      update: { minHours: b.minHours, maxHours: b.maxHours },
    });
  }

  const urgencyTiers = [
    { label: "> 14 hari", minDays: 15, maxDays: null, multiplier: 1.0, notLayak: false, sortOrder: 1 },
    { label: "7–14 hari", minDays: 7, maxDays: 14, multiplier: 1.2, notLayak: false, sortOrder: 2 },
    { label: "3–6 hari", minDays: 3, maxDays: 6, multiplier: 1.5, notLayak: false, sortOrder: 3 },
    { label: "< 2 hari", minDays: 0, maxDays: 2, multiplier: 2.0, notLayak: true, sortOrder: 4 },
  ];

  // Dicocokkan lewat sortOrder (stabil), bukan label — supaya label bisa direvisi
  // tanpa membuat row duplikat di database yang sudah pernah di-seed sebelumnya.
  for (const t of urgencyTiers) {
    const existing = await prisma.urgencyTier.findFirst({ where: { sortOrder: t.sortOrder } });
    if (existing) {
      await prisma.urgencyTier.update({ where: { id: existing.id }, data: t });
    } else {
      await prisma.urgencyTier.create({ data: t });
    }
  }

  const complexityTiers = [
    { label: "LOW", minMultiplier: 1.0, maxMultiplier: 1.0 },
    { label: "MEDIUM", minMultiplier: 1.2, maxMultiplier: 1.4 },
    { label: "HIGH", minMultiplier: 1.5, maxMultiplier: 1.8 },
    { label: "EXPERT", minMultiplier: 2.0, maxMultiplier: 2.5 },
  ] as const;

  for (const c of complexityTiers) {
    await prisma.complexityTier.upsert({
      where: { label: c.label },
      create: c,
      update: { minMultiplier: c.minMultiplier, maxMultiplier: c.maxMultiplier },
    });
  }

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
