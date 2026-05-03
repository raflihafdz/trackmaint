# Checklist Pemeliharaan Kelompok MekanikalThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



Aplikasi web full-stack untuk digitalisasi form checklist pemeliharaan "Checklist Pemeliharaan Kelompok Mekanikal - UPBU Kelas III Raja Haji Abdullah".## Getting Started



## Tech StackFirst, run the development server:



- **Frontend**: Next.js 14 (App Router) + TypeScript + React 19```bash

- **Styling**: Tailwind CSS + shadcn/ui componentsnpm run dev

- **Backend**: Next.js API Routes# or

- **Database**: PostgreSQL (Neon) + Prisma ORM v6
- **PDF Generation**: Browser native print-to-PDF
- **UI Components**: shadcn/ui with Radix UI

- **Notifications**: React Toastify# or

- **Date Handling**: date-fnsbun dev

```

## Features

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- ✅ List semua checklist yang telah disubmit dengan action (View, Download PDF, Delete)

- ✅ Create checklist baru dengan form dua tahap (Header → Grid Harian)You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- ✅ View detail checklist dengan grid harian interaktif

- ✅ Generate PDF checklist dengan browser print dialog

- ✅ Grid harian dengan 31 hari, highlight khusus untuk hari 18-24

- ✅ Toggle 3-state untuk setiap cell: Kosong → ✓ (Normal) → ✗ (Gangguan)## Learn More

- ✅ Support untuk 5 tipe checklist: Mobil Foam Tender, Conveyor Kedatangan/Keberangkatan, Traktor, Mobil Operasional

- ✅ Responsive design dengan horizontal scroll pada gridTo learn more about Next.js, take a look at the following resources:



## Prerequisites- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- Node.js 18+ dan npm

- PostgreSQL database (Neon recommended)You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



## Quick Start## Deploy on Vercel



### 1. Install DependenciesThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



```bashCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

npm install
```

### 2. Setup Environment Variables

Buat file `.env.local`:

```
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

### 3. Setup Database

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Project Structure

```
trackmaint/
├── app/                          # Next.js App Router
│   ├── api/checklist/            # API routes
│   ├── checklist/                # Checklist pages
│   ├── home.tsx                  # Home page component
│   ├── page.tsx                  # Root page
│   └── layout.tsx                # Root layout
├── components/ui/                # shadcn/ui components
├── lib/
│   ├── prisma.ts                 # Prisma client
│   └── checklist-items.ts        # Item definitions
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seed
└── README.md
```

## Database Schema

**ChecklistEntry** - Form utama
- id, createdAt, updatedAt
- fasilitas, peralatan, merkType, bulan, tahun
- checklistType (enum)
- keterangan, petugas[], koordinator info

**DailyCheck** - Item harian
- id, entryId (FK), itemNo, itemLabel, tanggal (1-31)
- status (NORMAL | GANGGUAN | KOSONG)

## API Routes

- `GET /api/checklist` - List semua checklist
- `POST /api/checklist` - Buat checklist baru
- `GET /api/checklist/[id]` - Detail checklist
- `DELETE /api/checklist/[id]` - Hapus checklist
- `GET /api/checklist/[id]/pdf` - Download PDF

## Pages

- `/` - Home page dengan list checklist
- `/checklist/new` - Form create checklist (2 tahap)
- `/checklist/[id]` - View detail checklist
- `/api/checklist/[id]/pdf` - PDF generation

## Checklist Types

1. **MOBIL_FOAM_TENDER** (13 items)
2. **CONVEYOR_KEDATANGAN** (8 items)
3. **CONVEYOR_KEBERANGKATAN** (8 items)
4. **TRAKTOR** (11 items)
5. **MOBIL_OPERASIONAL** (10 items)

## Commands

```bash
npm run dev          # Development server
npm run build        # Build for production
npm start            # Start production server
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npx prisma studio   # Prisma GUI
```

## Development Notes

- No authentication (as per requirement)
- Days 18-24 highlighted with red background
- 3-state toggle: Empty → ✓ (Normal) → ✗ (Problem) → Empty
- PDF layout matches original printed form
- Use `npx prisma studio` to browse database GUI
- Use `npx prisma migrate reset` to reset database

## Troubleshooting

**Database Connection Error**
- Pastikan DATABASE_URL di .env.local benar
- Jika Neon, pastikan SSL mode enabled: ?sslmode=require

**Build Errors**
- Run: npm run build untuk validate
- Clear cache: rm -rf .next

## License

MIT
