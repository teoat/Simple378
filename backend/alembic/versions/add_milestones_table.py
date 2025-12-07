"""Add milestones table for project phase tracking

Revision ID: add_milestones_table
Revises: 337b92c0ede9
Create Date: 2025-12-07 07:46:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = 'add_milestones_table'
down_revision = '337b92c0ede9'  # Updated to actual latest revision
branch_labels = None
depends_on = None


def upgrade():
    """Create milestones table."""
    op.create_table(
        'milestones',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('project_id', UUID(as_uuid=True), sa.ForeignKey('subjects.id'), nullable=False, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),  # DOWN_PAYMENT, PROGRESS, HANDOVER, RETENTION
        sa.Column('status', sa.String(), default='LOCKED', nullable=False),  # LOCKED, ACTIVE, COMPLETE, PAID
        sa.Column('amount_released', sa.Numeric(), nullable=False),
        sa.Column('actual_spend', sa.Numeric(), default=0.0),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('phase', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('evidence_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
    )
    
    # Add index for faster queries
    op.create_index('ix_milestones_project_id', 'milestones', ['project_id'])
    op.create_index('ix_milestones_status', 'milestones', ['status'])
    op.create_index('ix_milestones_due_date', 'milestones', ['due_date'])


def downgrade():
    """Drop milestones table."""
    op.drop_index('ix_milestones_due_date', table_name='milestones')
    op.drop_index('ix_milestones_status', table_name='milestones')
    op.drop_index('ix_milestones_project_id', table_name='milestones')
    op.drop_table('milestones')
