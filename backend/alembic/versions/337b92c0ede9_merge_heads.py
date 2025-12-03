"""merge heads

Revision ID: 337b92c0ede9
Revises: a8c308abf630, b9c4e8f20a3d
Create Date: 2025-12-03 12:35:47.151955

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '337b92c0ede9'
down_revision: Union[str, Sequence[str], None] = ('a8c308abf630', 'b9c4e8f20a3d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
