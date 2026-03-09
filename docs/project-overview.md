# Project Overview

## Ringkasan

SANDIKA BPS adalah aplikasi internal untuk manajemen data industri digital Kabupaten Karanganyar, dengan modul tabel data, dashboard ringkasan, peta spasial, autentikasi pengguna, dan helpdesk tiket.

## Stack utama

- Framework: Next.js App Router (`next@16`)
- UI: React (`react@19`), Tailwind CSS v4, DaisyUI
- Data table: TanStack Table
- Peta: MapLibre + react-map-gl
- ORM/DB: Prisma + PostgreSQL
- Auth: Better Auth (username/password + Google OAuth)
- Ikon: lucide-react

## Modul utama aplikasi

- `Dashboard` (`app/(main)/dashboard/page.tsx`)
  - Menampilkan metrik ringkas dan aktivitas terbaru.
- `Data Industri` (`app/(main)/data-industri/page.tsx`)
  - Menampilkan data industri lintas platform dalam tabel dengan filter, sort, dan pagination.
- `Peta Industri` (`app/(main)/peta-industri/page.tsx`)
  - Menampilkan titik industri pada peta dengan boundary kecamatan/desa dan filter spasial.
- `Panduan` (`app/(main)/panduan/page.tsx`)
  - Konten panduan statis dalam aplikasi.
- `Bantuan` (`app/(main)/help/page.tsx`)
  - Halaman ticketing berbasis localStorage.

## Alur data tingkat tinggi

1. Data disimpan di PostgreSQL (tabel `industry_record` dan tabel auth).
2. Endpoint server (`app/api/*`) membaca data via Prisma.
3. Halaman client melakukan fetch ke endpoint API.
4. Komponen UI memproses data untuk tabel/peta/dashboard.

## Catatan penting

- `app/layout.tsx` menetapkan metadata global dan tema default (`data-theme="winter"`).
- `app/(main)/layout.tsx` membungkus halaman utama dengan `ScrollNavigation` dan `TimedAlertProvider`.
