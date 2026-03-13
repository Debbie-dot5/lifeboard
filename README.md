# Lifeboard — Your Personal Life OS

> Tasks · Journal · Habits · Planner · Reminders · Reading — all in one place.

---

## Monorepo Structure

```
lifeboard/
├── apps/
│   ├── web/          ← Next.js 14 app (build this first)
│   └── mobile/       ← Expo (React Native) app (build after web MVP)
├── packages/
│   ├── types/        ← Shared TypeScript types (used by both apps)
│   ├── validations/  ← Shared Zod schemas (used by both apps)
│   ├── lib/          ← Shared utilities + Supabase client
│   ├── ui-web/       ← Web-only React components
│   └── ui-mobile/    ← Mobile-only React Native components
├── turbo.json
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 10+
- A Supabase project (free tier works fine)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/lifeboard.git
cd lifeboard
npm install
```

### 2. Set up environment variables

```bash
# Web
cp apps/web/.env.example apps/web/.env.local

# Mobile (when you're ready)
cp apps/mobile/.env.example apps/mobile/.env.local
```

Fill in your Supabase URL and anon key from your Supabase project dashboard.

### 3. Run the web app

```bash
npm run dev:web
# or
cd apps/web && npm run dev
```

### 4. Run the mobile app (when ready)

```bash
npm run dev:mobile
# or
cd apps/mobile && npm run dev
```

---

## Tech Stack

| Layer | Web | Mobile |
|-------|-----|--------|
| Framework | Next.js 14 (App Router) | Expo (React Native) |
| Language | TypeScript | TypeScript |
| Styling | Tailwind CSS | NativeWind |
| Server State | TanStack Query v5 | TanStack Query v5 (shared) |
| Backend | Supabase | Supabase (shared) |
| Validation | Zod (shared) | Zod (shared) |
| Client State | Zustand | Zustand (shared) |
| Animation | GSAP | React Native Reanimated |
| PDF Reader | react-pdf | react-native-pdf |
| EPUB Reader | epubjs | — (future) |
| Deployment | Vercel | Expo EAS |

---

## Development Strategy

**Phase 1 (Now):** Build the web app fully. The `packages/` folder grows naturally as you extract shared logic.

**Phase 2 (Post web launch):** Open `apps/mobile/`, import everything from `packages/`, and build only the UI layer fresh in React Native.

---

## Package Scripts

```bash
npm run dev          # Run all apps in parallel
npm run dev:web      # Run web only
npm run dev:mobile   # Run mobile only
npm run build        # Build all apps
npm run build:web    # Build web only
npm run type-check   # TypeScript check across all packages
npm run lint         # Lint across all packages
```

---

## Environment Variables

### Web (`apps/web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Mobile (`apps/mobile/.env.local`)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

---

Built by Debbie. For the ones building their life on purpose.
