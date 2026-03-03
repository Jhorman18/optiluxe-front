# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Production build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

No test runner is configured in this project.

## Architecture Overview

**OptiLuxe Front** is a React 19 + Vite SPA for an optical clinic management system, deployed on Vercel.

### Key Technologies
- **Routing:** React Router DOM v7 (client-side, SPA rewrites via `vercel.json`)
- **Forms:** React Hook Form
- **HTTP:** Axios with `withCredentials: true` (cookie-based auth)
- **Styling:** Tailwind CSS v4 (utility classes only — no custom CSS files)
- **Notifications:** React Hot Toast

### Directory Structure

```
src/
├── components/     # Feature-based reusable components (auth/, home/, factura/, etc.)
├── pages/          # Full-page views; auth/ and factura/ are sub-folders
├── routes/         # AppRouter.jsx (main router) + ProtectedRoute.jsx (RBAC)
├── context/auth/   # AuthContext.jsx + useAuth() hook — single auth state source
├── services/       # Axios API calls (api.js base instance, auth.service.js, facturaService.js)
├── config/         # env.js (API URL), servicesData.js (static services content)
├── data/           # Mock data (productsMock.js)
└── layouts/        # MainLayout.jsx wrapper
```

### Authentication & RBAC

- `AuthProvider` wraps the entire app in `main.jsx`; call `useAuth()` to access `usuario`, `isAuthenticated`, `rol`, `login()`, `register()`
- `meService()` (GET /auth/me) hydrates auth state on app load via cookies
- `ProtectedRoute` accepts `allowedRoles` array; roles are `"ADMINISTRADOR"` and `"EMPLEADO"`
- Unauthenticated users are redirected to `/login`; wrong role redirects to `/`

### Routing

- Public: `/`, `/login`, `/servicios`, `/conocenos`, `/productos`
- Admin only: `/test`
- Admin + Employee: `/facturas`, `/facturas/crear`
- Login/register share `/login` via `?mode=login` / `?mode=register` query param

### API Service Pattern

All API calls go through the axios instance in `src/services/api.js` (base URL from `VITE_API_URL` env var). Services return `response.data` directly. Error messages are extracted as `err?.response?.data?.message`.

**Known issue:** `facturaService.js` uses a hardcoded `http://localhost:3000/api/factura` URL instead of the shared axios instance — fix this when modifying invoice features.

### Environment Variables

```
VITE_API_URL=http://localhost:3000/api
```

### Styling Conventions

- Tailwind only — `index.css` contains just the Tailwind import, `App.css` is empty
- Primary color: `blue-600` / `blue-700`; uses `md:` breakpoint for responsive layout
- Common patterns: gradient backgrounds, `rounded-*`, `shadow-*`, hover transitions

### Form Validation Conventions (React Hook Form)

- Document field: numeric, min 6 digits
- Phone: numeric, exactly 10 digits
- Password: min 8 chars, must contain letter + number
- Invoice fields: `subtotal` triggers auto-calculation of IVA (19%) and total on blur; IVA and total are read-only

### User Registration Payload

Backend field names use `usu` prefix: `usuNombre`, `usuApellido`, `usuDocumento`, `usuTelefono`, `usuCorreo`, `usuPassword`, `usuDireccion`, `usuEstado`. Default role on register is `"CLIENTE"`.
