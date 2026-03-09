# Seeding dan Sumber Data

Sumber acuan: `prisma/seed.ts`, `lib/industry.ts`, `public/data/*`.

## Tujuan seed

- Menyediakan akun awal untuk login.
- Mengisi tabel industri dari sumber CSV lintas platform.

## Entry point seed

- Konfigurasi seed: `prisma.config.ts` -> `seed: "tsx prisma/seed.ts"`
- Jalankan:

```bash
npx prisma db seed
```

## Seed user

- File sumber: `prisma/seed/users.csv`
- Parser CSV sederhana di `prisma/seed.ts`.
- Untuk tiap baris valid:
    - cek user existing berdasarkan email/username
    - jika belum ada, create via `auth.api.signUpEmail(...)`

## Seed industry

### Lokasi file sumber

- Google Maps: `public/data/Google Maps/Desain Grafis.csv`
- YouTube: `public/data/YouTube/YouTube Data.csv`
- TikTok: `public/data/TikTok/TikTok Data.csv` (opsional, jika ada)

### Pipeline

1. `readIndustrySeedData()` membaca semua file yang tersedia.
2. Setiap file di-parse menjadi `IndustrySeedInput[]`:
    - `buildGoogleMapsSeeds(...)`
    - `buildYoutubeSeeds(...)`
    - `buildTikTokSeeds(...)`
3. Baris di-upsert ke `industry_record` berdasarkan `sourceKey`.

## Logika geospasial penting

- Untuk Google Maps, lokasi diinfer dari latitude/longitude terhadap GeoJSON desa Karanganyar.
- Jika titik di luar polygon, sistem pilih desa terdekat berdasarkan centroid.
- Flag `isInsideKaranganyar` ditentukan dari hasil point-in-polygon.

## Idempotensi seed

- `upsert` mencegah duplikasi berdasarkan `sourceKey`.
- Menjalankan seed berkali-kali akan update record yang sama.
