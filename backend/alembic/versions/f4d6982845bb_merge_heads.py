"""merge_heads

Revision ID: f4d6982845bb
Revises: auth_enhancement_001, ca8819f168df
Create Date: 2025-12-05 02:48:40.990199

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f4d6982845bb'
down_revision: Union[str, Sequence[str], None] = ('auth_enhancement_001', 'ca8819f168df')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
