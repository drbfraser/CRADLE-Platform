"""
Add pregnancy_id to workflow_instance

Revision ID: 33_4b4c2f599782
Revises: 32_613305db5978
Create Date: 2026-08-07 05:20:33.886014

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "33_4b4c2f599782"
down_revision = "32_613305db5978"
branch_labels = None
depends_on = None


def upgrade():
    # Pins a workflow instance to whatever pregnancy was active when it was
    # created, so `{{pregnancies[latest]...}}`-style description tokens stay
    # tied to that pregnancy even if the patient later starts a new one.
    op.add_column(
        "workflow_instance", sa.Column("pregnancy_id", sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        op.f("fk_workflow_instance_pregnancy_id_pregnancy"),
        "workflow_instance",
        "pregnancy",
        ["pregnancy_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade():
    op.drop_constraint(
        op.f("fk_workflow_instance_pregnancy_id_pregnancy"),
        "workflow_instance",
        type_="foreignkey",
    )
    op.drop_column("workflow_instance", "pregnancy_id")
