# Next.js Data Fetching Patterns

Panduan memilih pola fetch data di App Router.

## 1) Prioritas: fetch di Server Component

Jika data tidak butuh interaksi real-time browser, fetch di server component agar:

- TTFB dan SEO lebih baik,
- bundle client lebih kecil,
- data sensitif tetap di server.

## 2) Kapan fetch di Client Component

Pakai fetch client saat:

- data sangat interaktif (filter cepat, search live),
- bergantung state browser,
- butuh polling/event-driven di sisi client.

## 3) Revalidate dan caching

Untuk data yang tidak harus realtime, gunakan revalidate sesuai kebutuhan bisnis.

Contoh konsep:

```tsx
await fetch(url, { next: { revalidate: 60 } });
```

## 4) API Route pattern

Gunakan `app/api/.../route.ts` untuk:

- menyatukan akses DB/service,
- validasi input,
- normalisasi response.

Client page memanggil endpoint ini saat perlu interaksi dinamis.

## 5) Error, loading, empty state

Selalu desain tiga state ini sejak awal:

- loading: skeleton/spinner jelas,
- error: pesan + tombol retry,
- empty: jelaskan bahwa data belum ada atau filter terlalu ketat.

## Konteks di project

- Data tabel industri diambil via `/api/industry` dari halaman client `app/(main)/data-industri/page.tsx`.
