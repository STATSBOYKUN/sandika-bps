# Setup Lokal

## Prasyarat

- Node.js 20+
- npm 10+
- PostgreSQL aktif

## 1) Install dependency

```bash
npm install
```

## 2) Siapkan environment file

```bash
cp .env.example .env
```

Jika shell Windows tidak mendukung `cp`, salin manual file `.env.example` menjadi `.env`.

## 3) Isi nilai environment

Minimal:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

Jika memakai login Google:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Detail arti variabel ada di `environment-variables.md`.

## 4) Migrasi database

```bash
npx prisma migrate dev
```

## 5) Seed data awal

```bash
npx prisma db seed
```

Seed akan:

- membuat user dari `prisma/seed/users.csv`
- upsert data industri dari CSV di `public/data/*`

## 6) Jalankan aplikasi

```bash
npm run dev
```

Akses: `http://localhost:3000`

## 7) Verifikasi kualitas dasar

```bash
npm run lint
npm run build
```

## Troubleshoot cepat setup

- Error koneksi DB: cek `DATABASE_URL` dan status PostgreSQL.
- Error auth secret: pastikan `BETTER_AUTH_SECRET` terisi string panjang.
- Seed gagal baca file CSV: cek path file pada `public/data/`.
