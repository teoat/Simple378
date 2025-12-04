"""add_search_personalization_models

Revision ID: c1380048a93a
Revises: f4d6982845bb
Create Date: 2025-12-05 02:48:54.732261

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1380048a93a'
down_revision: Union[str, Sequence[str], None] = 'f4d6982845bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create search_history table
    op.create_table('search_history',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('query', sa.String(), nullable=False),
        sa.Column('search_type', sa.String(), nullable=True),
        sa.Column('filters', sa.JSON(), nullable=True),
        sa.Column('result_count', sa.Integer(), nullable=True),
        sa.Column('search_time_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create search_templates table
    op.create_table('search_templates',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('query', sa.String(), nullable=False),
        sa.Column('search_type', sa.String(), nullable=True),
        sa.Column('filters', sa.JSON(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create search_annotations table
    op.create_table('search_annotations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('document_id', sa.String(), nullable=False),
        sa.Column('annotation_type', sa.String(), nullable=False),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column('position', sa.JSON(), nullable=True),
        sa.Column('is_private', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create search_sessions table
    op.create_table('search_sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.Column('case_id', sa.UUID(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('participant_ids', sa.JSON(), nullable=True),
        sa.Column('session_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables in reverse order
    op.drop_table('search_sessions')
    op.drop_table('search_annotations')
    op.drop_table('search_templates')
    op.drop_table('search_history')
