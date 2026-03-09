# Environment Variables

Sumber acuan: `.env.example`, `lib/auth.ts`, `prisma.config.ts`.

## Daftar variabel

### `DATABASE_URL`

- Digunakan oleh Prisma untuk koneksi PostgreSQL.
- Dipakai di `prisma.config.ts` via `env("DATABASE_URL")`.
- Contoh format:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sandika_bps?schema=public"
```

### `BETTER_AUTH_SECRET`

- Secret untuk Better Auth.
- Wajib diisi dengan string acak panjang (minimal 32 karakter).
- Jangan commit nilai asli ke repository.

### `BETTER_AUTH_URL`

- Base URL aplikasi untuk callback/session Better Auth.
- Untuk lokal umumnya `http://localhost:3000`.

### `GOOGLE_CLIENT_ID`

- Client ID OAuth Google untuk social login.
- Dipakai di `lib/auth.ts`.

### `GOOGLE_CLIENT_SECRET`

- Client Secret OAuth Google untuk social login.
- Dipakai di `lib/auth.ts`.

## Nilai lokal minimum

Untuk jalan tanpa Google OAuth, isi:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

Google OAuth bisa dikonfigurasi belakangan.

## Keamanan

- Jangan commit `.env`.
- Gunakan `.env.example` sebagai template publik.
- Rotasi secret jika pernah terekspos.
