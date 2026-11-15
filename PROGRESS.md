# Week 3 Progress — Library Management System

## Completed

### Client project scaffolding
- `client/package.json` — Vite + React 18 + React Router 7 (+ `oxlint` dev dependency for `npm run lint`)
- `client/vite.config.js`
- `client/index.html` — fonts preconnect + Google Fonts (Fraunces / Inter)
- `client/.env` — `VITE_API_URL=http://localhost:3000`
- `client/.env.example`

### API layer
- `client/src/api/client.js` — plain-JS fetch wrapper (converted from TS syntax so Vite can parse it); `getBooks`, `getBook`, `getGenres`

### Components
- `client/src/components/SearchBar.jsx` — debounced (300ms), clearTimeout cleanup
- `client/src/components/BookCard.jsx` — title, author, genre, cover, availability, link
- `client/src/components/BookGrid.jsx` — fetch, loading/error/empty states, skeleton
- `client/src/components/GenreFilter.jsx` — fetches genres, fallback to prop list
- `client/src/components/Layout.jsx` — header, nav, footer, outlet

### Pages
- `client/src/pages/HomePage.jsx` — search + genre state, toolbar, grid (imports corrected to `../components/*`)
- `client/src/pages/BookDetail.jsx` — useParams, fetch, loading/error, back link

### Routing
- `client/src/main.jsx` — BrowserRouter wrapper
- `client/src/App.jsx` — routes `/` and `/books/:id`

### Styling
- `client/src/styles.css` — **created**: design tokens, layout, toolbar, search bar, genre filter, book grid/cards, badges, skeletons, states, detail page, responsive + reduced-motion rules

## Remaining

_All items complete._

1. ✅ `client/src/styles.css` created (all component classes covered)
2. ✅ Client dependencies installed (`cd client && npm install`)
3. ✅ Frontend builds (`npm run build`) and lints (`npm run lint`)
4. ✅ Root `README.md` rewritten into a comprehensive 3-week document
5. ✅ Backend tests pass (`npm test` — 35 tests, 2 suites)
6. ✅ Week 1 files untouched (schema, migrations, seed)
7. ✅ Acceptance criteria verified (build + lint + tests green)

## Verification Results

- **Client build:** `vite build` — success (47 modules; CSS 11.52 kB, JS 194 kB)
- **Client lint:** `oxlint src/` — clean
- **Backend build:** `nest build` — success
- **Backend lint:** `oxlint --type-aware src/ test/` — clean
- **Backend tests:** `npm test` — 35 passed / 35, 2 suites passed

### Notable fixes made while completing Week 3

- `client/src/pages/HomePage.jsx` imported `./SearchBar` etc. instead of `../components/*` (build-breaking).
- `client/src/api/client.js` contained TypeScript-only syntax in a `.js` file (Vite/esbuild cannot parse it); converted to JSDoc-typed plain JS.
- `client/index.html` had a duplicate `/styles.css` link; removed (the stylesheet is imported via `main.jsx`).
- `api/src/app.controller.spec.ts` failed to load because `@nestjs/testing` v12 is ESM-only while Jest compiles to CommonJS; rewrote the scaffold spec to mock `@nestjs/common` (consistent with `services.spec.ts`) and instantiate the controller directly.