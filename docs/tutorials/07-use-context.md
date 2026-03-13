# useContext

`useContext` membaca data global dari sebuah Context Provider.

## Kapan dipakai

- State yang dipakai banyak komponen lintas tree.
- Data global seperti session, theme, notif, alert.

## Contoh pola

```tsx
const TimedAlertContext = createContext<TimedAlertApi | null>(null);

export function useTimedAlert() {
	const ctx = useContext(TimedAlertContext);
	if (!ctx) throw new Error("useTimedAlert must be used within provider");
	return ctx;
}
```

## Praktik yang baik

- Export custom hook (`useX`) agar pemakaian konsisten.
- Letakkan provider di level layout yang tepat.

## Hindari ini

- Semua state dimasukkan context (menyebabkan rerender luas).
- Context untuk state lokal halaman tunggal.

## Konteks di project

- Provider utama ada di `app/(main)/layout.tsx`.
- Contoh pemakaian `useTimedAlert()` di `components/help/HelpTicketingPage.tsx`.
