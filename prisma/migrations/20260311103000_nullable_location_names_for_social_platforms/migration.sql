-- Allow nullable location names for non-Google platforms
ALTER TABLE "industry_record"
ALTER COLUMN "kecamatanNama" DROP NOT NULL,
ALTER COLUMN "desaNama" DROP NOT NULL;

-- Clean social platform rows that have empty location names
UPDATE "industry_record"
SET
  "kecamatanNama" = NULL,
  "desaNama" = NULL
WHERE
  "platform" IN ('YouTube', 'TikTok')
  AND (
    NULLIF(BTRIM("kecamatanNama"), '') IS NULL
    OR NULLIF(BTRIM("desaNama"), '') IS NULL
  );

-- Replace previous constraint with stronger Google Maps location requirement
ALTER TABLE "industry_record"
DROP CONSTRAINT IF EXISTS "industry_record_google_maps_location_ids_required";

ALTER TABLE "industry_record"
ADD CONSTRAINT "industry_record_google_maps_location_required"
CHECK (
  "platform" <> 'Google Maps'
  OR (
    "provinsiId" IS NOT NULL
    AND "kabupatenId" IS NOT NULL
    AND "kecamatanId" IS NOT NULL
    AND "desaId" IS NOT NULL
    AND "kecamatanNama" IS NOT NULL
    AND "desaNama" IS NOT NULL
  )
);
