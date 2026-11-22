"""
Add latest-pregnancy gestational_age_weeks variable to the workflow variable
catalogue, and mark patient.is_pregnant as computed (it is now derived from
pregnancy records instead of the stored patient.is_pregnant column)

Revision ID: 43_add_preg_ga_vars
Revises: 42_d23a53b9b7bf
"""

import time

import sqlalchemy as sa
from alembic import op

revision = "43_add_preg_ga_vars"
down_revision = "42_d23a53b9b7bf"
branch_labels = None
depends_on = None

TS = int(time.time())

GESTATIONAL_AGE_VARIABLE = {
    "id": "var-preg-latest-gestational-age-weeks",
    "tag": "pregnancies[latest].gestational_age_weeks",
    "description": "Gestational age in completed weeks of the latest ongoing pregnancy",
    "variable_type": "integer",
    "namespace": "pregnancies",
    "collection_name": "pregnancies",
    "field_path": '["gestational_age_weeks"]',
    "is_computed": True,
    "is_dynamic": False,
}

SET_IS_PREGNANT_COMPUTED = sa.text(
    "UPDATE workflow_variable_catalogue SET is_computed = :is_computed, "
    "last_edited = :last_edited WHERE id = 'var-patient-is-pregnant'"
)


def upgrade():
    bind = op.get_bind()

    exists = bind.execute(
        sa.text("SELECT 1 FROM workflow_variable_catalogue WHERE id = :id"),
        {"id": GESTATIONAL_AGE_VARIABLE["id"]},
    ).first()
    if exists is None:
        bind.execute(
            sa.text(
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
                    :date_created,
                    :last_edited
                )
                """
            ),
            {**GESTATIONAL_AGE_VARIABLE, "date_created": TS, "last_edited": TS},
        )

    bind.execute(SET_IS_PREGNANT_COMPUTED, {"is_computed": True, "last_edited": TS})


def downgrade():
    bind = op.get_bind()

    bind.execute(SET_IS_PREGNANT_COMPUTED, {"is_computed": False, "last_edited": TS})
    bind.execute(
        sa.text("DELETE FROM workflow_variable_catalogue WHERE id = :id"),
        {"id": GESTATIONAL_AGE_VARIABLE["id"]},
    )
