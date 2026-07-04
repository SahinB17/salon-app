from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Time
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Salon(Base):
    __tablename__ = "salons"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    address = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    contact_phone = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="salons")
    services = relationship("Service", back_populates="salon", cascade="all, delete-orphan")
    open_time = Column(Time, nullable=True)
    close_time = Column(Time, nullable=True)
    
    appointments = relationship("Appointment", back_populates="salon", cascade="all, delete-orphan")
    staffs = relationship("Staff", back_populates="salon", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="salon", cascade="all, delete-orphan")

    @property
    def average_rating(self) -> float:
        if not self.reviews:
            return 0.0
        return round(sum(r.rating for r in self.reviews) / len(self.reviews), 1)
