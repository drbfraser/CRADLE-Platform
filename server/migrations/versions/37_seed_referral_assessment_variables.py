"""
Seed workflow variable catalogue with referral and assessment variables.

Now that the `referrals` and `assessments` collections resolve real data,
expose their `[latest]` fields so `/api/workflow/variables` can discover them
for rule building.

Revision ID: 37_seed_referral_assessment_vars
Revises: 36_e4a517d9d610
"""

import time

import sqlalchemy as sa
from alembic import op

revision = "37_seed_referral_assessment_vars"
down_revision = "36_e4a517d9d610"
branch_labels = None
depends_on = None

TS = int(time.time())

REFERRAL_ASSESSMENT_VARIABLES = [
    {
        "id": "var-referrals-latest-date-referred",
        "tag": "referrals[latest].date_referred",
        "description": "Date of the latest referral",
        "variable_type": "integer",
        "namespace": "referrals",
        "collection_name": "referrals",
        "field_path": '["date_referred"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-referrals-latest-is-assessed",
        "tag": "referrals[latest].is_assessed",
        "description": "Whether the latest referral has been assessed",
        "variable_type": "boolean",
        "namespace": "referrals",
        "collection_name": "referrals",
        "field_path": '["is_assessed"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-referrals-latest-is-cancelled",
        "tag": "referrals[latest].is_cancelled",
        "description": "Whether the latest referral has been cancelled",
        "variable_type": "boolean",
        "namespace": "referrals",
        "collection_name": "referrals",
        "field_path": '["is_cancelled"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-referrals-latest-not-attended",
        "tag": "referrals[latest].not_attended",
        "description": "Whether the patient did not attend the latest referral",
        "variable_type": "boolean",
        "namespace": "referrals",
        "collection_name": "referrals",
        "field_path": '["not_attended"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-assessments-latest-follow-up-needed",
        "tag": "assessments[latest].follow_up_needed",
        "description": "Whether the latest assessment needs follow-up",
        "variable_type": "boolean",
        "namespace": "assessments",
        "collection_name": "assessments",
        "field_path": '["follow_up_needed"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-assessments-latest-date-assessed",
        "tag": "assessments[latest].date_assessed",
        "description": "Date of the latest assessment",
        "variable_type": "integer",
        "namespace": "assessments",
        "collection_name": "assessments",
        "field_path": '["date_assessed"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-assessments-latest-diagnosis",
        "tag": "assessments[latest].diagnosis",
        "description": "Latest diagnosis",
        "variable_type": "string",
        "namespace": "assessments",
        "collection_name": "assessments",
        "field_path": '["diagnosis"]',
        "is_computed": False,
        "is_dynamic": False,
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

    for v in REFERRAL_ASSESSMENT_VARIABLES:
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
    for v in REFERRAL_ASSESSMENT_VARIABLES:
        bind.execute(
            sa.text("DELETE FROM workflow_variable_catalogue WHERE id = :id"),
            {"id": v["id"]},
        )
