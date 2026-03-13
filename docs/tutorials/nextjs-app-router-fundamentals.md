# Next.js App Router Fundamentals

Panduan inti untuk memahami pola App Router yang dipakai project ini.

## 1) Struktur routing berbasis folder

- `app/page.tsx`: halaman root.
- `app/(group)/...`: route group untuk pengelompokan, bukan bagian URL.
- `layout.tsx`: wrapper yang mewarisi semua child route.

## 2) Server Component vs Client Component

- Default App Router adalah Server Component.
- Tambahkan `"use client"` hanya jika butuh state/effect/event handler browser.

Gunakan Server Component untuk:

- data fetching server,
- output HTML awal,
- mengurangi JS di browser.

Gunakan Client Component untuk:

- interaksi UI,
- hooks React client (`useState`, `useEffect`),
- akses API browser.

## 3) loading dan error boundaries

- `loading.tsx`: UI sementara saat segment memuat.
- `error.tsx`: fallback saat error runtime di segment.

## 4) dynamic rendering

Gunakan opsi seperti `dynamic = "force-dynamic"` bila halaman perlu selalu fresh dan tidak cocok cache statis.

## 5) Navigasi

- Gunakan `next/link` untuk navigasi antar route.
- Gunakan `useRouter` di client component saat perlu navigasi imperatif.

## Konteks di project

- Modul utama ada di `app/(main)/...`.
- Auth page ada di `app/(auth)/...`.
- Wrapper layout global ada di `app/layout.tsx`.
