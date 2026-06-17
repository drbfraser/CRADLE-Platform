"""
Switch workflow_template_step.form_id foreign key to form_template_v2.

Revision ID: 31_wf_step_form_fk_v2
Revises: 30_wf_var_catalogue_types
Create Date: 2026-04-17
"""

import sqlalchemy as sa
from alembic import op

revision = "31_wf_step_form_fk_v2"
down_revision = "30_wf_var_catalogue_types"
branch_labels = None
depends_on = None

OLD_FK_NAME = "fk_workflow_template_step_form_id_form_template"
NEW_FK_NAME = "fk_workflow_template_step_form_id_form_template_v2"


def _fk_exists(table: str, fk_name: str) -> bool:
    bind = op.get_bind()
    result = bind.execute(
        sa.text(
            "SELECT COUNT(*) "
            "FROM information_schema.TABLE_CONSTRAINTS "
            "WHERE TABLE_SCHEMA = DATABASE() "
            "AND TABLE_NAME = :table "
            "AND CONSTRAINT_TYPE = 'FOREIGN KEY' "
            "AND CONSTRAINT_NAME = :fk_name"
        ),
        {"table": table, "fk_name": fk_name},
    )
    return result.scalar() > 0


def upgrade():
    bind = op.get_bind()

    if _fk_exists("workflow_template_step", OLD_FK_NAME):
        op.drop_constraint(OLD_FK_NAME, "workflow_template_step", type_="foreignkey")

    # Try to migrate legacy V1 workflow step form references to V2 by matching
    # form classification name against the latest non-archived V2 template.
    bind.execute(
        sa.text(
            """
            UPDATE workflow_template_step wts
            JOIN form_template ft ON ft.id = wts.form_id
            JOIN form_classification fc ON fc.id = ft.form_classification_id
            LEFT JOIN form_template_v2 ft2 ON ft2.id = (
                SELECT ft2_inner.id
                FROM form_template_v2 ft2_inner
                JOIN form_classification_v2 fc2_inner
                    ON fc2_inner.id = ft2_inner.form_classification_id
                JOIN lang_version_v2 lv_inner
                    ON lv_inner.string_id = fc2_inner.name_string_id
                WHERE LOWER(lv_inner.lang) = 'english'
                  AND lv_inner.text = fc.name
                  AND ft2_inner.archived = 0
                ORDER BY ft2_inner.version DESC, ft2_inner.date_created DESC
                LIMIT 1
            )
            SET wts.form_id = ft2.id
            WHERE wts.form_id IS NOT NULL
            """
        )
    )

    # Any remaining IDs that do not exist in V2 are nulled before applying FK.
    bind.execute(
        sa.text(
            """
            UPDATE workflow_template_step wts
            LEFT JOIN form_template_v2 ft2 ON ft2.id = wts.form_id
            SET wts.form_id = NULL
            WHERE wts.form_id IS NOT NULL
              AND ft2.id IS NULL
            """
        )
    )

    if not _fk_exists("workflow_template_step", NEW_FK_NAME):
        op.create_foreign_key(
            NEW_FK_NAME,
            "workflow_template_step",
            "form_template_v2",
            ["form_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade():
    bind = op.get_bind()

    if _fk_exists("workflow_template_step", NEW_FK_NAME):
        op.drop_constraint(NEW_FK_NAME, "workflow_template_step", type_="foreignkey")

    # Reverting to V1 FK requires removing IDs that only exist in V2.
    bind.execute(
        sa.text(
            """
            UPDATE workflow_template_step wts
            LEFT JOIN form_template ft ON ft.id = wts.form_id
            SET wts.form_id = NULL
            WHERE wts.form_id IS NOT NULL
              AND ft.id IS NULL
            """
        )
    )

    if not _fk_exists("workflow_template_step", OLD_FK_NAME):
        op.create_foreign_key(
            OLD_FK_NAME,
            "workflow_template_step",
            "form_template",
            ["form_id"],
            ["id"],
            ondelete="SET NULL",
        )
