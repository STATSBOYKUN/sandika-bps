import { useState } from "react";
import {
    MapPin,
    Navigation,
    PencilLine,
    RotateCcw,
    Save,
    X,
} from "lucide-react";

import {
    PLATFORM_FILTER_OPTIONS,
    type IndustryRow,
} from "@/components/data-industri/types";

interface DataIndustriDetailModalProps {
    row: IndustryRow | null;
    editable?: boolean;
    onSave?: (updated: IndustryRow) => void;
    onClose: () => void;
}

function platformTone(platform: IndustryRow["platform"]) {
    if (platform === "YouTube") return "badge-error";
    if (platform === "Google Maps") return "badge-success";
    return "badge-secondary";
}

function statusTone(status: IndustryRow["status"]) {
    if (status === "Aktif") return "badge-success";
    if (status === "Verifikasi") return "badge-info";
    return "badge-warning";
}

function nowTimestamp() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function cleanString(value: string) {
    return value.trim();
}

function isValidCoordinate(latitude: number, longitude: number) {
    return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

function buildGoogleMapsPreviewUrl(latitude: number, longitude: number) {
    return `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
}

function buildGoogleMapsDirectionUrl(latitude: number, longitude: number) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
}

function metadataFields(row: IndustryRow): Array<[string, string]> {
    if (row.platform === "Google Maps") {
        return [
            ["Latitude", row.metadata.latitude.toFixed(6)],
            ["Longitude", row.metadata.longitude.toFixed(6)],
            ["Place ID", row.metadata.placeId],
            ["Maps URL", row.metadata.mapsUrl],
            ["Rating", row.metadata.rating.toFixed(1)],
            ["Review Count", String(row.metadata.reviewCount)],
        ];
    }

    if (row.platform === "YouTube") {
        return [
            ["Channel ID", row.metadata.channelId],
            ["Channel", row.metadata.channelTitle],
            ["Video ID", row.metadata.videoId],
            ["Judul Video", row.metadata.videoTitle],
            ["Video URL", row.metadata.videoUrl],
            ["Published At", row.metadata.publishedAt],
            ["Views", String(row.metadata.viewCount)],
            ["Likes", String(row.metadata.likeCount)],
            ["Komentar", String(row.metadata.commentCount)],
            ["Subscriber", String(row.metadata.subscriberCount)],
        ];
    }

    return [
        ["Author ID", row.metadata.authorId],
        ["Author Username", row.metadata.authorUsername],
        ["Video ID", row.metadata.videoId],
        ["Judul Video", row.metadata.videoTitle],
        ["Video URL", row.metadata.videoUrl],
        ["Published At", row.metadata.publishedAt],
        ["Views", String(row.metadata.viewCount)],
        ["Likes", String(row.metadata.likeCount)],
        ["Komentar", String(row.metadata.commentCount)],
        ["Share", String(row.metadata.shareCount)],
        ["Follower", String(row.metadata.followerCount)],
    ];
}

export default function DataIndustriDetailModal({
    row,
    editable = false,
    onSave,
    onClose,
}: DataIndustriDetailModalProps) {
    if (!row) return null;

    return (
        <DataIndustriDetailModalContent
            key={`${row.id}-${row.updatedAt}`}
            row={row}
            editable={editable}
            onSave={onSave}
            onClose={onClose}
        />
    );
}

interface DataIndustriDetailModalContentProps {
    row: IndustryRow;
    editable: boolean;
    onSave?: (updated: IndustryRow) => void;
    onClose: () => void;
}

function DataIndustriDetailModalContent({
    row,
    editable,
    onSave,
    onClose,
}: DataIndustriDetailModalContentProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<IndustryRow>(row);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const hasMapPreview =
        draft.platform === "Google Maps" &&
        isValidCoordinate(draft.metadata.latitude, draft.metadata.longitude);
    const mapsPreviewUrl = hasMapPreview
        ? buildGoogleMapsPreviewUrl(
              draft.metadata.latitude,
              draft.metadata.longitude,
          )
        : "";
    const destinationUrl = hasMapPreview
        ? buildGoogleMapsDirectionUrl(
              draft.metadata.latitude,
              draft.metadata.longitude,
          )
        : "";

    const readOnlyFields = [
        ["ID", draft.id],
        ["Anomali", draft.isInsideKaranganyar ? "Tidak" : "Ya"],
        ["Updated At", draft.updatedAt],
    ] as const;

    const fields = [
        ["Nama Usaha", draft.namaUsaha],
        ["KBLI", draft.kbliKategori],
        ["Provinsi ID", draft.provinsiId],
        ["Kabupaten ID", draft.kabupatenId],
        ["Kecamatan ID", draft.kecamatanId],
        ["Kecamatan", draft.kecamatanNama],
        ["Desa ID", draft.desaId],
        ["Desa", draft.desaNama],
    ] as const;

    const validate = () => {
        const requiredStrings: Array<[string, string]> = [
            ["Nama Usaha", draft.namaUsaha],
            ["KBLI", draft.kbliKategori],
            ["Provinsi ID", draft.provinsiId],
            ["Kabupaten ID", draft.kabupatenId],
            ["Kecamatan ID", draft.kecamatanId],
            ["Kecamatan", draft.kecamatanNama],
            ["Desa ID", draft.desaId],
            ["Desa", draft.desaNama],
        ];

        for (const [label, value] of requiredStrings) {
            if (!cleanString(value)) {
                setErrorMessage(`${label} wajib diisi.`);
                return false;
            }
        }

        if (draft.platform === "Google Maps") {
            if (
                !Number.isFinite(draft.metadata.latitude) ||
                draft.metadata.latitude < -90 ||
                draft.metadata.latitude > 90
            ) {
                setErrorMessage(
                    "Latitude harus berupa angka valid di rentang -90 sampai 90.",
                );
                return false;
            }

            if (
                !Number.isFinite(draft.metadata.longitude) ||
                draft.metadata.longitude < -180 ||
                draft.metadata.longitude > 180
            ) {
                setErrorMessage(
                    "Longitude harus berupa angka valid di rentang -180 sampai 180.",
                );
                return false;
            }
        }

        setErrorMessage(null);
        return true;
    };

    const handleSave = () => {
        if (!onSave) return;
        if (!validate()) return;

        onSave({
            ...draft,
            namaUsaha: cleanString(draft.namaUsaha),
            kbliKategori: cleanString(draft.kbliKategori),
            provinsiId: cleanString(draft.provinsiId),
            kabupatenId: cleanString(draft.kabupatenId),
            kecamatanId: cleanString(draft.kecamatanId),
            kecamatanNama: cleanString(draft.kecamatanNama),
            desaId: cleanString(draft.desaId),
            desaNama: cleanString(draft.desaNama),
            updatedAt: nowTimestamp(),
        });

        setIsEditing(false);
    };

    return (
        <div className="modal modal-open overflow-x-hidden">
            <div className="modal-box mx-auto flex w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden border border-base-300 p-3 shadow-xl max-h-[100dvh] sm:w-full sm:max-w-5xl sm:p-5 sm:max-h-[92dvh] md:p-6">
                <div className="border-b border-base-200 pb-3 sm:pb-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-base font-bold leading-tight sm:text-lg">
                                {draft.namaUsaha}
                            </h3>
                            <p className="mt-1 text-xs text-base-content/65">
                                Detail entitas industri digital.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-circle btn-ghost btn-sm"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span
                            className={`badge ${platformTone(draft.platform)}`}
                        >
                            {draft.platform}
                        </span>
                        <span className={`badge ${statusTone(draft.status)}`}>
                            {draft.status}
                        </span>
                        {!draft.isInsideKaranganyar ? (
                            <span className="badge badge-warning">
                                Luar Karanganyar
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="flex-1 min-h-0 space-y-4 overflow-y-auto overscroll-contain py-4 pr-1 sm:py-5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {readOnlyFields.map(([label, value]) => (
                            <div
                                key={label}
                                className="rounded-xl border border-base-300 bg-base-200/45 px-3 py-2.5"
                            >
                                <div className="text-[11px] uppercase tracking-wide text-base-content/55">
                                    {label}
                                </div>
                                <div className="mt-1 text-sm font-semibold break-words">
                                    {value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {isEditing ? (
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                    Nama Usaha
                                </span>
                                <input
                                    className="input input-bordered input-sm w-full flex-1"
                                    value={draft.namaUsaha}
                                    onChange={(event) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            namaUsaha: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                    KBLI
                                </span>
                                <input
                                    className="input input-bordered input-sm w-full flex-1"
                                    value={draft.kbliKategori}
                                    onChange={(event) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            kbliKategori: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                    Platform
                                </span>
                                <select
                                    className="select select-bordered select-sm w-full flex-1"
                                    value={draft.platform}
                                    disabled
                                >
                                    {PLATFORM_FILTER_OPTIONS.map((platform) => (
                                        <option key={platform} value={platform}>
                                            {platform}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                    Status
                                </span>
                                <select
                                    className="select select-bordered select-sm w-full flex-1"
                                    value={draft.status}
                                    onChange={(event) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            status: event.target
                                                .value as IndustryRow["status"],
                                        }))
                                    }
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Verifikasi">
                                        Verifikasi
                                    </option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </label>

                            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                    Provinsi ID
                                </span>
                                <input
                                    className="input input-bordered input-sm w-full flex-1"
                                    value={draft.provinsiId}
                                    onChange={(event) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            provinsiId: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                    Kabupaten ID
                                </span>
                                <input
                                    className="input input-bordered input-sm w-full flex-1"
                                    value={draft.kabupatenId}
                                    onChange={(event) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            kabupatenId: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                    Kec. ID
                                </span>
                                <input
                                    className="input input-bordered input-sm w-full flex-1"
                                    value={draft.kecamatanId}
                                    onChange={(event) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            kecamatanId: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                    Kecamatan
                                </span>
                                <input
                                    className="input input-bordered input-sm w-full flex-1"
                                    value={draft.kecamatanNama}
                                    onChange={(event) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            kecamatanNama: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                    Desa ID
                                </span>
                                <input
                                    className="input input-bordered input-sm w-full flex-1"
                                    value={draft.desaId}
                                    onChange={(event) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            desaId: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                    Desa
                                </span>
                                <input
                                    className="input input-bordered input-sm w-full flex-1"
                                    value={draft.desaNama}
                                    onChange={(event) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            desaNama: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            {draft.platform === "Google Maps" ? (
                                <>
                                    <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                        <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                            Latitude
                                        </span>
                                        <input
                                            className="input input-bordered input-sm w-full flex-1"
                                            type="number"
                                            step="0.000001"
                                            value={draft.metadata.latitude}
                                            onChange={(event) =>
                                                setDraft((prev) =>
                                                    prev.platform ===
                                                    "Google Maps"
                                                        ? {
                                                              ...prev,
                                                              metadata: {
                                                                  ...prev.metadata,
                                                                  latitude:
                                                                      Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ),
                                                              },
                                                          }
                                                        : prev,
                                                )
                                            }
                                        />
                                    </label>

                                    <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                                        <span className="label-text text-xs text-base-content/70 sm:w-24 sm:flex-shrink-0">
                                            Longitude
                                        </span>
                                        <input
                                            className="input input-bordered input-sm w-full flex-1"
                                            type="number"
                                            step="0.000001"
                                            value={draft.metadata.longitude}
                                            onChange={(event) =>
                                                setDraft((prev) =>
                                                    prev.platform ===
                                                    "Google Maps"
                                                        ? {
                                                              ...prev,
                                                              metadata: {
                                                                  ...prev.metadata,
                                                                  longitude:
                                                                      Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ),
                                                              },
                                                          }
                                                        : prev,
                                                )
                                            }
                                        />
                                    </label>
                                </>
                            ) : null}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {fields.map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-xl border border-base-300 bg-base-100 px-3 py-2.5"
                                >
                                    <div className="text-xs text-base-content/60">
                                        {label}
                                    </div>
                                    <div className="mt-1 text-sm font-medium break-all">
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="rounded-xl border border-base-300 bg-base-100 px-3 py-3">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
                            Metadata {draft.platform}
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {metadataFields(draft).map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-lg border border-base-300 bg-base-200/30 px-3 py-2"
                                >
                                    <div className="text-xs text-base-content/60">
                                        {label}
                                    </div>
                                    <div className="mt-1 text-sm font-medium break-words">
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-base-300 bg-base-100 px-3 py-3">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-error" />
                                <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                                    Map Preview
                                </span>
                            </div>

                            {draft.platform === "Google Maps" &&
                            hasMapPreview ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    <a
                                        className="btn btn-xs btn-primary"
                                        href={destinationUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Navigation className="h-3.5 w-3.5" />
                                        Set Destinasi
                                    </a>
                                </div>
                            ) : null}
                        </div>

                        {draft.platform === "Google Maps" ? (
                            hasMapPreview ? (
                                <div className="space-y-2">
                                    <div className="overflow-hidden rounded-lg border border-base-300">
                                        <iframe
                                            title={`Map preview ${draft.namaUsaha}`}
                                            src={mapsPreviewUrl}
                                            className="h-48 w-full sm:h-56 md:h-64"
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-warning py-2 text-sm">
                                    <span>
                                        Koordinat tidak valid, map preview tidak
                                        dapat ditampilkan.
                                    </span>
                                </div>
                            )
                        ) : (
                            <div className="alert py-2 text-sm bg-base-200/50 border border-base-300">
                                <span>
                                    Map preview hanya tersedia untuk data
                                    platform Google Maps.
                                </span>
                            </div>
                        )}
                    </div>

                    {errorMessage ? (
                        <div className="alert alert-error py-2 text-sm">
                            <span>{errorMessage}</span>
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-base-200 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:pt-4">
                    {editable && !isEditing ? (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline w-full sm:w-auto"
                            onClick={() => setIsEditing(true)}
                        >
                            <PencilLine className="h-4 w-4" />
                            Edit
                        </button>
                    ) : null}
                    {editable && isEditing ? (
                        <button
                            type="button"
                            className="btn btn-sm btn-ghost w-full sm:w-auto"
                            onClick={() => {
                                setDraft(row);
                                setIsEditing(false);
                                setErrorMessage(null);
                            }}
                        >
                            <RotateCcw className="h-4 w-4" />
                            Batal Edit
                        </button>
                    ) : null}
                    {!isEditing ? (
                        <button
                            type="button"
                            className="btn btn-ghost w-full sm:w-auto"
                            onClick={onClose}
                        >
                            Tutup
                        </button>
                    ) : null}
                    {editable && isEditing ? (
                        <button
                            type="button"
                            className="btn btn-primary w-full sm:w-auto"
                            onClick={handleSave}
                        >
                            <Save className="h-4 w-4" />
                            Simpan Perubahan
                        </button>
                    ) : null}
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}>
                <button type="button" className="cursor-default">
                    close
                </button>
            </div>
        </div>
    );
}
