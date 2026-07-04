# Product Context

## 👥 User Roles
1. **Customer:**
   - Can search and view salons and services.
   - Can select a convenient time and book an appointment.
   - Can track past and upcoming appointments.
2. **Admin / Salon Owner (Salon Admin):**
   - Can manage the salon's profile, working hours, and services.
   - Can add staff members and manage their schedules.
   - Can approve, cancel, or modify incoming appointments.
   - Can view revenue and statistics.

## 🔄 Core Flows
### 1. Salon Search
- The customer logs into the system.
- Uses the search panel to find salons by location, name, or service type.
- Enters the salon's page to view services and prices.

### 2. Booking Flow
1. **Service Selection:** The customer selects the desired service(s).
2. **Staff Selection:** Optionally selects a specific barber/stylist.
3. **Time Selection:** The system only displays available times (Overlapping logic applies here).
4. **Confirmation:** The customer confirms the booking, and an appointment is created in the system with a "pending" or "confirmed" status.
