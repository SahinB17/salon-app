# 🤖 Global AI Rules

This file defines the global behavioral rules for all AI agents working on the project. These rules must be strictly followed!

## 1. Backend Rules (FastAPI & DB)
- **Pydantic Schemas:** Every API endpoint must be protected by Pydantic schemas. Request and response models should be clearly differentiated (e.g., `UserCreate`, `UserResponse`).
- **N+1 Query Problem:** Be careful with the N+1 problem when fetching relations with SQLAlchemy. Use `selectinload` or `joinedload` where necessary.
- **Asynchronous Logic:** All database operations and routers must be asynchronous (`async def`). Avoid synchronous (blocking) code.
- **Router Modularity:** Do not bundle all APIs into `main.py`. Each domain should have its own router (e.g., `users.py`, `appointments.py`) and they should be included in `main.py` via `APIRouter`.

## 2. Frontend Rules (React & Tailwind)
- **Inline CSS Forbidden:** All styling must be done with Tailwind CSS classes. Never use `style={{}}` (except for dynamic values).
- **Component Isolation:** Components should serve a single purpose. Break large files into small, reusable components.
- **State Management:** Use `TanStack Query` (React Query) hooks instead of direct `useEffect` for API calls.

## 3. Code Quality and Comments
- Write docstrings or comments explaining what it does above every complex function or algorithm (especially the Overlapping logic).
- Follow the DRY (Don't Repeat Yourself) principle when writing code.

## 4. AI Workflow
Always read the `memory-bank/activeContext.md` and `memory-bank/progress.md` files before starting any operation, and update their statuses after completing the task.
