# Authentication

Sumber acuan: `lib/auth.ts`, `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts`, `app/(auth)/login/page.tsx`.

## Teknologi

- Better Auth + Prisma adapter
- Plugin username aktif (`better-auth/plugins/username`)
- Social provider: Google OAuth

## Konfigurasi server auth

File: `lib/auth.ts`

- Database adapter: Prisma + provider PostgreSQL
- `emailAndPassword.enabled = true`
- Provider Google membaca env:
    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`

## Konfigurasi client auth

File: `lib/auth-client.ts`

- `createAuthClient(...)` dengan `usernameClient()` plugin.
- Dipakai di halaman login dan komponen navigasi (session/signOut).

## Route handler

File: `app/api/auth/[...all]/route.ts`

- Mengekspos handler `GET` dan `POST` dari Better Auth ke Next.js App Router.

## Login flow yang diimplementasikan

File: `app/(auth)/login/page.tsx`

### Username/password

1. Validasi form dasar di client.
2. Panggil `authClient.signIn.username(...)`.
3. Jika sukses, redirect ke `/profile`.

### Google OAuth

1. Tombol panggil `authClient.signIn.social({ provider: "google" })`.
2. Better Auth mengelola redirect callback.
3. Setelah sukses, callback ke `/profile`.

## Session usage

- `authClient.useSession()` dipakai untuk:
    - redirect user yang sudah login dari halaman login
    - tampilkan nama user di sidebar/topbar
