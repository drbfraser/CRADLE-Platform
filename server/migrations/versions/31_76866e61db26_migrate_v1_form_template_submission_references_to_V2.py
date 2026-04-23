"""
Migrate V1 workflow instance step form references to V2

Revision ID: 31_76866e61db26
Revises: 31_wf_step_form_fk_v2
Create Date: 2026-04-08 15:42:02.984421

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "31_76866e61db26"
down_revision = "31_wf_step_form_fk_v2"
branch_labels = None
depends_on = None


def upgrade():
    # === workflow_instance_step ===
    op.drop_constraint(
        "fk_workflow_instance_step_form_id_form",
        "workflow_instance_step",
        type_="foreignkey",
    )

    # Clean invalid references
    op.execute("""
        UPDATE workflow_instance_step
        SET form_id = NULL
        WHERE form_id IS NOT NULL
          AND form_id NOT IN (SELECT id FROM form_submission_v2);
    """)

    # Add new FK to submission_v2
    op.create_foreign_key(
        op.f("fk_workflow_instance_step_form_id_form_submission_v2"),
        "workflow_instance_step",
        "form_submission_v2",
        ["form_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade():
    # === workflow_instance_step ===
    op.drop_constraint(
        op.f("fk_workflow_instance_step_form_id_form_submission_v2"),
        "workflow_instance_step",
        type_="foreignkey",
    )

    # Clean invalid references before restoring old FK
    op.execute("""
        UPDATE workflow_instance_step
        SET form_id = NULL
        WHERE form_id IS NOT NULL
          AND form_id NOT IN (SELECT id FROM form);
    """)

    # Restore old FK to form
    op.create_foreign_key(
        "fk_workflow_instance_step_form_id_form",
        "workflow_instance_step",
        "form",
        ["form_id"],
        ["id"],
        ondelete="SET NULL",
    )
