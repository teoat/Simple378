"""Add authentication tables for MFA, WebAuthn, and OAuth

Revision ID: auth_enhancement_001
Revises: 
Create Date: 2025-12-05 02:26:13.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'auth_enhancement_001'
down_revision = None  # Update this to your latest migration ID
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create user_mfa table
    op.create_table(
        'user_mfa',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('method', sa.String(), nullable=False),
        sa.Column('secret', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('enabled', sa.Boolean(), default=False, nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    
    # Create mfa_backup_codes table
    op.create_table(
        'mfa_backup_codes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('code_hash', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('used', sa.Boolean(), default=False, nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    
    # Create webauthn_credentials table
    op.create_table(
        'webauthn_credentials',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('credential_id', sa.String(), unique=True, nullable=False, index=True),
        sa.Column('public_key', sa.String(), nullable=False),
        sa.Column('sign_count', sa.Integer(), default=0, nullable=False),
        sa.Column('device_type', sa.String(), nullable=True),
        sa.Column('transports', postgresql.JSON(), default=list),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('last_used', sa.DateTime(timezone=True), nullable=True),
    )
    
    # Create oauth_accounts table
    op.create_table(
        'oauth_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('provider', sa.String(), nullable=False, index=True),
        sa.Column('provider_user_id', sa.String(), nullable=False),
        sa.Column('access_token', sa.Text(), nullable=True),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('token_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    
    # Create indexes
    op.create_index('idx_user_mfa_user_method', 'user_mfa', ['user_id', 'method'])
    op.create_index('idx_oauth_provider_user', 'oauth_accounts', ['provider', 'provider_user_id'], unique=True)
    
    # Add email_verified column to users table if it doesn't exist
    # This is used by OAuth providers
    try:
        op.add_column('users', sa.Column('email_verified', sa.Boolean(), default=False, server_default='false'))
    except Exception:
        pass  # Column may already exist


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_oauth_provider_user', table_name='oauth_accounts')
    op.drop_index('idx_user_mfa_user_method', table_name='user_mfa')
    
    # Drop tables
    op.drop_table('oauth_accounts')
    op.drop_table('webauthn_credentials')
    op.drop_table('mfa_backup_codes')
    op.drop_table('user_mfa')
    
    # Remove email_verified column
    try:
        op.drop_column('users', 'email_verified')
    except Exception:
        pass
