# useState

`useState` dipakai untuk state lokal komponen.

## Kapan dipakai

- Nilai input form.
- Buka/tutup modal.
- Flag loading sederhana.

## Contoh dasar

```tsx
const [count, setCount] = useState(0);

function increment() {
	setCount((prev) => prev + 1);
}
```

Gunakan bentuk callback (`prev => ...`) ketika nilai baru tergantung nilai lama.

## Pola yang disarankan

- Mulai dari state minimum.
- Simpan source of truth, hindari state turunan yang bisa dihitung.

Contoh lebih baik:

```tsx
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const fullName = `${firstName} ${lastName}`.trim();
```

## Anti-pattern

- Terlalu banyak state kecil yang saling terkait (pertimbangkan `useReducer`).
- Menyimpan data yang sebenarnya bisa dihitung dari props/state lain.

## Konteks di project

- `app/(auth)/login/page.tsx`
- `app/(main)/data-industri/page.tsx`
