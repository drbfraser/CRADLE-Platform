"""
Seed workflow variable catalogue with basic patient variables.

This migration intentionally seeds a curated "basic" set (e.g. patient.age)
and clears any previous seed rows so `/api/workflow/variables` stays clean.

Revision ID: 28_seed_basic_workflow_variables
Revises: 27_f4c1e2b8a9d0
Create Date: 2026-03-19
"""

import time

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision = "28_seed_basic_workflow_variables"
down_revision = "27_f4c1e2b8a9d0"
branch_labels = None
depends_on = None

TS = int(time.time())

# Fixed IDs so downgrade can remove rows deterministically.
BASIC_VARIABLES = [
    {
        "id": "var-patient-id",
        "tag": "patient.id",
        "description": "Patient identifier",
        "variable_type": "string",
        "namespace": "patient",
        "collection_name": None,
        "field_path": '["id"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-patient-name",
        "tag": "patient.name",
        "description": "Patient full name",
        "variable_type": "string",
        "namespace": "patient",
        "collection_name": None,
        "field_path": '["name"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-patient-sex",
        "tag": "patient.sex",
        "description": "Patient sex (e.g. FEMALE, MALE)",
        "variable_type": "string",
        "namespace": "patient",
        "collection_name": None,
        "field_path": '["sex"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-patient-date-of-birth",
        "tag": "patient.date_of_birth",
        "description": "Patient date of birth (YYYY-MM-DD)",
        "variable_type": "date",
        "namespace": "patient",
        "collection_name": None,
        "field_path": '["date_of_birth"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-patient-is-exact-dob",
        "tag": "patient.is_exact_date_of_birth",
        "description": "Whether date of birth is exact",
        "variable_type": "boolean",
        "namespace": "patient",
        "collection_name": None,
        "field_path": '["is_exact_date_of_birth"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-patient-age",
        "tag": "patient.age",
        "description": "Patient age (computed from date_of_birth)",
        "variable_type": "integer",
        "namespace": "patient",
        "collection_name": None,
        "field_path": '["age"]',
        "is_computed": True,
        "is_dynamic": False,
    },
    {
        "id": "var-patient-is-pregnant",
        "tag": "patient.is_pregnant",
        "description": "Whether the patient is currently pregnant",
        "variable_type": "boolean",
        "namespace": "patient",
        "collection_name": None,
        "field_path": '["is_pregnant"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-patient-household-number",
        "tag": "patient.household_number",
        "description": "Patient household number",
        "variable_type": "string",
        "namespace": "patient",
        "collection_name": None,
        "field_path": '["household_number"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-patient-zone",
        "tag": "patient.zone",
        "description": "Patient zone",
        "variable_type": "string",
        "namespace": "patient",
        "collection_name": None,
        "field_path": '["zone"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-patient-village-number",
        "tag": "patient.village_number",
        "description": "Patient village number",
        "variable_type": "string",
        "namespace": "patient",
        "collection_name": None,
        "field_path": '["village_number"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-patient-is-archived",
        "tag": "patient.is_archived",
        "description": "Whether the patient is archived",
        "variable_type": "boolean",
        "namespace": "patient",
        "collection_name": None,
        "field_path": '["is_archived"]',
        "is_computed": False,
        "is_dynamic": False,
    },
]


def _ensure_workflow_variable_catalogue_collection_name() -> None:
    """
    Older DBs may have ``workflow_variable_catalogue`` without ``collection_name``
    (e.g. an earlier revision of migration 25). Seed INSERTs require this column.
    """
    bind = op.get_bind()
    inspector = inspect(bind)
    cols = [
        c["name"] for c in inspector.get_columns("workflow_variable_catalogue")
    ]
    if "collection_name" not in cols:
        op.add_column(
            "workflow_variable_catalogue",
            sa.Column("collection_name", sa.String(length=100), nullable=True),
        )


def upgrade():
    _ensure_workflow_variable_catalogue_collection_name()

    bind = op.get_bind()

    # Ensure endpoint stays "clean": only the curated basic variables exist.
    bind.execute(sa.text("DELETE FROM workflow_variable_catalogue"))

    insert_stmt = sa.text(
        """
        INSERT INTO workflow_variable_catalogue
        (id, tag, description, variable_type, namespace, collection_name, field_path, is_computed, is_dynamic, date_created, last_edited)
        VALUES
        (:id, :tag, :description, :variable_type, :namespace, :collection_name, :field_path, :is_computed, :is_dynamic, :date_created, :last_edited)
        """
    )

    for v in BASIC_VARIABLES:
        bind.execute(
            insert_stmt,
            {
                **v,
                "date_created": TS,
                "last_edited": TS,
            },
        )


def downgrade():
    bind = op.get_bind()
    # Revert to an empty catalogue (this migration's responsibility is seeding only).
    bind.execute(sa.text("DELETE FROM workflow_variable_catalogue"))
