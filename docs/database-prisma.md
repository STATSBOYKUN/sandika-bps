# Database dan Prisma

Sumber acuan: `prisma/schema.prisma`, `prisma/migrations/*`, `lib/industry.ts`, `lib/dashboard.ts`.

## Provider

- Database: PostgreSQL
- ORM: Prisma Client

## Model auth

### `User`

- Menyimpan identitas akun.
- Relasi ke `Session[]` dan `Account[]`.
- Unique: `email`, `username`.

### `Session`

- Menyimpan token sesi aktif.
- Relasi many-to-one ke `User` dengan cascade delete.

### `Account`

- Menyimpan akun provider auth (contoh Google).
- Relasi many-to-one ke `User` dengan cascade delete.

### `Verification`

- Menyimpan data verifikasi/expired token pendukung auth.

## Model domain

### `IndustryRecord`

Kolom utama:

- identitas: `id`, `sourceKey` (unique)
- klasifikasi: `platform`, `kbliKategori`, `status`
- wilayah: `provinsiId`, `kabupatenId`, `kecamatanId`, `kecamatanNama`, `desaId`, `desaNama`
- validasi: `isInsideKaranganyar`
- detail lintas platform: `metadata` (JSON)
- audit waktu: `createdAt`, `updatedAt`

Index:

- `platform`
- `kecamatanNama`

## Kenapa `metadata` berbentuk JSON

Data platform berbeda:

- Google Maps: koordinat, rating, review count
- YouTube: channel/video stats
- TikTok: engagement/follower stats

Satu kolom JSON mengurangi kebutuhan tabel terpisah untuk setiap platform.

## Akses data di aplikasi

- Endpoint tabel: `app/api/industry/route.ts`
- Ringkasan dashboard: `lib/dashboard.ts`
- Mapping DB -> UI row: `mapIndustryRecordToRow` di `lib/industry.ts`
