from pydantic import BaseModel
from typing import List

class ReportDataPoint(BaseModel):
    date: str
    revenue: float
    customers: int

class ReportResponse(BaseModel):
    salon_id: int
    report_type: str
    total_revenue: float
    total_customers: int
    data: List[ReportDataPoint]
