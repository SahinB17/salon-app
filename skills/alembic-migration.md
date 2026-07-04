---
name: create-alembic-migration
description: Steps to create and apply a new PostgreSQL migration.
---

# Creating and Applying a New Migration

After making a change to the backend database schema (e.g., creating a new model or adding a column), execute these steps:

1. **Verify the Change:** Ensure the changes made in SQLAlchemy models (e.g., `models.py`) are correct and have no syntax errors.
2. **Create the Migration File:** Run the following command in the terminal at the project root:
   ```bash
   alembic revision --autogenerate -m "Add new table or column description"
   ```
3. **Check the Migration:** Open the newly created file in the `alembic/versions/` folder and visually verify that the `upgrade()` and `downgrade()` functions have been generated correctly (ensure unintended tables aren't dropped).
4. **Apply to Database:** If everything is fine, run this command to apply the changes to PostgreSQL:
   ```bash
   alembic upgrade head
   ```
