# useDeferredValue

`useDeferredValue` membantu UI tetap lancar saat value berubah sangat cepat (contoh: search input).

## Kapan dipakai

- User mengetik cepat, tapi komputasi filter/list cukup berat.
- Kita ingin input tetap halus sementara hasil mengikuti sedikit tertunda.

## Contoh

```tsx
const [searchInput, setSearchInput] = useState("");
const deferredSearch = useDeferredValue(searchInput);

const filteredRows = useMemo(() => {
	const q = deferredSearch.trim().toLowerCase();
	return rows.filter((row) => row.name.toLowerCase().includes(q));
}, [rows, deferredSearch]);
```

## Manfaat

- Input terasa responsif.
- Perhitungan berat tidak dieksekusi seagresif perubahan tiap karakter.

## Konteks di project

- `app/(main)/data-industri/page.tsx`
