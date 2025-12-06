"""Add chain of custody field to analysis results

Revision ID: b9c4e8f20a3d
Revises: 828ecdd9302d
Create Date: 2025-12-03 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'b9c4e8f20a3d'
down_revision = '828ecdd9302d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add chain_of_custody column to analysis_results table
    op.add_column('analysis_results', 
        sa.Column('chain_of_custody', postgresql.JSON(astext_type=sa.Text()), nullable=True)
    )


def downgrade() -> None:
    # Remove chain_of_custody column
    op.drop_column('analysis_results', 'chain_of_custody')
