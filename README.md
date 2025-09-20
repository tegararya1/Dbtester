# Damayanti Dashboard

A modern web dashboard for the Damayanti management system built with SvelteKit, TypeScript, and Skeleton UI.

## Features

✅ **JWT Authentication** - Secure login with token storage in localStorage  
✅ **Route Protection** - Dashboard routes are protected and redirect to login  
✅ **Responsive Design** - Works on desktop and mobile devices  
✅ **Dark Mode** - Built-in dark/light theme support via Skeleton UI  
✅ **API Integration** - Connects to the Damayanti API backend  
✅ **Modern Stack** - SvelteKit 5, TypeScript, TailwindCSS, Skeleton UI  

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) or Node.js 18+
- Access to the Damayanti API at `https://damayanti-api.vercel.app`

### Installation

1. Install dependencies: `bun install`
2. Start the development server: `bun dev`
3. Open your browser and navigate to `http://localhost:5173`

## Authentication

The application implements JWT-based authentication:

- **Login Form**: Email and password authentication
- **Token Storage**: JWT tokens are stored in localStorage with the key `access_token`
- **Route Protection**: Dashboard routes redirect to login if not authenticated
- **Logout**: Clears the token and redirects to login

### Demo Usage

You can use any valid email format and password (minimum 6 characters) to test the login flow.

## Key Files

- `src/lib/stores/auth.ts` - Authentication store and logic
- `src/routes/login/+page.svelte` - Login page with Skeleton UI
- `src/routes/dashboard/+layout.svelte` - Protected dashboard layout
- `src/routes/dashboard/+page.svelte` - Dashboard overview
- `src/routes/dashboard/students/+page.svelte` - Students management

## API Integration

Connects to the Damayanti API at `https://damayanti-api.vercel.app/api`

- `POST /auth/login` - User authentication
- `GET /students` - Fetch students list

## Tech Stack

- **SvelteKit 5** with TypeScript
- **Skeleton UI** for components and styling
- **TailwindCSS** for utilities
- **JWT** authentication with localStorage
