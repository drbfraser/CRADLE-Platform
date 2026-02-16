"""Drop name_string_id from workflow_template

This is a cleanup migration for environments that previously ran a
now-deleted migration which added name_string_id to workflow_template.
On fresh databases, the column never existed, so this is a no-op.

Revision ID: 27_drop_name_string_id
Revises: 013cf68cd68c
Create Date: 2026-02-16 09:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '27_drop_name_string_id'
down_revision = '013cf68cd68c'
branch_labels = None
depends_on = None


def _column_exists(table, column):
    """Check if a column exists in a table."""
    bind = op.get_bind()
    result = bind.execute(
        sa.text(
            "SELECT COUNT(*) FROM information_schema.COLUMNS "
            "WHERE TABLE_SCHEMA = DATABASE() "
            f"AND TABLE_NAME = '{table}' "
            f"AND COLUMN_NAME = '{column}'"
        )
    )
    return result.scalar() > 0


def upgrade():
    if _column_exists('workflow_template', 'name_string_id'):
        op.drop_index(
            op.f('ix_workflow_template_name_string_id'),
            table_name='workflow_template',
        )
        op.drop_column('workflow_template', 'name_string_id')


def downgrade():
    if not _column_exists('workflow_template', 'name_string_id'):
        op.add_column(
            'workflow_template',
            sa.Column('name_string_id', sa.String(length=50), nullable=True),
        )
        op.create_index(
            op.f('ix_workflow_template_name_string_id'),
            'workflow_template',
            ['name_string_id'],
            unique=False,
        )
