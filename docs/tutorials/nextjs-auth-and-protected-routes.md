# Next.js Auth & Protected Routes

Panduan ringkas pola autentikasi dan proteksi halaman di Next.js App Router.

## 1) Tujuan utama

- User yang belum login tidak bisa akses halaman internal.
- User yang sudah login diarahkan dari halaman login ke area utama.

## 2) Titik kontrol umum

- Halaman login: cek session, redirect jika sudah login.
- Layout halaman internal: validasi session sebelum render konten sensitif.
- Middleware (opsional): proteksi route level URL.

## 3) Alur dasar

1. User login (credential/OAuth).
2. Server membuat session.
3. Route private membaca session.
4. Jika tidak valid -> redirect ke login.

## 4) Praktik baik

- Pisahkan komponen form login (UI) dan logic auth (service/client auth).
- Hindari hardcode role/permission di banyak tempat; sentralisasi helper otorisasi.
- Jangan expose detail error sensitif ke UI.

## 5) Session-aware UI

Komponen navigasi bisa menampilkan nama/avatar user dari session dan menyediakan aksi logout.

## Konteks di project

- Halaman login: `app/(auth)/login/page.tsx`.
- Navigasi session-aware: `components/ScrollNavigation.tsx`.
- Dokumentasi auth: `docs/authentication.md`.
