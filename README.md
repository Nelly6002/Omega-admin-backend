# Omega Admin Backend

A full-stack admin dashboard application with Express backend, HTML/CSS/JS frontend, and Supabase integration for database management.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Database Management](#database-management)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

Omega Admin is a comprehensive admin dashboard solution that combines a Node.js/Express backend with a vanilla JavaScript frontend. It features Supabase integration for robust database management and row-level security.

## Features

- **Authentication System**
  - User registration and login
  - JWT-based authentication
  - Role-based access control
- **Backend Features**
  - Express.js REST API
  - PostgreSQL with Supabase integration
  - Row Level Security (RLS) policies
  - Middleware for auth and role verification
- **Frontend Features**
  - Responsive dashboard interface
  - Login and registration pages
  - Direct Supabase client integration
  - Clean and modern UI with custom CSS

## Project Structure

```
omega-admin-backend/
├── backend/
│   ├── controllers/         # Request handlers
│   ├── database/           # Database configuration and schemas
│   ├── middleware/         # Auth and role middlewares
│   ├── routes/            # API route definitions
│   ├── scripts/           # Database management scripts
│   ├── utils/             # Helper functions
│   ├── server.js          # Express app entry point
│   └── package.json       # Backend dependencies
│
├── frontend/
│   ├── dashboard.html     # Admin dashboard page
│   ├── login.html        # User login page
│   ├── register.html     # User registration page
│   ├── script.js         # Frontend JavaScript
│   ├── style.css         # Global styles
│   └── supabaseClient.js # Supabase configuration
│
└── .gitignore            # Git ignore rules
```

## Prerequisites

- Node.js 16+ (recommended)
- npm or yarn
- Supabase account and project
- Modern web browser
- PostgreSQL (if running locally)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file (see Environment Variables section)

4. Initialize the database:

```bash
node scripts/migrate.js
node scripts/seedAdmin.js
```

5. Start the server:

```bash
npm run dev
```

### Frontend Setup

1. Open `frontend/supabaseClient.js` and update Supabase credentials
2. Serve the frontend directory using a local server
3. Open `login.html` in your browser

### Database Setup

1. Run the initial schema:

```bash
node scripts/migrate.js
```

2. Apply RLS policies:

```bash
node scripts/createSupabaseAdmin.js
```

3. Test the connection:

```bash
node scripts/testDb.js
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
```

## Available Scripts

Backend scripts:

- `npm run dev` - Start development server
- `node scripts/migrate.js` - Run database migrations
- `node scripts/seedAdmin.js` - Create initial admin user
- `node scripts/createSupabaseAdmin.js` - Set up Supabase admin
- `node scripts/testDb.js` - Test database connection

## Database Management

The project uses PostgreSQL with Supabase and includes:

- `database/schema.sql` - Database schema definition
- `database/rls_policies.sql` - Row Level Security policies
- `scripts/migrate.js` - Database migration tool
- `scripts/seedAdmin.js` - Admin user seeding

### Row Level Security

RLS policies are defined in `database/rls_policies.sql` and enforced by Supabase. They control:

- User access to their own data
- Admin access to all data
- Business data visibility

## API Documentation

### Authentication Endpoints

- POST `/auth/register` - User registration
- POST `/auth/login` - User login

### User Endpoints

- GET `/user` - Get user profile
- PUT `/user` - Update user profile
- DELETE `/user` - Delete user account

### Business Endpoints

- GET `/businesses` - List businesses
- POST `/businesses` - Create business
- PUT `/businesses/:id` - Update business
- DELETE `/businesses/:id` - Delete business

### Admin Endpoints

- GET `/admin/users` - List all users
- GET `/admin/businesses` - List all businesses
- POST `/admin/users/:id/role` - Update user role

All protected routes require a valid JWT token in the Authorization header.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

Please ensure you update both frontend and backend tests as needed.

## License

ISC License - See LICENSE file for details.

---

For detailed API documentation and frontend component details, please check the respective directories' documentation files.
