"""add_unique_index_for_active_bookings

Revision ID: a880fe110cf7
Revises: 9a498fa4515d
Create Date: 2026-07-04 22:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a880fe110cf7'
down_revision: Union[str, None] = '9a498fa4515d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Partial unique index: prevents two active (non-cancelled/non-completed)
    # appointments from having the same staff_id + start_time.
    # Uses COALESCE so that NULL staff_id values are treated as -1,
    # ensuring two "any staff" bookings at the same time also conflict.
    op.execute("""
        CREATE UNIQUE INDEX ix_appointments_active_booking
        ON appointments (COALESCE(staff_id, -1), start_time)
        WHERE status NOT IN ('cancelled', 'completed')
    """)


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_appointments_active_booking")
