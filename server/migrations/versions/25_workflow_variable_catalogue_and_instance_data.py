"""
workflow_variable_catalogue and workflow_instance_data tables

Revision ID: 25_workflow_vars
Revises: 24_f277265972d3
Create Date: 2025-02-11

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "25_workflow_vars"
down_revision = "24_f277265972d3"
branch_labels = None
depends_on = None

# Enum names for MySQL (must match what SQLAlchemy generates for db.Enum(EnumClass))
WORKFLOW_VARIABLE_TYPE_ENUM = sa.Enum(
    "integer",
    "double",
    "string",
    "date",
    "boolean",
    "container",
    name="workflowvariabletypeenum",
)
WORKFLOW_INSTANCE_DATA_FIELD_TYPE_ENUM = sa.Enum(
    "integer",
    "double",
    "string",
    "date",
    "boolean",
    name="workflowinstancedatafieldtypeenum",
)


def upgrade():
    WORKFLOW_VARIABLE_TYPE_ENUM.create(op.get_bind(), checkfirst=True)
    WORKFLOW_INSTANCE_DATA_FIELD_TYPE_ENUM.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "workflow_variable_catalogue",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("tag", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "variable_type",
            WORKFLOW_VARIABLE_TYPE_ENUM,
            nullable=False,
        ),
        sa.Column("namespace", sa.String(length=100), nullable=True),
        sa.Column("container_name", sa.String(length=100), nullable=True),
        sa.Column("field_path", sa.Text(), nullable=True),
        sa.Column("is_computed", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("is_dynamic", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("date_created", sa.BigInteger(), nullable=False),
        sa.Column("last_edited", sa.BigInteger(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_workflow_variable_catalogue")),
    )
    op.create_index(
        op.f("ix_workflow_variable_catalogue_namespace"),
        "workflow_variable_catalogue",
        ["namespace"],
        unique=False,
    )
    op.create_index(
        op.f("ix_workflow_variable_catalogue_tag"),
        "workflow_variable_catalogue",
        ["tag"],
        unique=True,
    )

    op.create_table(
        "workflow_instance_data",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("workflow_instance_id", sa.String(length=50), nullable=False),
        sa.Column("field_tag", sa.String(length=200), nullable=False),
        sa.Column("field_value", sa.Text(), nullable=True),
        sa.Column(
            "field_type",
            WORKFLOW_INSTANCE_DATA_FIELD_TYPE_ENUM,
            nullable=False,
        ),
        sa.Column("date_created", sa.BigInteger(), nullable=False),
        sa.Column("last_edited", sa.BigInteger(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_workflow_instance_data")),
        sa.ForeignKeyConstraint(
            ["workflow_instance_id"],
            ["workflow_instance.id"],
            name=op.f("fk_workflow_instance_data_workflow_instance_id_workflow_instance"),
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "workflow_instance_id",
            "field_tag",
            name="unique_instance_field",
        ),
    )
    op.create_index(
        op.f("ix_workflow_instance_data_field_tag"),
        "workflow_instance_data",
        ["field_tag"],
        unique=False,
    )
    op.create_index(
        op.f("ix_workflow_instance_data_workflow_instance_id"),
        "workflow_instance_data",
        ["workflow_instance_id"],
        unique=False,
    )


def downgrade():
    op.drop_index(
        op.f("ix_workflow_instance_data_workflow_instance_id"),
        table_name="workflow_instance_data",
    )
    op.drop_index(
        op.f("ix_workflow_instance_data_field_tag"),
        table_name="workflow_instance_data",
    )
    op.drop_table("workflow_instance_data")

    op.drop_index(
        op.f("ix_workflow_variable_catalogue_tag"),
        table_name="workflow_variable_catalogue",
    )
    op.drop_index(
        op.f("ix_workflow_variable_catalogue_namespace"),
        table_name="workflow_variable_catalogue",
    )
    op.drop_table("workflow_variable_catalogue")

    WORKFLOW_INSTANCE_DATA_FIELD_TYPE_ENUM.drop(op.get_bind(), checkfirst=True)
    WORKFLOW_VARIABLE_TYPE_ENUM.drop(op.get_bind(), checkfirst=True)
