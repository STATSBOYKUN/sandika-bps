# Pattern Custom Hooks

Custom hook dipakai untuk membungkus logic state/effect agar reusable dan lebih rapi.

## Kapan dipakai

- Logic yang sama dipakai di beberapa komponen.
- Komponen terlalu besar karena logic non-UI.

## Aturan naming

- Awali dengan `use`, misal `useIndustryFilters`.
- Kembalikan API yang jelas: data, status, action.

## Contoh struktur

```tsx
type UseListResult<T> = {
	data: T[];
	loading: boolean;
	error: string | null;
	reload: () => Promise<void>;
};

export function useIndustryList(): UseListResult<Industry> {
	const [data, setData] = useState<Industry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const reload = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/industry");
			const json = await res.json();
			setData(json.data ?? []);
		} catch {
			setError("Gagal memuat data");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void reload();
	}, [reload]);

	return { data, loading, error, reload };
}
```

## Praktik baik

- Pisahkan hook data fetching, filtering, dan pagination bila sudah besar.
- Hindari custom hook yang terlalu tahu banyak hal sekaligus.
