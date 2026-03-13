-- Alter columns to allow NULL for non-Google platforms
ALTER TABLE "industry_record"
ALTER COLUMN "provinsiId" DROP NOT NULL,
ALTER COLUMN "kabupatenId" DROP NOT NULL,
ALTER COLUMN "kecamatanId" DROP NOT NULL,
ALTER COLUMN "desaId" DROP NOT NULL;

-- Remove location IDs from YouTube and TikTok rows
UPDATE "industry_record"
SET
  "provinsiId" = NULL,
  "kabupatenId" = NULL,
  "kecamatanId" = NULL,
  "desaId" = NULL
WHERE "platform" IN ('YouTube', 'TikTok');

-- Keep location IDs mandatory for Google Maps rows
ALTER TABLE "industry_record"
ADD CONSTRAINT "industry_record_google_maps_location_ids_required"
CHECK (
  "platform" <> 'Google Maps'
  OR (
    "provinsiId" IS NOT NULL
    AND "kabupatenId" IS NOT NULL
    AND "kecamatanId" IS NOT NULL
    AND "desaId" IS NOT NULL
  )
);
