from sqlalchemy import Table, Column, Integer, ForeignKey
from app.db.database import Base

staff_services = Table(
    "staff_services",
    Base.metadata,
    Column("staff_id", Integer, ForeignKey("staffs.id", ondelete="CASCADE"), primary_key=True),
    Column("service_id", Integer, ForeignKey("services.id", ondelete="CASCADE"), primary_key=True)
)
