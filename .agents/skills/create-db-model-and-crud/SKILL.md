---
name: create-db-model-and-crud
description: Standard template for generating SQLAlchemy Models, Pydantic Schemas (v2), and Async CRUD logic.
---

# Database Model, Schema and CRUD Template

When the user asks to add a new database entity (e.g., 'Category', 'Review'), you must follow the strict Layered Clean Architecture rules. Never mix these layers.

### 1. SQLAlchemy Model (`backend/app/models/new_entity.py`)
- Must inherit from `Base`.
- Use explicit typing for SQLAlchemy columns.
- Ensure all relationships use `lazy="selectin"` to prevent `MissingGreenlet` errors with asyncpg.
- Include `created_at` and `updated_at` columns.

### 2. Pydantic Schemas (`backend/app/schemas/new_entity.py`)
- Always use Pydantic v2 conventions.
- Define `NewEntityBase`, `NewEntityCreate`, `NewEntityUpdate`, and `NewEntityResponse`.
- In `NewEntityResponse`, always include `model_config = ConfigDict(from_attributes=True)` to allow SQLAlchemy model parsing.

### 3. CRUD Operations (`backend/app/crud/crud_new_entity.py`)
- Write pure asynchronous database operations using `AsyncSession`.
- Do not include `HTTPException` or route logic here; handle HTTP errors in the router (`api/routers/`).
- Use `result.scalars().unique().all()` if the query includes eager-loaded relationships.
