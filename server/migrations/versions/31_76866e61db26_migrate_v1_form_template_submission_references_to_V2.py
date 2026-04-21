"""
Migrate V1 form template/submission references in workflows to V2

Revision ID: 31_76866e61db26
Revises: 30_wf_var_catalogue_types
Create Date: 2026-04-08 15:42:02.984421

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "31_76866e61db26"
down_revision = "30_wf_var_catalogue_types"
branch_labels = None
depends_on = None


def upgrade():
    # === workflow_template_step ===

    # Drop old FK
    op.drop_constraint(
        "fk_workflow_template_step_form_id_form_template",
        "workflow_template_step",
        type_="foreignkey",
    )

    # Clean invalid references before adding new FK
    op.execute("""
        UPDATE workflow_template_step
        SET form_id = NULL
        WHERE form_id IS NOT NULL
          AND form_id NOT IN (SELECT id FROM form_template_v2);
    """)

    # Add new FK to V2 table
    op.create_foreign_key(
        op.f("fk_workflow_template_step_form_id_form_template_v2"),
        "workflow_template_step",
        "form_template_v2",
        ["form_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # === workflow_instance_step ===

    # Drop old FK
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
    # === workflow_template_step ===

    # Drop new FK to form_template_v2
    op.drop_constraint(
        op.f("fk_workflow_template_step_form_id_form_template_v2"),
        "workflow_template_step",
        type_="foreignkey",
    )

    # Clean invalid references before restoring old FK
    op.execute("""
        UPDATE workflow_template_step
        SET form_id = NULL
        WHERE form_id IS NOT NULL
          AND form_id NOT IN (SELECT id FROM form_template);
    """)

    # Restore old FK to form_template
    op.create_foreign_key(
        "fk_workflow_template_step_form_id_form_template",
        "workflow_template_step",
        "form_template",
        ["form_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # === workflow_instance_step ===

    # Drop new FK to form_submission_v2
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
