from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    role = Column(String, default="customer")
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    salons = relationship("Salon", back_populates="owner", cascade="all, delete-orphan")
    appointments_as_customer = relationship("Appointment", foreign_keys="Appointment.customer_id", back_populates="customer", cascade="all, delete-orphan")
    appointments_as_staff = relationship("Appointment", foreign_keys="Appointment.staff_id", back_populates="staff")
