# Phase 1: Backend Skeleton & DB Models Implementation Plan

Bu fayl layihənin backend skeletinin və verilənlər bazası (PostgreSQL) əlaqələrinin qurulması üçün addım-addım icra planını əks etdirir. 

Tələblər `@memory-bank/activeContext.md` və `@.agents/database-architect.md` fayllarından götürülmüşdür.

## 1. Layihə Qovluq Strukturunun Qurulması
- [x] `backend/app` qovluğunun və daxili strukturların yaradılması (`api`, `core`, `crud`, `db`, `models`, `schemas`).
- [x] Kök qovluqda (və ya `backend/` daxilində) `requirements.txt` faylının yaradılması (FastAPI, SQLAlchemy, asyncpg, uvicorn, pydantic-settings, alembic, passlib, python-jose və s. daxil edilməklə).
- [x] Mühit dəyişənləri üçün `backend/.env` və `backend/.env.example` fayllarının yaradılması (DB URL: `postgresql+asyncpg://user:pass@localhost:5432/salon_db`).
- [x] Hər Python qovluğunda müvafiq `__init__.py` fayllarının əlavə edilməsi.

## 2. Verilənlər Bazası Sazlamaları
- [x] `backend/app/core/config.py` faylının yaradılması və `pydantic_settings` ilə `.env` dəyərlərinin oxunması (`Settings` sinfi).
- [x] `backend/app/db/database.py` faylının yaradılması.
- [x] Asinxron (async) SQLAlchemy mühərrikinin (engine) və `sessionmaker`-in (`AsyncSession`) qurulması.
- [x] Bütün modellərin törəyəcəyi `Base` sinfinin yaradılması (`DeclarativeBase`).

## 3. ORM Modellərinin Yaradılması
(Hər bir model `database-architect.md` qaydalarına əsasən `id`, `created_at`, `updated_at` sütunlarına malik olacaq).
- [x] `backend/app/models/user.py`: İstifadəçi modeli (`id`, `email`, `hashed_password`, `role`, `is_active`, `full_name`, `phone`).
- [x] `backend/app/models/salon.py`: Salon modeli (`id`, `owner_id` (FK-user), `name`, `address`, `description`, `contact_phone`).
- [x] `backend/app/models/service.py`: Xidmət modeli (`id`, `salon_id` (FK-salon), `name`, `description`, `price`, `duration_minutes`).
- [x] `backend/app/models/appointment.py`: Rezervasiya modeli (`id`, `customer_id` (FK-user), `salon_id` (FK-salon), `service_id` (FK-service), `staff_id` (FK-user, nullable), `start_time`, `end_time`, `status`).
- [x] `backend/app/models/__init__.py` içində bütün modellərin import edilərək mərkəzləşdirilməsi (Alembic tərəfindən asan tapılması üçün).

## 4. Pydantic Sxemlərinin Yaradılması
- [x] `backend/app/schemas/user.py`: `UserBase`, `UserCreate`, `UserUpdate`, `UserResponse`.
- [x] `backend/app/schemas/salon.py`: `SalonBase`, `SalonCreate`, `SalonUpdate`, `SalonResponse`.
- [x] `backend/app/schemas/service.py`: `ServiceBase`, `ServiceCreate`, `ServiceUpdate`, `ServiceResponse`.
- [x] `backend/app/schemas/appointment.py`: `AppointmentBase`, `AppointmentCreate`, `AppointmentUpdate`, `AppointmentResponse`.

## 5. FastAPI və Alembic Miqrasiya Sazlaması
- [x] `backend/app/main.py` faylının yaradılması (FastAPI app instansiyası, CORS sazlamaları, root endpoint `GET /`).
- [x] Alembic üçün asinxron konfiqurasiyanın (`alembic init -t async alembic`) edilməsi və `alembic.ini` faylının tənzimlənməsi.
- [x] `alembic/env.py` faylında asinxron baza əlaqəsinin konfiqurasiyası və `target_metadata = Base.metadata` təyinatı.
- [x] Məlumat bazasına ilk cədvəllərin yaradılması məqsədilə ilk miqrasiyanın (initial migration) tətbiq olunması.
