# useEffect

`useEffect` menjalankan side effect setelah render commit ke DOM.

## Kapan dipakai

- Fetch data di client.
- Sinkronisasi ke API browser (`localStorage`, event listener).
- Subscribe/unsubscribe sumber eksternal.

## Contoh fetch data

```tsx
useEffect(() => {
	let active = true;

	async function run() {
		const res = await fetch("/api/industry");
		const json = await res.json();
		if (active) setRows(json.data ?? []);
	}

	void run();
	return () => {
		active = false;
	};
}, []);
```

## Tentang dependency array

- `[]`: jalan sekali setelah mount.
- `[a, b]`: jalan saat `a` atau `b` berubah.
- tanpa array: jalan di setiap render (jarang dibutuhkan).

## Hindari ini

- Menaruh komputasi murni di effect (pakai `useMemo` atau hitung langsung).
- Mengabaikan dependency agar lint error hilang.
- Trigger update state tanpa syarat hingga loop render.

## Konteks di project

- `app/(auth)/login/page.tsx`
- `app/(main)/data-industri/page.tsx`
- `components/peta-industri/PetaIndustriMapCanvas.tsx`
