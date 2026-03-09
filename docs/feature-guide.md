# Feature Guide (Developer)

## 1. Dashboard

File utama: `app/(main)/dashboard/page.tsx`

- Tipe halaman server (`async`) dengan `dynamic = "force-dynamic"`.
- Data ringkasan diambil via `getDashboardSummary()` dari `lib/dashboard.ts`.
- Menampilkan:
    - total record
    - data inside/outside Karanganyar
    - update 24 jam
    - distribusi platform
    - status badge (`Aktif`, `Verifikasi`, `Draft`)
    - aktivitas terbaru

## 2. Data Industri

File utama: `app/(main)/data-industri/page.tsx`

- Halaman client dengan state kompleks untuk:
    - tab platform (`Google Maps`, `YouTube`, `TikTok`)
    - global search (dengan `useDeferredValue`)
    - filter kbli, kecamatan, desa
    - sorting + pagination TanStack Table
- Data source: `fetch("/api/industry")`.
- UI pendukung:
    - `DataIndustriToolbar`
    - `DataIndustriFilterModal`
    - `DataIndustriTable`
    - `DataIndustriDetailModal`
- State fallback:
    - loading
    - error + tombol retry
    - empty (data kosong atau filter tidak cocok)

## 3. Peta Industri

File utama:

- `app/(main)/peta-industri/page.tsx`
- `components/peta-industri/PetaIndustriMap.tsx`
- `components/peta-industri/PetaIndustriMapCanvas.tsx`

Karakteristik:

- Komponen peta di-load dynamic tanpa SSR.
- Boundary mode: `kecamatan` / `desa`.
- Filter: platform, status, kecamatan, desa, teks pencarian.
- Basemap: OSM / light / dark style.
- Render layer:
    - boundary fill/line/hover
    - clustered points
    - unclustered points
- Interaksi:
    - klik cluster -> zoom expand
    - klik point -> buka detail modal
    - hover boundary -> tampilkan nama wilayah

## 4. Auth/Login

File utama: `app/(auth)/login/page.tsx`

- Login dengan username/password.
- Login dengan Google OAuth.
- Menggunakan `authClient.useSession()` untuk redirect user yang sudah login.

## 5. Navigasi aplikasi

File utama: `components/ScrollNavigation.tsx`

- Sidebar drawer + top navbar sticky.
- Active route detection via `usePathname()`.
- Session user untuk avatar/name.
- Logout via `authClient.signOut()`.

## 6. Helpdesk tiket

File utama: `components/help/HelpTicketingPage.tsx`

- Form create ticket dengan validasi client-side.
- Riwayat tiket disimpan di localStorage (`helpdeskTickets`).
- Bukan backend ticketing permanen.
