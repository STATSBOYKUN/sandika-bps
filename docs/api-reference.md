# API Reference

Sumber acuan: `app/api/industry/route.ts`, `app/api/auth/[...all]/route.ts`, `app/api/auth/ok/route.ts`.

## `GET /api/industry`

Mengambil daftar data industri (urut `updatedAt` terbaru), hasil mapping ke shape UI.

### Response sukses

```json
{
  "data": [
    {
      "id": "string",
      "platform": "Google Maps | YouTube | TikTok",
      "namaUsaha": "string",
      "kbliKategori": "string",
      "kecamatanNama": "string",
      "desaNama": "string",
      "status": "Aktif | Verifikasi | Draft",
      "isInsideKaranganyar": true,
      "updatedAt": "YYYY-MM-DD HH:mm:ss",
      "metadata": {}
    }
  ]
}
```

### Catatan

- Query dilakukan via Prisma ke model `industryRecord`.
- Mapping data dilakukan di `mapIndustryRecordToRow` (`lib/industry.ts`).

## `GET|POST /api/auth/*`

Endpoint internal Better Auth melalui catch-all route.

- Handler: `toNextJsHandler(auth)`
- Tidak dikelola manual per endpoint di codebase ini.

## `GET /api/auth/ok`

Health check sederhana untuk memastikan route API aktif.

### Response

```json
{
  "status": "ok"
}
```
