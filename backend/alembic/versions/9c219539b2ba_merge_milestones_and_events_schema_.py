"""Merge milestones and events schema updates

Revision ID: 9c219539b2ba
Revises: add_milestones_table, ee31389c661e
Create Date: 2025-12-07 08:40:57.440753

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c219539b2ba'
down_revision: Union[str, Sequence[str], None] = ('add_milestones_table', 'ee31389c661e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
