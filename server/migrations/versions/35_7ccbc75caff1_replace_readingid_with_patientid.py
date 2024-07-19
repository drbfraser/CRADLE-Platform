"""Replace readingId with patientId

Revision ID: 7ccbc75caff1
Revises: 1029b5bb3354
Create Date: 2022-02-07 22:28:30.847304

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "7ccbc75caff1"
down_revision = "1029b5bb3354"
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()

    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "followup", sa.Column("patientId", sa.String(length=50), nullable=False)
    )
    connection.execute(
        (
            "UPDATE followup f "
            "INNER JOIN reading r "
            "ON r.readingId = f.readingId "
            "SET f.patientId = r.patientId "
        )
    )

    op.drop_constraint("followup_ibfk_2", "followup", type_="foreignkey")
    op.create_foreign_key(
        "fk_followup_patient_patientid",
        "followup",
        "patient",
        ["patientId"],
        ["patientId"],
    )
    op.drop_column("followup", "readingId")
    # ### end Alembic commands ###


def downgrade():
    connection = op.get_bind()

    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "followup", sa.Column("readingId", mysql.VARCHAR(length=50), nullable=False)
    )
    connection.execute(
        (
            "UPDATE followup f "
            "INNER JOIN reading r "
            "ON r.patientId = f.patientId "
            "SET f.readingId = r.readingId "
            "WHERE NOT EXISTS ( "
            "SELECT 1 "
            "FROM reading as r2 "
            "WHERE r2.patientId = r.patientId "
            "AND r2.dateTimeTaken > r.dateTimeTaken "
            ") "
        )
    )
    op.drop_constraint("fk_followup_patient_patientid", "followup", type_="foreignkey")
    op.create_foreign_key(
        "followup_ibfk_2", "followup", "reading", ["readingId"], ["readingId"]
    )
    op.drop_column("followup", "patientId")
    # ### end Alembic commands ###
