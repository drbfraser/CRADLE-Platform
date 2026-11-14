"""
Add patient allergy, urine test, pregnancy, referral, medical/drug history
and collection size variables to the workflow variable catalogue

Revision ID: 41_seed_additional_wf_vars
Revises: 40_add_patient_number
Create Date: 2026-11-03

"""

import json
import time

import sqlalchemy as sa
from alembic import op

revision = "41_seed_additional_wf_vars"
down_revision = "40_add_patient_number"
branch_labels = None
depends_on = None

TS = int(time.time())

URINE_TEST_VALUES = ["NAD", "+", "++", "+++"]


def _var(
    id,
    tag,
    description,
    variable_type,
    namespace,
    field_path,
    collection_name=None,
    is_computed=False,
    allowed_values=None,
):
    return {
        "id": id,
        "tag": tag,
        "description": description,
        "variable_type": variable_type,
        "namespace": namespace,
        "collection_name": collection_name,
        "field_path": field_path,
        "is_computed": is_computed,
        "is_dynamic": False,
        "allowed_values": (
            json.dumps(allowed_values) if allowed_values is not None else None
        ),
    }


NEW_VARIABLES = [
    # Patient
    _var(
        "var-patient-allergy",
        "patient.allergy",
        "Patient allergies",
        "string",
        "patient",
        '["allergy"]',
    ),
    # Urine tests
    *[
        _var(
            f"var-vitals-latest-urine-{field}",
            f"vitals[latest].urine_test.{field}",
            f"Latest urine test result: {field}",
            "string",
            "vitals",
            f'["urine_test", "{field}"]',
            "vitals",
            allowed_values=URINE_TEST_VALUES,
        )
        for field in ["leukocytes", "nitrites", "glucose", "protein", "blood"]
    ],
    # Pregnancies
    _var(
        "var-pregnancies-size",
        "pregnancies.size",
        "Number of pregnancy records",
        "integer",
        "pregnancies",
        '["size"]',
        "pregnancies",
        is_computed=True,
    ),
    _var(
        "var-preg-latest-end",
        "pregnancies[latest].end_date",
        "End date of the latest pregnancy",
        "integer",
        "pregnancies",
        '["end_date"]',
        "pregnancies",
    ),
    _var(
        "var-preg-latest-outcome",
        "pregnancies[latest].outcome",
        "Outcome of the latest pregnancy",
        "string",
        "pregnancies",
        '["outcome"]',
        "pregnancies",
    ),
    # Referrals
    _var(
        "var-referrals-size",
        "referrals.size",
        "Number of referrals",
        "integer",
        "referrals",
        '["size"]',
        "referrals",
        is_computed=True,
    ),
    _var(
        "var-referrals-latest-health-facility",
        "referrals[latest].health_facility_name",
        "Health facility the latest referral was sent to",
        "string",
        "referrals",
        '["health_facility_name"]',
        "referrals",
    ),
    _var(
        "var-referrals-latest-comment",
        "referrals[latest].comment",
        "Comment on the latest referral",
        "string",
        "referrals",
        '["comment"]',
        "referrals",
    ),
    # Medical and drug history (latest record is the current history)
    _var(
        "var-medical-records-latest-history",
        "medical_records[latest].medical_history",
        "Patient's current medical history",
        "string",
        "medical_records",
        '["medical_history"]',
        "medical_records",
    ),
    _var(
        "var-medical-records-latest-date-created",
        "medical_records[latest].date_created",
        "Date the medical history was last updated",
        "integer",
        "medical_records",
        '["date_created"]',
        "medical_records",
    ),
    _var(
        "var-drug-records-latest-history",
        "drug_records[latest].drug_history",
        "Patient's current drug history",
        "string",
        "drug_records",
        '["drug_history"]',
        "drug_records",
    ),
    _var(
        "var-drug-records-latest-date-created",
        "drug_records[latest].date_created",
        "Date the drug history was last updated",
        "integer",
        "drug_records",
        '["date_created"]',
        "drug_records",
    ),
    # Workflows
    _var(
        "var-all-wf-size",
        "all_wf.size",
        "Number of workflows for the patient",
        "integer",
        "all_wf",
        '["size"]',
        "all_wf",
        is_computed=True,
    ),
]


def upgrade():
    bind = op.get_bind()

    insert_stmt = sa.text(
        """
        INSERT INTO workflow_variable_catalogue
        (
            id,
            tag,
            description,
            variable_type,
            namespace,
            collection_name,
            field_path,
            is_computed,
            is_dynamic,
            allowed_values,
            date_created,
            last_edited
        )
        VALUES
        (
            :id,
            :tag,
            :description,
            :variable_type,
            :namespace,
            :collection_name,
            :field_path,
            :is_computed,
            :is_dynamic,
            :allowed_values,
            :date_created,
            :last_edited
        )
        """
    )

    for v in NEW_VARIABLES:
        bind.execute(
            insert_stmt,
            {**v, "date_created": TS, "last_edited": TS},
        )


def downgrade():
    bind = op.get_bind()

    for v in NEW_VARIABLES:
        bind.execute(
            sa.text("DELETE FROM workflow_variable_catalogue WHERE id = :id"),
            {"id": v["id"]},
        )
