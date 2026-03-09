# Dokumentasi Developer - SANDIKA BPS

Direktori ini berisi dokumentasi teknis untuk pengembangan aplikasi SANDIKA BPS.

## Urutan baca yang direkomendasikan

1. `project-overview.md`
2. `setup-local.md`
3. `environment-variables.md`
4. `architecture.md`
5. `database-prisma.md`
6. `authentication.md`
7. `api-reference.md`
8. `seeding-and-data-source.md`
9. `feature-guide.md`
10. `react-hooks-guide.md`
11. `troubleshooting.md`

## Ruang lingkup

- Fokus pada kebutuhan developer (setup, arsitektur, database, auth, API, debugging).
- Tidak membahas panduan user operasional.

## Sumber acuan utama di codebase

- `package.json`
- `app/layout.tsx`
- `app/(main)/layout.tsx`
- `app/(main)/data-industri/page.tsx`
- `app/(main)/dashboard/page.tsx`
- `components/peta-industri/PetaIndustriMap.tsx`
- `components/peta-industri/PetaIndustriMapCanvas.tsx`
- `lib/auth.ts`
- `lib/auth-client.ts`
- `app/api/industry/route.ts`
- `app/api/auth/[...all]/route.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`
