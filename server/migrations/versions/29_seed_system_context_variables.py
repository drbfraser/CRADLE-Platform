"""
Seed workflow variable catalogue with system context variables.

This migration intentionally appends system context variable tags (e.g.
`local-date`) to the existing catalogue (seeded in migration 28) so
`/api/workflow/variables` can discover them for rule building.
"""

import time

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "29_seed_system_context_variables"
down_revision = "28_seed_basic_workflow_variables"
branch_labels = None
depends_on = None

TS = int(time.time())

# Fixed IDs so downgrade can remove rows deterministically.
SYSTEM_CONTEXT_VARIABLES = [
    {
        "id": "var-local-date",
        "tag": "local-date",
        "description": "Local date (YYYY-MM-DD)",
        "variable_type": "date",
        "namespace": "local-date",
        "collection_name": None,
        "field_path": None,
        "is_computed": False,
        "is_dynamic": True,
    },
    {
        "id": "var-local-time",
        "tag": "local-time",
        "description": "Local time (ISO time)",
        "variable_type": "string",
        "namespace": "local-time",
        "collection_name": None,
        "field_path": None,
        "is_computed": False,
        "is_dynamic": True,
    },
    {
        "id": "var-local-date-time",
        "tag": "local-date-time",
        "description": "Local date-time (ISO 8601)",
        "variable_type": "date",
        "namespace": "local-date-time",
        "collection_name": None,
        "field_path": None,
        "is_computed": False,
        "is_dynamic": True,
    },
    {
        "id": "var-current-user-id",
        "tag": "current-user.id",
        "description": "Current user ID (from JWT)",
        "variable_type": "integer",
        "namespace": "current-user",
        "collection_name": None,
        "field_path": '["id"]',
        "is_computed": False,
        "is_dynamic": True,
    },
    {
        "id": "var-current-user-name",
        "tag": "current-user.name",
        "description": "Current user name (from JWT)",
        "variable_type": "string",
        "namespace": "current-user",
        "collection_name": None,
        "field_path": '["name"]',
        "is_computed": False,
        "is_dynamic": True,
    },
    {
        "id": "var-current-user-username",
        "tag": "current-user.username",
        "description": "Current username (from JWT)",
        "variable_type": "string",
        "namespace": "current-user",
        "collection_name": None,
        "field_path": '["username"]',
        "is_computed": False,
        "is_dynamic": True,
    },
    {
        "id": "var-current-user-email",
        "tag": "current-user.email",
        "description": "Current user email (from JWT)",
        "variable_type": "string",
        "namespace": "current-user",
        "collection_name": None,
        "field_path": '["email"]',
        "is_computed": False,
        "is_dynamic": True,
    },
    {
        "id": "var-current-user-health-facility-name",
        "tag": "current-user.health_facility_name",
        "description": "Current user's health facility name (from JWT)",
        "variable_type": "string",
        "namespace": "current-user",
        "collection_name": None,
        "field_path": '["health_facility_name"]',
        "is_computed": False,
        "is_dynamic": True,
    },
    {
        "id": "var-current-user-role",
        "tag": "current-user.role",
        "description": "Current user role (from JWT)",
        "variable_type": "string",
        "namespace": "current-user",
        "collection_name": None,
        "field_path": '["role"]',
        "is_computed": False,
        "is_dynamic": True,
    },
]


def upgrade():
    insert_stmt = sa.text(
        """
        INSERT INTO workflow_variable_catalogue
        (id, tag, description, variable_type, namespace, collection_name, field_path, is_computed, is_dynamic, date_created, last_edited)
        VALUES
        (:id, :tag, :description, :variable_type, :namespace, :collection_name, :field_path, :is_computed, :is_dynamic, :date_created, :last_edited)
        """
    )

    for v in SYSTEM_CONTEXT_VARIABLES:
        op.get_bind().execute(
            insert_stmt,
            {
                **v,
                "date_created": TS,
                "last_edited": TS,
            },
        )


def downgrade():
    bind = op.get_bind()
    for v in SYSTEM_CONTEXT_VARIABLES:
        bind.execute(
            sa.text("DELETE FROM workflow_variable_catalogue WHERE tag = :tag"),
            {"tag": v["tag"]},
        )
