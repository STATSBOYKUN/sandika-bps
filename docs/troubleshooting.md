# Troubleshooting

## 1) Gagal konek database

Gejala:

- Prisma error saat migrate/seed/run API.

Langkah cek:

1. Pastikan PostgreSQL berjalan.
2. Validasi `DATABASE_URL` di `.env`.
3. Jalankan:

```bash
npx prisma migrate status
```

## 2) Login Google gagal

Gejala:

- redirect OAuth gagal atau error provider.

Langkah cek:

1. Pastikan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` terisi.
2. Pastikan callback URL di Google Cloud cocok dengan host lokal/deploy.
3. Pastikan `BETTER_AUTH_URL` sesuai domain yang dipakai.

## 3) `GET /api/industry` error

Gejala:

- halaman data industri menampilkan state error.

Langkah cek:

1. Jalankan migration + seed.
2. Cek tabel `industry_record` berisi data.
3. Cek log server Next.js untuk stack trace Prisma/mapping.

## 4) Data peta tidak tampil

Gejala:

- peta kosong atau fallback error.

Langkah cek:

1. Pastikan endpoint data mengembalikan koordinat valid untuk record Google Maps.
2. Cek browser console untuk error layer/source MapLibre.
3. Verifikasi file geojson ada di `constant/geojson/`.

## 5) Seed data tidak bertambah

Gejala:

- setelah seed jumlah data tidak berubah.

Penjelasan:

- Seed menggunakan `upsert` berdasarkan `sourceKey`, jadi record lama akan di-update, bukan selalu insert baru.

Langkah cek:

1. Cek perubahan konten CSV.
2. Cek log output seed (jumlah upsert per platform).

## 6) Build/lint gagal

Langkah umum:

1. Jalankan `npm run lint` untuk detail aturan.
2. Jalankan `npm run build` untuk validasi runtime/type level.
3. Perbaiki error dari yang paling atas dulu, karena error turunan sering ikut hilang.
