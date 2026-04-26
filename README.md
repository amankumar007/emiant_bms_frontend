# Emiant BMS Frontend

Frontend dashboard for Battery Management System (BMS) monitoring built with React, TypeScript, and Vite.

## Features

- JWT based authentication flow (login and register)
- Protected dashboard routes
- Device inventory view
- Live analytics view with board level telemetry charts
- Admin page to register devices
- Admin panel sections for:
  - Newly added devices
  - Config devices waiting for telemetry

## Tech Stack

- React 19
- TypeScript
- Vite
- Axios
- React Router
- Recharts

## Project Structure

- src/pages: Route level pages (Dashboard, Devices, Analytics, Admin, Auth)
- src/components: Shared UI and analytics components
- src/services: API service layer and axios config
- src/context: Auth context and role based state
- src/styles: Page specific styles

## Environment Variables

Create a .env file in the project root with:

```env
VITE_API_URL=https://bms-backend-7ltx.onrender.com
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build production bundle:

```bash
npm run build
```

4. Preview production build:

```bash
npm run preview
```

## Main Routes

- /login - Login page
- /register - Registration page
- /dashboard - Dashboard KPIs
- /devices - Device list
- /analytics/:device_id - Device analytics
- /alerts - Alerts page
- /settings - User settings
- /admin - Admin device registration

## API Usage Summary

Auth:

- POST /api/auth/signup
- POST /api/auth/login

Devices and telemetry:

- GET /api/devices
- GET /api/devices/:id/latest
- GET /api/devices/:id/data
- GET /api/devices/:id/boards
- GET /api/devices/:id/boards/:baddr/latest

Device config and registration:

- POST /api/devices/register
- GET /api/devices/:id/config
- PATCH /api/devices/:id/config (backend supported, not yet wired in UI)

## Notes

- GET /api/devices is telemetry driven. Newly registered devices may not appear there until telemetry exists.
- Registered devices can be fetched individually through GET /api/devices/:id/config.
- Device IDs are case sensitive.

## Scripts

- npm run dev: Start dev server
- npm run build: Type check and build
- npm run preview: Preview production build
- npm run lint: Run ESLint
