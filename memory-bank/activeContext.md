# Active Context

## 🚀 Current Focus / First Step
We are currently at the stage of **setting up the Database models and project skeleton**.

### Expected Steps:
1. **Backend Skeleton:** Create the FastAPI project's folder structure (routers, models, schemas, core, crud).
2. **Database Models:** Write the Python models for the core tables (`User`, `Salon`, `Service`, `Appointment`) using SQLAlchemy.
3. **Migration:** Initialize Alembic, create the initial migration, and apply it to the database.
4. **Frontend Skeleton:** Set up the React project with Vite and configure Tailwind CSS.

## ⚠️ Key Considerations
- Properly establish relationships (Foreign Keys and relationships) between models (e.g., A salon has many services, a service has many appointments).
- Ensure that the backend's database connection works flawlessly before moving on to the frontend.
