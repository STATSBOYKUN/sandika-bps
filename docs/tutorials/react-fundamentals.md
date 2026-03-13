# React Fundamentals

Panduan ini fokus ke mental model dasar React agar mudah membaca dan menulis komponen.

## 1) Component-driven thinking

- Pecah UI jadi komponen kecil dengan satu tanggung jawab.
- Parent mengatur data, child fokus presentasi.

## 2) Props vs State

- Props: data dari parent (read-only di child).
- State: data lokal yang berubah karena interaksi.

## 3) Controlled form

Untuk input form, jadikan state sebagai sumber kebenaran:

```tsx
const [name, setName] = useState("");

return <input value={name} onChange={(e) => setName(e.target.value)} />;
```

## 4) Lifting state up

Jika dua child butuh data yang sama, naikkan state ke parent lalu kirim via props.

## 5) Render dan rerender

- Rerender normal terjadi saat state/props berubah.
- Fokus optimasi hanya jika ada masalah nyata (lag, list besar, render mahal).

## 6) Error umum pemula

- Mutasi state langsung (`arr.push(...)` tanpa setState baru).
- Menyimpan state turunan yang seharusnya dihitung.
- Memakai index list sebagai `key` saat data dinamis.

## Latihan cepat

- Buat komponen filter list sederhana.
- Tambahkan pencarian + status empty.
- Refactor logic filter ke custom hook.
