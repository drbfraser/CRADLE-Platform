"""remove unused reading columns

Revision ID: e5396a8c62db
Revises: ff58b4ff640f
Create Date: 2020-07-09 23:34:39.205926

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "e5396a8c62db"
down_revision = "ff58b4ff640f"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("reading", "gpsLocationOfReading")
    op.drop_column("reading", "urineTest")
    op.drop_column("reading", "deviceInfo")
    op.drop_column("reading", "appVersion")
    op.drop_column("reading", "totalOcrSeconds")
    op.drop_column("reading", "dateLastSaved")
    op.drop_column("reading", "manuallyChangeOcrResults")
    op.drop_column("reading", "temporaryFlags")
    op.drop_column("reading", "dateUploadedToServer")
    op.drop_column("reading", "userHasSelectedNoSymptoms")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "reading",
        sa.Column(
            "userHasSelectedNoSymptoms",
            mysql.TINYINT(display_width=1),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "reading",
        sa.Column(
            "dateUploadedToServer",
            mysql.VARCHAR(
                charset="utf8mb4", collation="utf8mb4_general_ci", length=100
            ),
            nullable=True,
        ),
    )
    op.add_column(
        "reading",
        sa.Column(
            "temporaryFlags",
            mysql.INTEGER(display_width=11),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "reading",
        sa.Column(
            "manuallyChangeOcrResults",
            mysql.INTEGER(display_width=11),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "reading",
        sa.Column(
            "dateLastSaved",
            mysql.VARCHAR(
                charset="utf8mb4", collation="utf8mb4_general_ci", length=100
            ),
            nullable=True,
        ),
    )
    op.add_column("reading", sa.Column("totalOcrSeconds", mysql.FLOAT(), nullable=True))
    op.add_column(
        "reading",
        sa.Column(
            "appVersion",
            mysql.VARCHAR(charset="utf8mb4", collation="utf8mb4_general_ci", length=50),
            nullable=True,
        ),
    )
    op.add_column(
        "reading",
        sa.Column(
            "deviceInfo",
            mysql.VARCHAR(charset="utf8mb4", collation="utf8mb4_general_ci", length=50),
            nullable=True,
        ),
    )
    op.add_column(
        "reading",
        sa.Column(
            "urineTest",
            mysql.VARCHAR(collation="utf8mb4_general_ci", length=50),
            nullable=True,
        ),
    )
    op.add_column(
        "reading",
        sa.Column(
            "gpsLocationOfReading",
            mysql.VARCHAR(charset="utf8mb4", collation="utf8mb4_general_ci", length=50),
            nullable=True,
        ),
    )
    # ### end Alembic commands ###
