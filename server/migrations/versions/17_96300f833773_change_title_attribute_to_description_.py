"""
change 'title' attribute to 'description', remove 'last_edited_by' field in workflow instances, make 'form_id' nullable in workflow instance steps

Revision ID: 17_96300f833773
Revises: 16_0520a90e0303
Create Date: 2025-08-15 21:45:33.562795

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "17_96300f833773"
down_revision = "16_0520a90e0303"
branch_labels = None
depends_on = None


def upgrade():
    # WorkflowInstance changes

    # Check if the constraint exists before trying to drop it
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    foreign_keys = inspector.get_foreign_keys("workflow_instance")
    fk_names = [fk["name"] for fk in foreign_keys]

    if "fk_workflow_instance_last_edited_by_user" in fk_names:
        op.drop_constraint(
            "fk_workflow_instance_last_edited_by_user",
            "workflow_instance",
            type_="foreignkey",
        )

    # Check if column exists before trying to drop it
    columns = inspector.get_columns("workflow_instance")
    column_names = [col["name"] for col in columns]

    if "last_edited_by" in column_names:
        op.drop_column("workflow_instance", "last_edited_by")

    if "description" not in column_names:
        op.add_column(
            "workflow_instance", sa.Column("description", sa.Text(), nullable=False)
        )

    if "title" in column_names:
        op.drop_column("workflow_instance", "title")

    # WorkflowInstanceStep changes
    step_columns = inspector.get_columns("workflow_instance_step")
    step_column_names = [col["name"] for col in step_columns]

    if "description" not in step_column_names:
        op.add_column(
            "workflow_instance_step",
            sa.Column("description", sa.Text(), nullable=False),
        )

    # Check current foreign key setup for form_id
    step_foreign_keys = inspector.get_foreign_keys("workflow_instance_step")
    form_fk_exists = any(
        fk["name"] == "fk_workflow_instance_step_form_id_form"
        for fk in step_foreign_keys
    )

    # Make form_id nullable
    op.alter_column(
        "workflow_instance_step",
        "form_id",
        existing_type=mysql.VARCHAR(length=50),
        nullable=True,
    )

    # Update foreign key constraint to SET NULL
    if form_fk_exists:
        op.drop_constraint(
            "fk_workflow_instance_step_form_id_form",
            "workflow_instance_step",
            type_="foreignkey",
        )

    op.create_foreign_key(
        op.f("fk_workflow_instance_step_form_id_form"),
        "workflow_instance_step",
        "form",
        ["form_id"],
        ["id"],
        ondelete="SET NULL",
    )

    if "title" in step_column_names:
        op.drop_column("workflow_instance_step", "title")


def downgrade():
    op.add_column(
        "workflow_instance_step", sa.Column("title", mysql.TEXT(), nullable=False)
    )
    op.drop_constraint(
        op.f("fk_workflow_instance_step_form_id_form"),
        "workflow_instance_step",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "fk_workflow_instance_step_form_id_form",
        "workflow_instance_step",
        "form",
        ["form_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.alter_column(
        "workflow_instance_step",
        "form_id",
        existing_type=mysql.VARCHAR(length=50),
        nullable=False,
    )
    op.drop_column("workflow_instance_step", "description")

    # WorkflowInstance rollback
    op.add_column("workflow_instance", sa.Column("title", mysql.TEXT(), nullable=False))
    op.drop_column("workflow_instance", "description")
    op.add_column(
        "workflow_instance",
        sa.Column(
            "last_edited_by",
            mysql.VARCHAR(length=50),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.create_foreign_key(
        "fk_workflow_instance_last_edited_by_user",
        "workflow_instance",
        "user",
        ["last_edited_by"],
        ["id"],
        ondelete="SET NULL",
    )
