# useTransition

`useTransition` menandai update non-urgent agar interaksi utama tetap responsif.

## Kapan dipakai

- Update state berat setelah input user.
- Render list besar yang tidak harus blocking ketikan/klik.

## Contoh

```tsx
const [isPending, startTransition] = useTransition();

function applyFilter(next: string) {
	setInput(next); // urgent

	startTransition(() => {
		setFilter(next); // non-urgent
	});
}
```

## UX pattern

- Tampilkan indikator ringan saat `isPending` true.
- Jangan jadikan semua update sebagai transition.

## Perbedaan dengan `useDeferredValue`

- `useTransition`: menunda update state lewat `startTransition`.
- `useDeferredValue`: menunda konsumsi value yang cepat berubah.
