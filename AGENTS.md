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
