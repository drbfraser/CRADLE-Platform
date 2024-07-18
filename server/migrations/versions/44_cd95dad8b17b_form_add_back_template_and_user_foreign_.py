"""form add back template and user foreign key with set null

Revision ID: 44_cd95dad8b17b
Revises: 43_2435e7cc9c9c
Create Date: 2022-03-16 05:38:27.584106

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "44_cd95dad8b17b"
down_revision = "43_2435e7cc9c9c"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("form", sa.Column("formTemplateId", sa.Integer(), nullable=True))
    op.add_column("form", sa.Column("lastEditedBy", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_form_form_template_form_template_id_id",
        "form",
        "form_template",
        ["formTemplateId"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_form_user_last_edited_by_id",
        "form",
        "user",
        ["lastEditedBy"],
        ["id"],
        ondelete="SET NULL",
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint("fk_form_user_last_edited_by_id", "form", type_="foreignkey")
    op.drop_constraint(
        "fk_form_form_template_form_template_id_id", "form", type_="foreignkey"
    )
    op.drop_column("form", "lastEditedBy")
    op.drop_column("form", "formTemplateId")
    # ### end Alembic commands ###
