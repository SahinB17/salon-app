from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Time, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.staff_service import staff_services

class Staff(Base):
    __tablename__ = "staffs"

    id = Column(Integer, primary_key=True, index=True)
    salon_id = Column(Integer, ForeignKey("salons.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String, nullable=False)
    specialty = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Custom Shift hours
    work_start = Column(Time, nullable=True, default="09:00:00")
    work_end = Column(Time, nullable=True, default="18:00:00")
    working_days = Column(String, nullable=True, default="1,2,3,4,5") # 1=Mon, ..., 7=Sun

    image_url = Column(String, nullable=True)
    rating = Column(Float, nullable=True, default=5.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    salon = relationship("Salon", back_populates="staffs")
    appointments = relationship("Appointment", back_populates="staff", cascade="all, delete-orphan")
    services = relationship("Service", secondary="staff_services", lazy="selectin")
