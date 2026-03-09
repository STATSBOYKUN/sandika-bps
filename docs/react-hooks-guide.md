# Panduan React Hooks

Dokumen ini fokus pada penggunaan hook React untuk developer di codebase ini.

## Prinsip umum

- Gunakan hook hanya di level atas function component atau custom hook.
- Jangan panggil hook di dalam kondisi, loop, atau nested function.
- Pisahkan state UI lokal vs state data remote dengan jelas.
- Gunakan memoization seperlunya, bukan default untuk semua hal.

## `useState`

Menyimpan state lokal komponen.

Kapan dipakai:

- nilai input form
- status modal/tooltip
- flag loading/error sederhana

Contoh:

```tsx
const [isOpen, setIsOpen] = useState(false);
```

Tips:

- Untuk update berdasar nilai sebelumnya, gunakan callback:

```tsx
setCount((prev) => prev + 1);
```

Contoh nyata di project:

- `app/(auth)/login/page.tsx`
- `app/(main)/data-industri/page.tsx`
- `components/peta-industri/PetaIndustriMap.tsx`

## `useEffect`

Menjalankan side effect setelah render.

Use case umum:

- fetch data awal
- subscribe/unsubscribe event listener
- sinkronisasi state turunan

Contoh fetch saat mount:

```tsx
useEffect(() => {
  void loadRows();
}, [loadRows]);
```

Anti-pattern:

- menaruh logika murni komputasi di `useEffect` padahal cukup `useMemo`
- dependency array tidak lengkap sehingga behavior tidak konsisten

Contoh nyata di project:

- redirect session login: `app/(auth)/login/page.tsx`
- load data + sinkronisasi filter: `app/(main)/data-industri/page.tsx`
- reset posisi map berdasarkan token: `components/peta-industri/PetaIndustriMapCanvas.tsx`

## `useRef`

Menyimpan nilai mutable yang tidak memicu re-render.

Kapan dipakai:

- menyimpan instance library (map/editor/chart)
- akses DOM imperative

Contoh di project:

```tsx
const mapRef = useRef<MapRef | null>(null);
```

Digunakan untuk memanggil API map imperative (`jumpTo`, `easeTo`) di `components/peta-industri/PetaIndustriMapCanvas.tsx`.

## `useMemo`

Memoisasi hasil komputasi agar tidak dihitung ulang di setiap render.

Kapan dipakai:

- filtering/sorting data yang relatif berat
- membangun map/lookup object

Contoh:

```tsx
const filteredRows = useMemo(() => {
  return rows.filter((row) => row.status === "Aktif");
}, [rows]);
```

Catatan:

- `useMemo` membantu jika komputasi cukup berat atau dipakai luas.
- Jangan gunakan untuk value sederhana yang murah dihitung.

## `useCallback`

Memoisasi referensi fungsi agar stabil antar render.

Kapan dipakai:

- fungsi dijadikan dependency `useEffect`
- fungsi dikirim ke child yang sensitif terhadap referensi

Contoh:

```tsx
const loadRows = useCallback(async () => {
  // fetch data
}, []);
```

Contoh nyata:

- `app/(main)/data-industri/page.tsx`
- `components/peta-industri/PetaIndustriMap.tsx`

## `useDeferredValue`

Menunda reaksi terhadap value yang cepat berubah (misalnya input search) agar UI tetap responsif.

Contoh nyata di project (`app/(main)/data-industri/page.tsx`):

```tsx
const [searchInput, setSearchInput] = useState("");
const deferredSearch = useDeferredValue(searchInput);

useEffect(() => {
  setGlobalFilter(deferredSearch.trim());
}, [deferredSearch]);
```

Manfaat:

- saat user mengetik cepat, filter tabel tidak menghitung ulang terlalu agresif.

## `useContext`

Membaca state global yang disediakan context provider.

Contoh nyata:

- `useTimedAlert()` di `components/help/HelpTicketingPage.tsx`
- Provider dipasang di `app/(main)/layout.tsx`

Tips:

- gunakan context untuk state lintas banyak komponen
- hindari context untuk state yang hanya lokal satu halaman

## `useReducer`

Cocok untuk state kompleks dengan banyak aksi, terutama jika update state saling terkait.

Kapan dipertimbangkan:

- form besar multi-step
- banyak aksi state dengan aturan bisnis jelas

Pattern dasar:

```tsx
type Action = { type: "set_name"; payload: string };

function reducer(state: { name: string }, action: Action) {
  switch (action.type) {
    case "set_name":
      return { ...state, name: action.payload };
    default:
      return state;
  }
}
```

Catatan codebase:

- Saat ini mayoritas state masih memakai kombinasi `useState` + helper function.

## `useTransition`

Dipakai untuk menandai update non-urgent agar interaksi utama tetap halus.

Use case:

- update list besar setelah aksi user
- perpindahan state berat yang tidak harus blocking input

Pattern dasar:

```tsx
const [isPending, startTransition] = useTransition();

startTransition(() => {
  setBigState(next);
});
```

## `useId`

Membuat id unik stabil untuk menghubungkan elemen aksesibilitas (`label` <-> `input`).

Pattern:

```tsx
const id = useId();
```

Gunakan ketika komponen reusable membutuhkan ID unik tanpa bentrok.

## Checklist hook review

- Apakah dependency array `useEffect/useMemo/useCallback` sudah benar?
- Apakah state yang saling terkait perlu digabung atau dipindah ke reducer?
- Apakah efek side-effect punya cleanup jika perlu?
- Apakah penggunaan `useMemo/useCallback` memang memberi manfaat nyata?
