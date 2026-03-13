# useCallback

`useCallback` menyimpan referensi fungsi agar stabil antar render.

## Kapan dipakai

- Fungsi dijadikan dependency `useEffect`.
- Fungsi dikirim ke child yang dioptimalkan (`memo`) dan sensitif pada referensi.

## Contoh

```tsx
const loadRows = useCallback(async () => {
	const res = await fetch("/api/industry");
	const json = await res.json();
	setRows(json.data ?? []);
}, []);

useEffect(() => {
	void loadRows();
}, [loadRows]);
```

## Catatan penting

- `useCallback(fn, deps)` setara dengan `useMemo(() => fn, deps)`.
- Jangan pakai jika tidak ada masalah referensi/performa.

## Anti-pattern

- Bungkus semua function dengan `useCallback` tanpa alasan.
- Dependency keliru sehingga function membawa closure lama.

## Konteks di project

- `app/(main)/data-industri/page.tsx`
- `components/peta-industri/PetaIndustriMap.tsx`
