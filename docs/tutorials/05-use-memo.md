# useMemo

`useMemo` menyimpan hasil komputasi agar tidak dihitung ulang setiap render.

## Kapan dipakai

- Filtering/sorting data besar.
- Transformasi data yang cukup mahal.
- Membangun object/array yang jadi dependency hook lain.

## Contoh

```tsx
const visibleRows = useMemo(() => {
	return rows
		.filter((row) => row.status === activeStatus)
		.sort((a, b) => a.name.localeCompare(b.name));
}, [rows, activeStatus]);
```

## Kapan tidak perlu

- Komputasi sangat ringan.
- Value primitive sederhana.

`useMemo` juga punya biaya. Pakai ketika ada manfaat nyata pada performa atau kestabilan dependency.

## Anti-pattern

- Menambahkan `useMemo` di semua variable.
- Dependency tidak lengkap sehingga value stale.
