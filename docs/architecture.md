# Arsitektur

## Struktur direktori utama

- `app/`
    - Routing App Router, halaman, dan API route.
- `components/`
    - Komponen UI reusable dan komponen fitur.
- `lib/`
    - Utilitas domain, akses data, auth, dan mapping.
- `prisma/`
    - Schema, migration, dan script seed.
- `constant/`
    - Konstanta menu dan file geojson.
- `public/`
    - Aset statis dan data CSV seed.

## Routing layer

- Root layout: `app/layout.tsx`
    - Menetapkan metadata global, font, tema, dan global CSS.
- Main layout: `app/(main)/layout.tsx`
    - Membungkus halaman dengan `ScrollNavigation` dan `TimedAlertProvider`.
- Auth page: `app/(auth)/login/page.tsx`
    - Halaman login berbasis Better Auth client.

## Batas server dan client

- Halaman interaktif diberi `"use client"`.
- API route dan fungsi akses DB berada di sisi server.
- Komponen peta di-load dinamis (`next/dynamic`) dengan `ssr: false` pada `app/(main)/peta-industri/page.tsx`.

## Data flow modul data industri

1. Client page `app/(main)/data-industri/page.tsx` fetch `GET /api/industry`.
2. API route `app/api/industry/route.ts` query Prisma.
3. Mapping model DB -> `IndustryRow` via `lib/industry.ts`.
4. Client memproses filter/sort/pagination via TanStack Table.

## Data flow modul dashboard

1. Server page `app/(main)/dashboard/page.tsx` panggil `getDashboardSummary()`.
2. `lib/dashboard.ts` query DB + agregasi metrik.
3. Hasil dipresentasikan langsung di server-rendered page.

## Data flow modul peta

1. Komponen `components/peta-industri/PetaIndustriMap.tsx` memuat data payload.
2. Data diubah ke GeoJSON point melalui `rowsToPointGeoJson`.
3. Canvas peta `PetaIndustriMapCanvas.tsx` render boundary + points + cluster.

## Autentikasi

- Server config: `lib/auth.ts`
- Client helper: `lib/auth-client.ts`
- Route handler Better Auth: `app/api/auth/[...all]/route.ts`
