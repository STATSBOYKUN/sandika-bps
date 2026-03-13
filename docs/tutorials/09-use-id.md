# useId

`useId` membuat ID unik yang stabil untuk aksesibilitas.

## Kapan dipakai

- Menghubungkan `label` dan `input`.
- Komponen reusable yang butuh ID unik tanpa bentrok.

## Contoh

```tsx
function SearchBox() {
	const id = useId();
	return (
		<div>
			<label htmlFor={id}>Cari</label>
			<input id={id} type="text" />
		</div>
	);
}
```

## Catatan

- `useId` bukan pengganti primary key database.
- Jangan pakai untuk key list dinamis (`key={...}`), gunakan ID data.
