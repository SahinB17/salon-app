# System Patterns and Rules

## 🔌 REST API Standards
- Endpoints should be meaningful and resource-oriented (e.g., `GET /api/v1/salons`, `POST /api/v1/appointments`).
- All responses must return in a standard structure:
  ```json
  {
    "status": "success",
    "data": { ... },
    "message": "Successful operation"
  }
  ```
- Errors should be handled with appropriate HTTP status codes (400, 401, 403, 404, 500) and clear error messages (including Pydantic ValidationErrors).

## 🔐 JWT Authentication
- An `access_token` is returned upon login.
- In API requests, the token must be sent via the `Authorization: Bearer <token>` header.
- Token validation is performed via FastAPI `Depends` on all protected endpoints.

## ⏰ Overlapping Logic (Checking Conflicting Times)
When creating an appointment, it is mandatory to ensure that times do not overlap for the same stylist or salon:
1. Extract the `start_time` and `end_time` (calculated based on service duration) from the incoming request.
2. Fetch appointments for the selected staff member on that specific day whose status is **not** `cancelled`.
3. **Overlap Logic:**
   New appointment's `start_time` < Existing appointment's `end_time` AND New appointment's `end_time` > Existing appointment's `start_time`.
4. If an overlap is found, return a `409 Conflict` HTTP error.

## 📱 Responsive UI Structure (Tailwind)
- Apply a "Mobile-first" approach. Default classes are written for mobile, and `md:`, `lg:` prefixes are used for larger screens.
- Components must be small and reusable (e.g., `Button`, `Card`, `Modal`).
- The color palette and typography should be centralized in the `tailwind.config.js` file.
