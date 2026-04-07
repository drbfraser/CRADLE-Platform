"""
Catalogue type fixes and additional documented variables.

- ``local-date-time`` is a full ISO timestamp (string), not a calendar date only.
- Adds representative collection / workflow variables for discovery.

Revision ID: 30_workflow_variable_catalogue_types
Revises: 29_seed_system_context_variables
Create Date: 2026-04-05
"""

import time

import sqlalchemy as sa
from alembic import op

revision = "30_phase7_workflow_variable_catalogue_types"
down_revision = "29_seed_system_context_variables"
branch_labels = None
depends_on = None

TS = int(time.time())

# Fixed IDs for downgrade.
PHASE7_VARIABLES = [
    {
        "id": "var-vitals-size",
        "tag": "vitals.size",
        "description": "Number of vital (reading) records for the patient",
        "variable_type": "integer",
        "namespace": "vitals",
        "collection_name": "vitals",
        "field_path": '["size"]',
        "is_computed": True,
        "is_dynamic": False,
    },
    {
        "id": "var-vitals-latest-sbp",
        "tag": "vitals[latest].systolic_blood_pressure",
        "description": "Systolic blood pressure from the most recent vital",
        "variable_type": "integer",
        "namespace": "vitals",
        "collection_name": "vitals",
        "field_path": '["systolic_blood_pressure"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-vitals-latest-dbp",
        "tag": "vitals[latest].diastolic_blood_pressure",
        "description": "Diastolic blood pressure from the most recent vital",
        "variable_type": "integer",
        "namespace": "vitals",
        "collection_name": "vitals",
        "field_path": '["diastolic_blood_pressure"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-vitals-latest-hr",
        "tag": "vitals[latest].heart_rate",
        "description": "Heart rate from the most recent vital",
        "variable_type": "integer",
        "namespace": "vitals",
        "collection_name": "vitals",
        "field_path": '["heart_rate"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-vitals-latest-date-taken",
        "tag": "vitals[latest].date_taken",
        "description": "Unix timestamp when the most recent vital was taken",
        "variable_type": "integer",
        "namespace": "vitals",
        "collection_name": "vitals",
        "field_path": '["date_taken"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-preg-latest-start",
        "tag": "pregnancies[latest].start_date",
        "description": "Start date (epoch seconds) of the most recent pregnancy",
        "variable_type": "integer",
        "namespace": "pregnancies",
        "collection_name": "pregnancies",
        "field_path": '["start_date"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-all-wf-latest-status",
        "tag": "all_wf[latest].status",
        "description": "Status of the most recent workflow instance for the patient",
        "variable_type": "string",
        "namespace": "all_wf",
        "collection_name": "all_wf",
        "field_path": '["status"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-wf-info-status",
        "tag": "wf.info.status",
        "description": "Status of the active workflow instance",
        "variable_type": "string",
        "namespace": "wf",
        "collection_name": None,
        "field_path": '["info", "status"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-wf-info-start",
        "tag": "wf.info.start_date",
        "description": "Start date (epoch) of the active workflow instance",
        "variable_type": "integer",
        "namespace": "wf",
        "collection_name": None,
        "field_path": '["info", "start_date"]',
        "is_computed": False,
        "is_dynamic": False,
    },
]


def upgrade():
    bind = op.get_bind()

    bind.execute(
        sa.text(
            """
            UPDATE workflow_variable_catalogue
            SET variable_type = 'string', last_edited = :ts
            WHERE tag = 'local-date-time'
            """
        ),
        {"ts": TS},
    )

    insert_stmt = sa.text(
        """
        INSERT INTO workflow_variable_catalogue
        (id, tag, description, variable_type, namespace, collection_name, field_path, is_computed, is_dynamic, date_created, last_edited)
        VALUES
        (:id, :tag, :description, :variable_type, :namespace, :collection_name, :field_path, :is_computed, :is_dynamic, :date_created, :last_edited)
        """
    )

    for v in PHASE7_VARIABLES:
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
    for v in PHASE7_VARIABLES:
        bind.execute(
            sa.text("DELETE FROM workflow_variable_catalogue WHERE id = :id"),
            {"id": v["id"]},
        )
    bind.execute(
        sa.text(
            """
            UPDATE workflow_variable_catalogue
            SET variable_type = 'date', last_edited = :ts
            WHERE tag = 'local-date-time'
            """
        ),
        {"ts": TS},
    )
