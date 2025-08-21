"""
change form_id inside workflow_instance_steps to nullable=true if not already done

Revision ID: 20_7edada0266e5
Revises: 19_864e4bd5280f
Create Date: 2025-08-21 02:52:51.584448

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '20_7edada0266e5'
down_revision = '19_864e4bd5280f'
branch_labels = None
depends_on = None


def upgrade():
    # check if form_id is currently nullable=False (if yes, we need to change)
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    # get current column info
    step_columns = inspector.get_columns("workflow_instance_step")
    form_id_column = next((col for col in step_columns if col["name"] == "form_id"), None)
    
    # apply changes if needed
    if form_id_column and not form_id_column["nullable"]:
        print("form_id is currently NOT nullable, applying fix...")
        
        step_foreign_keys = inspector.get_foreign_keys("workflow_instance_step")
        form_fk_exists = any(
            fk["name"] == "fk_workflow_instance_step_form_id_form"
            for fk in step_foreign_keys
        )
        
        # Make form_id nullable
        op.alter_column(
            "workflow_instance_step",
            "form_id",
            existing_type=mysql.VARCHAR(length=50),
            nullable=True,
        )
        
        # Update foreign key constraint to SET NULL on delete
        if form_fk_exists:
            op.drop_constraint(
                "fk_workflow_instance_step_form_id_form",
                "workflow_instance_step",
                type_="foreignkey",
            )
        
        op.create_foreign_key(
            op.f("fk_workflow_instance_step_form_id_form"),
            "workflow_instance_step",
            "form",
            ["form_id"],
            ["id"],
            ondelete="SET NULL",
        )
        
        print("form_id nullable fix applied successfully")
    else:
        print("form_id is already nullable or doesn't exist, skipping...")


def downgrade():
    # check if form_id is currently nullable=True (if yes, we need to change)
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    step_columns = inspector.get_columns("workflow_instance_step")
    form_id_column = next((col for col in step_columns if col["name"] == "form_id"), None)
    
    # only rollback if form_id exists and is currently nullable
    if form_id_column and form_id_column["nullable"]:
        print("Rolling back form_id nullable change...")
        
        op.drop_constraint(
            op.f("fk_workflow_instance_step_form_id_form"),
            "workflow_instance_step",
            type_="foreignkey",
        )
        
        op.create_foreign_key(
            "fk_workflow_instance_step_form_id_form",
            "workflow_instance_step",
            "form",
            ["form_id"],
            ["id"],
            ondelete="CASCADE",
        )
        
        op.alter_column(
            "workflow_instance_step",
            "form_id",
            existing_type=mysql.VARCHAR(length=50),
            nullable=False,
        )
        
        print("form_id nullable rollback completed")
    else:
        print("form_id is already NOT nullable or doesn't exist, skipping rollback...")