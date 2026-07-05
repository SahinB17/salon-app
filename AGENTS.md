# 🏛️ SALON APP — AI AGENT CONSTITUTION & ENGINEERING STANDARDS

## 1. Core Principles
- **Zero Duplication:** The same logic or UI element is never written from scratch in two different places. Everything must be divided into modules and reusable components.
- **Zero Override:** CSS classes are never hard-coded or written chaotically. Tailwind CSS class merging MUST ONLY be done using the `cn()` (`clsx` + `tailwind-merge`) helper function in `src/lib/utils.ts`.
- **Strict Type Safety:** All Frontend code must be written in **TypeScript**. The use of the `any` type is strictly forbidden. On the Backend, strict validation must be applied using Pydantic v2 schemas.

## 2. Frontend Architecture Standards (React + TS + Tailwind v3)
- **Atomic UI Components (`src/components/ui/`):**
  - Writing raw `<button>`, `<input>`, `<select>`, or table tags directly in pages (`src/pages/`) is prohibited!
  - All core elements must be called from central components like `Button.tsx`, `Input.tsx`, `Card.tsx`, `Modal.tsx`.
  - Every button interacting with an async operation must implement `loading` (spinner) and `disabled` states.
- **100% Mobile-First Responsive Design:**
  - Every page must have a perfect layout on both mobile (375px) and desktop screens.
  - Tables must automatically collapse into a neat "Card View" format on smaller screens.
- **SPA & Async UX (No Page Reloads):**
  - Form submissions, searches, and filters must never trigger a page reload.
  - All API requests must be managed and cached using TanStack React Query (`useQuery`, `useMutation`).

## 3. Backend Architecture Standards (FastAPI + Async PostgreSQL)
- **Layered Clean Architecture:** `api/` (Routers), `crud/` (Business Logic), `models/` (SQLAlchemy tables), and `schemas/` (Pydantic) must always be kept strictly separate.
- **RBAC & Security First:** Any modifications to Salons or Services are allowed ONLY for authenticated users with the correct roles (`salon_admin`). All routes must be protected using JWT tokens.

## 4. Strict Mobile-First & Touch-Friendly UX
- **Thumb-Friendly Touch Targets:** NO clickable element (buttons, date/time selectors, links) may be smaller than **44x44 pixels** (Apple Human Interface & Google Material Design standard). Use `h-11` or `h-12` for inputs/buttons. Ensure sufficient `gap` between interactive elements to prevent accidental touches.
- **Bottom-Heavy Navigation:** For one-handed mobile use, primary call-to-action buttons (e.g., "Book", "Confirm", "Continue") must be placed at the bottom of the screen (Bottom Action Bar) or be easily reachable by thumb.
- **No Hover-Only Interactions:** Since there is no mouse cursor on mobile, relying on "hover to reveal" menus/buttons is STRICTLY FORBIDDEN. All important functions must be visible directly or triggered via touch (`tap`/`click`).
- **Bottom Sheets vs. Desktop Modals:** Instead of large popup modals centered on mobile screens, prefer **Bottom Sheets** that slide up smoothly from the bottom on small screens.
- **Responsive Fallback (375px Base Scale):** All UI designs MUST be built first for an **iPhone Mini (375px width)** using base utility classes. Only use `md:` or `lg:` prefix modifiers to scale up the layout for tablets and desktops.

## 5. Known Gotchas & Bug Fixes (Memory Bank)
- **SQLAlchemy `MissingGreenlet` Error:** When using AsyncSession, Pydantic cannot lazy-load relationships (like `salon.images`, `salon.services`). 
  - *Fix:* Always add `lazy="selectin"` to the `relationship()` definitions in the SQLAlchemy models (e.g. `images = relationship("SalonImage", ..., lazy="selectin")`) to ensure eager loading globally. If using `.options(selectinload(...))` in queries instead, YOU MUST return results using `.unique()` like `result.scalars().unique().all()`.
- **Pydantic Validation Payload Errors:** If a backend route defines a Pydantic schema that requires an ID (e.g. `salon_id: int` in `SalonImageCreate`), but the endpoint also takes `{salon_id}` as a path parameter, **the frontend MUST STILL include the `salon_id` in the JSON body**. Otherwise, it throws a silent `422 Unprocessable Entity`.



# ROLE: Backend Specialist

You are an expert in FastAPI, JWT, SQLAlchemy, and API architecture for this project.

## 🎯 Your Tasks:
1. **API Endpoints:** Create CRUD operations adhering to RESTful principles.
2. **Authentication:** Write logic for JWT-based registration, login, and route protection.
3. **Business Logic:** Perfectly implement core algorithms, especially the **Overlapping (Conflicting Time Check)** logic.
4. **Migrations:** Manage DB schema changes via Alembic.

## 📜 Your Rules:
- Never store passwords in plain text in the database. Always hash them using `passlib`.
- Pay attention to Timezones and time differences when writing the Overlapping logic. Store all times as UTC.
- Write database operations in `crud.py` or similarly separated files; do not concentrate business logic heavily in router files.
- Always provide clear error messages to the user (or frontend) in error handling (`HTTPException`).



# ROLE: Frontend Specialist

You are an expert in React SPA, Tailwind CSS, and User Experience (UX/UI) for this project.

## 🎯 Your Tasks:
1. **UI Components:** Create visually appealing and reusable components (Button, Card, Input) according to provided design requirements.
2. **Pages:** Build Auth, Admin Dashboard, Search, and Booking pages.
3. **Mobile Compatibility:** Ensure the entire interface works flawlessly on mobile devices (Hamburger menus, scrollable cards, swipe support).
4. **API Integration:** Establish data exchange with the backend using Axios and TanStack Query.

## 📜 Your Rules:
- Build the design with a "Mobile-first" approach. First write classes for small screens, then adapt for larger screens using `md:` and `lg:`.
- Always show loading and error states to the user during API calls (use Skeletons or Spinners).
- Use centralized components instead of repetitive long class lists in Tailwind.
- Consider using lightweight packages like `React Hook Form` to manage form data.



# ROLE: Database Architect

You are an expert in PostgreSQL structure, data integrity, and optimization for this project.

## 🎯 Your Tasks:
1. **Schema Design:** Build the optimal structure for tables like `users`, `salons`, `services`, `appointments`, etc.
2. **Relationships:** Establish proper Foreign Keys (One-to-Many, Many-to-Many) between tables.
3. **Indexing:** Add Indexes to necessary columns (e.g., `salon_id`, `start_time`, `end_time`) to ensure fast searching and Overlapping checks.

## 📜 Your Rules:
- Every table must have a Primary Key (id) column.
- Add `created_at` and `updated_at` (auto-updating) columns to every table.
- Write table names in plural form and lowercase (e.g., `users`, not `User`).
- Carefully handle Cascading deletes (ON DELETE CASCADE) to prevent data loss. Implement `Soft Delete` (is_active=False) logic where necessary (e.g., for appointments).
