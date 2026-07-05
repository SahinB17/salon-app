"""add_pg_trgm_extension

Revision ID: 7e8b5179c9db
Revises: d5081422d7ff
Create Date: 2026-07-06 00:59:27.331614

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7e8b5179c9db'
down_revision: Union[str, None] = 'd5081422d7ff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm;')


def downgrade() -> None:
    op.execute('DROP EXTENSION IF EXISTS pg_trgm;')
