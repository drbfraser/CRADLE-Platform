"""
Add vital traffic light colour and arrow variables to workflow catalog

Revision ID: 38_995ebb85761c
Revises: 37_seed_referral_assessment_vars
Create Date: 2026-10-26 13:46

"""

import time

import sqlalchemy as sa
from alembic import op

revision = "38_995ebb85761c"
down_revision = "37_seed_referral_assessment_vars"
branch_labels = None
depends_on = None

TS = int(time.time())

TRAFFIC_VARIABLES = [
    {
        "id": "var-vitals-latest-traffic-color",
        "tag": "vitals[latest].traffic_color",
        "description": "Traffic light color from the most recent vital record",
        "variable_type": "string",
        "namespace": "vitals",
        "collection_name": "vitals",
        "field_path": '["traffic_color"]',
        "is_computed": False,
        "is_dynamic": False,
    },
    {
        "id": "var-vitals-latest-traffic-arrow",
        "tag": "vitals[latest].traffic_arrow",
        "description": "Traffic light arrow from the most recent vital record",
        "variable_type": "string",
        "namespace": "vitals",
        "collection_name": "vitals",
        "field_path": '["traffic_arrow"]',
        "is_computed": False,
        "is_dynamic": False,
    },
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
    )

    for v in TRAFFIC_VARIABLES:
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

    for v in TRAFFIC_VARIABLES:
        bind.execute(
            sa.text("DELETE FROM workflow_variable_catalogue WHERE id = :id"),
            {"id": v["id"]},
        )
