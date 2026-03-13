# Sandika BPS

Aplikasi web statistics dan data BPS (Badan Pusat Statistik) dengan Next.js.

## Tech Stack

| Kategori  | Teknologi                         | Penjelasan                                         |
| --------- | --------------------------------- | -------------------------------------------------- |
| Framework | Next.js 16 (App Router)           | React framework dengan server components & routing |
| Database  | Prisma ORM                        | ORM untuk database PostgreSQL                      |
| Auth      | Better Auth                       | Authentication & session management                |
| Styling   | Tailwind CSS + DaisyUI            | Utility-first CSS framework + UI components        |
| Maps      | Deck.gl + MapLibre GL             | Visualisasi data geospasial & peta interaktif      |
| Tables    | TanStack Table + TanStack Virtual | Tabel kompleks dengan virtualisasi untuk performa  |

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm/bun

### Installation

```bash
npm install
```

### Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                 # Utilities & helpers
├── prisma/              # Prisma schema & migrations
├── public/              # Static assets
└── styles/              # Global styles
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Deck.gl](https://deck.gl/docs)
