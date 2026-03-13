# Aturan Dasar Hooks

Sebelum masuk ke tiap hook, pahami aturan ini agar aplikasi stabil dan bebas bug aneh.

## 1) Panggil hook hanya di level atas

Benar:

```tsx
function MyComponent() {
	const [open, setOpen] = useState(false);
	return <button onClick={() => setOpen((v) => !v)}>Toggle</button>;
}
```

Salah (di dalam kondisi):

```tsx
function BadComponent({ enabled }: { enabled: boolean }) {
	if (enabled) {
		useEffect(() => {
			// jangan lakukan ini
		}, []);
	}
	return null;
}
```

## 2) Panggil hook hanya dari React function

- Boleh: function component.
- Boleh: custom hook (`useSomething`).
- Jangan: function util biasa.

## 3) Dependency array harus jujur

Untuk `useEffect`, `useMemo`, `useCallback`, pastikan semua nilai dari scope luar yang dipakai di callback tercantum di dependency array.

## 4) Side effect di `useEffect`, bukan di render

- Render harus murni (pure).
- Operasi seperti `fetch`, subscribe event, atau update API eksternal dilakukan di effect.

## 5) Cleanup saat ada resource jangka panjang

Jika membuat subscription/timer/listener, selalu cleanup:

```tsx
useEffect(() => {
	const id = setInterval(() => {
		// do something
	}, 1000);
	return () => clearInterval(id);
}, []);
```

## Checklist cepat

- Apakah urutan hook selalu sama di setiap render?
- Apakah side effect sudah dipisah dari logic render?
- Apakah ada listener/timer yang lupa dibersihkan?
