# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Time Management Coach (TMC) - A full-stack productivity app for task management, focus sessions, and time tracking with Google OAuth authentication.

## Tech Stack

- **Client**: React 19 + Vite, Zustand (state), MUI + Bootstrap (UI), React Router v7
- **Server**: Express.js 5, Prisma ORM, MariaDB/MySQL, JWT + Google OAuth

## Development Commands

### Client (`client/`)
```bash
npm run dev      # Start Vite dev server (auto-opens browser)
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

### Server (`server/`)
```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Same as dev
```

### Database (Prisma)
```bash
npx prisma generate      # Generate Prisma client (runs on npm install)
npx prisma db push       # Push schema changes without migration
npx prisma migrate dev   # Create and apply migrations
npx prisma studio        # Open database GUI
```

## Environment Setup

Server requires `.env` in `server/`:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - JWT signing key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `PORT` - Server port (default: 5000)

Client backend URL configured in `client/Config.js`.

## Architecture

### Client Structure
- `src/store/useGlobalStore.js` - Centralized Zustand store managing auth, tasks, qtasks, and focus mode state
- `src/ProtectedRoutes.jsx` - Route definitions with focus mode navigation restrictions
- `src/components/` - Feature components organized by domain (TaskForm, FourQuadrants, EditTags, etc.)
- `Config.js` - Backend URL configuration

### Server Structure
- `server.js` - Express app entry point with route mounting
- `routes/` - Route definitions (auth, tasks, qtasks, focus)
- `controllers/` - Business logic handlers
- `middleware/authMiddleware.js` - JWT verification, sets `req.userId`
- `prisma/schema.prisma` - Database schema (User, Task, Qtask, FocusSession)

### API Endpoints
All protected routes require `Authorization: Bearer <token>` header.
- `/api/auth` - Google OAuth login, profile
- `/api/tasks` - CRUD operations for tasks
- `/api/qtasks` - Quick task logging
- `/api/focus` - Focus session management

### Data Models
- **User** - Google auth profile (email, name, picture)
- **Task** - Main tasks with priority, status, due dates, priority_tags (JSON)
- **Qtask** - Quick task logs for unplanned work
- **FocusSession** - Focus mode sessions with completedTasks (JSON) and taskChanges (JSON)

## Key Patterns

- Auth state persisted via localStorage token; `checkAuth()` validates on app init
- Focus mode restricts navigation and tracks task completions in localStorage until session ends
- All API calls go through `useGlobalStore` with centralized error handling and toast notifications
- Prisma client output is in `server/generated/prisma/` (non-standard location)
