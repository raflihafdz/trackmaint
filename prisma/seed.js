const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.dailyCheck.deleteMany({});
  await prisma.checklistEntry.deleteMany({});

  // Create a sample checklist entry
  const entry = await prisma.checklistEntry.create({
    data: {
      fasilitas: "UPBU Kelas III Raja Haji Abdullah",
      peralatan: "Mobil Foam Tender",
      merkType: "Hino 500 CC",
      bulan: "Maret",
      tahun: "2026",
      checklistType: "MOBIL_FOAM_TENDER",
      keterangan: "Pemeliharaan rutin bulanan",
      petugas: ["Budi Santoso", "Rudi Hermawan"],
      koordinatorNama: "Dwi Haryanto",
      koordinatorNIP: "196512151990011001",
      koordinatorUnit: "Kelompok Mekanikal",
    },
  });

  // Add sample daily checks
  const itemsData = [
    "Warming Up Kendaraan Foam Tender",
    "Pengecekan lampu rotari dan penerangan",
    "Pengecekan tanki air",
    "Pengecekan bahan bakar",
    "Pemeriksaan oli mesin",
  ];

  for (let itemNo = 1; itemNo <= 13; itemNo++) {
    const itemLabel = itemsData[itemNo - 1] || `Item ${itemNo}`;

    for (let day = 1; day <= 31; day++) {
      // Add some sample status values
      let status = "KOSONG";
      if (day <= 17 || day >= 25) {
        status = Math.random() > 0.5 ? "NORMAL" : "KOSONG";
      } else {
        // Days 18-24 have varied statuses
        const random = Math.random();
        if (random > 0.7) status = "GANGGUAN";
        else if (random > 0.3) status = "NORMAL";
      }

      await prisma.dailyCheck.create({
        data: {
          entryId: entry.id,
          itemNo,
          itemLabel,
          tanggal: day,
          status,
        },
      });
    }
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
