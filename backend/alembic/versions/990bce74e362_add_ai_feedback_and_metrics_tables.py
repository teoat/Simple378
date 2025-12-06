"""add ai feedback and metrics tables

Revision ID: 990bce74e362
Revises: c1380048a93a
Create Date: 2025-12-06 16:41:38.069010

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '990bce74e362'
down_revision: Union[str, Sequence[str], None] = 'c1380048a93a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - create AI feedback and metrics tables."""
    # Create AI Metrics table
    op.create_table('ai_metrics',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('metric_type', sa.String(), nullable=False),
    sa.Column('metric_value', sa.Float(), nullable=False),
    sa.Column('context', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_metrics_created_at'), 'ai_metrics', ['created_at'], unique=False)
    
    # Create AI Conversations table
    op.create_table('ai_conversations',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('session_id', sa.String(), nullable=False),
    sa.Column('message_count', sa.Integer(), nullable=True),
    sa.Column('started_at', sa.DateTime(), nullable=False),
    sa.Column('ended_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_conversations_session_id'), 'ai_conversations', ['session_id'], unique=False)
    
    # Create AI Feedback table
    op.create_table('ai_feedback',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('message_id', sa.String(), nullable=False),
    sa.Column('feedback_type', sa.Enum('POSITIVE', 'NEGATIVE', name='feedbacktype'), nullable=False),
    sa.Column('conversation_context', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_feedback_message_id'), 'ai_feedback', ['message_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema - drop AI feedback and metrics tables."""
    op.drop_index(op.f('ix_ai_feedback_message_id'), table_name='ai_feedback')
    op.drop_table('ai_feedback')
    op.drop_index(op.f('ix_ai_conversations_session_id'), table_name='ai_conversations')
    op.drop_table('ai_conversations')
    op.drop_index(op.f('ix_ai_metrics_created_at'), table_name='ai_metrics')
    op.drop_table('ai_metrics')
