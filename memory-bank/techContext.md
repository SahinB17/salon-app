# Tech Context

## 🏗 Architecture and Technologies

### Backend
- **Framework:** FastAPI (For asynchronous support and high performance)
- **Data Validation & Serialization:** Pydantic (For managing models and schemas)
- **ORM:** SQLAlchemy 2.0 (or SQLModel) with asynchronous (`asyncpg`) driver.
- **Migrations:** Alembic
- **Authentication:** JWT (JSON Web Tokens) - Access and Refresh token logic.
- **Language:** Python 3.10+

### Database
- **RDBMS:** PostgreSQL (For relational data, ACID properties)

### Frontend
- **Framework:** React 18+ (with Vite builder)
- **Styling:** Tailwind CSS (Utility-first approach for fast and responsive design)
- **State Management & API Fetching:** TanStack Query (React Query) for server state management.
- **HTTP Client:** Axios
- **Language:** TypeScript / JavaScript (TS is recommended, but proceed based on the existing configuration).

## 📦 Key Libraries
- `passlib` (for password hashing)
- `python-jose` (for JWT creation and validation)
- `lucide-react` (for frontend icons)
- `react-router-dom` (for page routing)
