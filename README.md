# Omega Admin Backend

> A lightweight admin backend for managing users, businesses and roles. This repository contains the Express-based API server used by the Omega admin panel.

## Table of contents

- Project overview
- Features
- Requirements
- Quick start
- Environment variables
- Available scripts
- Project structure
- API overview (routes)
- Development notes & troubleshooting
- Contributing
- License

## Project overview

This project is a Node.js / Express backend that exposes endpoints for authentication, user management, business management and admin operations. It is designed to be used together with an admin frontend but also works as a standalone API.

## Features

- JWT-based authentication
- Role-based access (admin / user)
- PostgreSQL database connection
- Modular controllers, models and routes

## Requirements

- Node.js 16+ (recommended)
- npm (or yarn)
- PostgreSQL (or any Postgres-compatible service)

Note: The code uses ES module `import` syntax. If you run into an "Unexpected token import" error, add "type": "module" to `package.json` or run Node with an appropriate transpiler.

## Quick start (Windows PowerShell)

1. Clone the repo and change into the project folder.
2. Install dependencies:

```powershell
npm install
```

3. Create a `.env` file in the project root (see the Environment variables section below).

4. Start the dev server (uses nodemon):

```powershell
npm run dev
```

By default the server will try to read configuration from environment variables. See the environment section next.

## Environment variables

Create a `.env` file containing at least the values below. Example:

```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgres://username:password@localhost:5432/omega_db
JWT_SECRET=your_jwt_secret_here

# Optional: any other custom config used by the app
```

- PORT — port the server listens on (default often 3000 or 4000)
- NODE_ENV — `development` or `production` (the code uses this for conditional SSL options)
- DATABASE_URL — Postgres connection string (recommended) or configure pool options directly in `database/db.js`
- JWT_SECRET — secret used to sign JWT tokens for authentication

Important: Do not commit `.env` to source control. Keep secrets safe.

## Available scripts

- `npm run dev` — start the app with `nodemon` (development)
- `npm test` — currently a placeholder (see package.json)

If you want to run the app with plain Node (no nodemon):

```powershell
node server.js
```

If you see errors about `import`/`export` in Node, add this to `package.json`:

```json
"type": "module"
```

## Project structure

Top-level layout (relevant files/folders):

- `server.js` — app entry (Express setup)
- `controllers/` — request handlers for routes
- `routes/` — route declarations (authRoutes, userRoutes, adminRoutes, businessRoutes)
- `models/` — database interaction helpers
- `database/` — DB pool & helpers
- `middleware/` — authentication & role middleware
- `utils/` — logger, response helpers

## API overview (routes)

The repository contains modular route files. The following summarizes expected endpoints (adjust according to actual controllers):

- Authentication

  - POST /auth/register — register a new user
  - POST /auth/login — login and receive a JWT

- Users

  - GET /user — get current user profile (requires auth)
  - PUT /user — update profile (requires auth)
  - DELETE /user — delete account (requires auth)

- Businesses

  - GET /businesses — list businesses
  - POST /businesses — create business (requires auth/role)
  - PUT /businesses/:id — update business
  - DELETE /businesses/:id — delete business

- Admin
  - Admin routes are protected by role middleware (e.g., `/admin/*`)

Replace/extend these routes to reflect your actual implementation in `routes/*.js` and `controllers/*.js`.

## Development notes & troubleshooting

- If you get runtime errors about database connections, ensure `DATABASE_URL` is correct and Postgres is reachable.
- If you see SSL-related errors in production, check the `ssl` options in `database/db.js` — the code already uses a conditional `rejectUnauthorized: false` when `NODE_ENV === 'production'`.
- If imports fail (syntax errors), add `"type": "module"` to `package.json` or convert to CommonJS `require()`.
- To add a healthcheck, expose a simple GET `/health` route in `server.js` that returns 200 and basic service info.

## Contributing

1. Fork the repo
2. Create a branch for your feature or bugfix
3. Open a pull request with a clear description and tests if applicable

If you change the DB schema, include migration steps or SQL in the PR description.

## License

This project currently lists ISC in `package.json`. Update this file and this README if you choose another license.

## Contact

If you need help understanding parts of the code, share the controller or route file and I can help update the README with exact endpoint signatures and example requests.

---

Summary of what I added:

- A clear quick-start for Windows PowerShell users
- Environment and troubleshooting notes
- API endpoint summary to be filled in as controllers are implemented

If you want, I can now:

1. Populate the API endpoint table with exact request/response examples by reading the implemented controllers.
2. Add a short Postman collection or cURL examples for common flows (register/login, get profile).
