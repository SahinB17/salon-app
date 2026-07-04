from sqlalchemy import select, func, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.appointment import Appointment
from app.models.service import Service

async def get_salon_reports(
    db: AsyncSession, 
    salon_id: int, 
    report_type: str = "daily"
):
    """
    SQL GROUP BY query to fetch daily or monthly revenue and customer count.
    """
    if report_type == "monthly":
        # Postgres specific formatting for month: YYYY-MM
        group_expr = func.to_char(Appointment.start_time, 'YYYY-MM')
    else:
        # Cross-db compatible casting to date
        group_expr = cast(Appointment.start_time, Date)
        
    stmt = (
        select(
            group_expr.label('date'),
            func.sum(Service.price).label('revenue'),
            func.count(Appointment.customer_id.distinct()).label('customers')
        )
        .select_from(Appointment)
        .join(Service, Appointment.service_id == Service.id)
        .where(Appointment.salon_id == salon_id)
        .where(Appointment.status.in_(["pending", "confirmed", "completed"]))
        .group_by(group_expr)
        .order_by(group_expr)
    )
    
    result = await db.execute(stmt)
    rows = result.fetchall()
    
    data_points = []
    total_revenue = 0.0
    total_customers = 0
    
    for row in rows:
        date_str = str(row.date)
        rev = float(row.revenue or 0)
        cust = int(row.customers or 0)
        
        data_points.append({
            "date": date_str,
            "revenue": rev,
            "customers": cust
        })
        total_revenue += rev
        total_customers += cust
        
    return {
        "salon_id": salon_id,
        "report_type": report_type,
        "total_revenue": total_revenue,
        "total_customers": total_customers,
        "data": data_points
    }
