# useRef

`useRef` menyimpan nilai mutable yang tidak memicu re-render.

## Kapan dipakai

- Menyimpan instance library (map/editor/player).
- Akses DOM secara imperative.
- Menyimpan nilai antar render tanpa masuk state UI.

## Contoh dasar

```tsx
const inputRef = useRef<HTMLInputElement | null>(null);

function focusInput() {
	inputRef.current?.focus();
}
```

## Ref vs State

- Gunakan state jika perubahan nilai harus mengubah UI.
- Gunakan ref jika perubahan nilai tidak perlu render ulang.

## Anti-pattern

- Menjadikan `ref.current` sebagai sumber kebenaran UI.
- Mengubah `ref.current` lalu berharap komponen otomatis rerender.

## Konteks di project

- `components/peta-industri/PetaIndustriMapCanvas.tsx` untuk mengontrol map (`jumpTo`, `easeTo`).
