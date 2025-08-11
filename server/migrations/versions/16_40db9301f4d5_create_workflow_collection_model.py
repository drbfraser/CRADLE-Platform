"""
Create workflow collection model

Revision ID: 40db9301f4d5
Revises: 15_bf923c5cb3c3
Create Date: 2025-08-07 20:43:40.797407

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "16_40db9301f4d5"
down_revision = "15_bf923c5cb3c3"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "workflow_collection",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("date_created", sa.BigInteger(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_workflow_collection")),
    )

    op.add_column("workflow_classification", sa.Column("collection_id", sa.String(length=50), nullable=True))

    op.create_foreign_key(
        op.f("fk_workflow_classification_collection_id_workflow_collection"),
        "workflow_classification",
        "workflow_collection",
        ["collection_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade():

    op.drop_constraint(
        op.f("fk_workflow_classification_collection_id_workflow_collection"),
        "workflow_classification",
        type_="foreignkey",
    )

    op.drop_column("workflow_classification", "collection_id")

    op.drop_table("workflow_collection")
