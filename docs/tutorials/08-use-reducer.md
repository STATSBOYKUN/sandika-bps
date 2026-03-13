# useReducer

`useReducer` cocok untuk state kompleks dengan banyak aksi dan transisi yang jelas.

## Kapan dipakai

- Form besar multi-step.
- Banyak update state yang saling berhubungan.
- Butuh pola state transition yang eksplisit.

## Contoh dasar

```tsx
type State = { name: string; email: string; step: number };
type Action =
	| { type: "set_name"; payload: string }
	| { type: "set_email"; payload: string }
	| { type: "next_step" }
	| { type: "prev_step" };

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "set_name":
			return { ...state, name: action.payload };
		case "set_email":
			return { ...state, email: action.payload };
		case "next_step":
			return { ...state, step: state.step + 1 };
		case "prev_step":
			return { ...state, step: Math.max(1, state.step - 1) };
		default:
			return state;
	}
}
```

## Kelebihan

- Logika update terpusat.
- Mudah dites karena reducer function murni.

## Kapan tetap `useState`

- State sederhana dan tidak saling terkait.
- Aksi update sedikit.
