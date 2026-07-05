# 🏢 Salon App — Business Logic & Domain Context

This document explains the **WHAT** and **WHY** of the project (Domain Knowledge).
AI Agents must read this to understand the business rules before modifying code or database schemas.

## 1. Project Overview
A multi-tenant platform for booking salon services. 
- **Target Audience:** Salon Owners (Admins) who manage their business and services, and Customers (Users) who search for and book appointments.

## 2. Core Entities
- **Users:** Can be Regular Customers or Salon Admins (Role-Based Access).
- **Salons:** Represent physical businesses. Managed by Salon Admins.
- **Services:** Treatments offered by Salons (e.g., Haircut, Manicure) with specific durations and prices.
- **Appointments:** A booking made by a User for a specific Service at a specific Salon, during a specific time slot.

## 3. Strict Business Rules (Do Not Violate)
- **Time Zone & Dates:** All appointment times MUST be stored and processed in **UTC** to prevent timezone bugs. The Frontend handles converting UTC to the user's local time.
- **Overlapping Booking (Conflict Check):** Double-booking is strictly forbidden. The backend MUST verify if the requested time slot overlaps with an existing appointment for the same salon/staff before confirming.
- **Data Integrity (Soft Deletes):** Soft-delete (setting `is_active=False`) is preferred over hard-deleting records (especially for appointments, services, or users) to maintain historical records and financial integrity.
- **Security:** Users can only view or manage data that belongs to them (e.g., A Salon Admin cannot edit another Salon's services).

## 4. Primary User Flows
- **Admin Flow:** Register -> Create a Salon Profile -> Add Services & Pricing -> View & Manage Booking Schedule.
- **Customer Flow:** Search Salons (by name/location) -> Select Service -> Pick an available Time Slot -> Confirm Booking.

*(Note to User: You can add new business rules to this file as the project evolves!)*
