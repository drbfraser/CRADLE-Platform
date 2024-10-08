"""
empty message

Revision ID: 3d7d77465333
Revises:
Create Date: 2019-11-21 03:28:15.703590

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "3d7d77465333"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "followup",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("followUpAction", sa.Text(), nullable=True),
        sa.Column("diagnosis", sa.Text(), nullable=True),
        sa.Column("treatment", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "healthfacility",
        sa.Column("healthFacilityName", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("healthFacilityName"),
    )
    op.create_table(
        "patient",
        sa.Column("patientId", sa.String(length=50), nullable=False),
        sa.Column("patientName", sa.String(length=50), nullable=True),
        sa.Column("patientAge", sa.Integer(), nullable=False),
        sa.Column(
            "patientSex",
            sa.Enum("MALE", "FEMALE", "OTHER", name="sexenum"),
            nullable=False,
        ),
        sa.Column("isPregnant", sa.Boolean(), nullable=True),
        sa.Column("gestationalAgeUnit", sa.String(length=50), nullable=True),
        sa.Column("gestationalAgeValue", sa.String(length=20), nullable=True),
        sa.Column("medicalHistory", sa.Text(), nullable=True),
        sa.Column("drugHistory", sa.Text(), nullable=True),
        sa.Column("zone", sa.String(length=20), nullable=True),
        sa.Column("tank", sa.String(length=20), nullable=True),
        sa.Column("block", sa.String(length=20), nullable=True),
        sa.Column("villageNumber", sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint("patientId"),
    )
    op.create_table(
        "role",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "name",
            sa.Enum("VHT", "HCW", "ADMIN", "CHO", name="roleenum"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "village",
        sa.Column("villageNumber", sa.String(length=50), nullable=False),
        sa.Column("zoneNumber", sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint("villageNumber"),
    )
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("firstName", sa.String(length=25), nullable=True),
        sa.Column("username", sa.String(length=64), nullable=True),
        sa.Column("email", sa.String(length=120), nullable=True),
        sa.Column("password", sa.String(length=128), nullable=True),
        sa.Column("healthFacilityName", sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(
            ["healthFacilityName"],
            ["healthfacility.healthFacilityName"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_email"), "user", ["email"], unique=True)
    op.create_index(op.f("ix_user_username"), "user", ["username"], unique=True)
    op.create_table(
        "reading",
        sa.Column("readingId", sa.String(length=50), nullable=False),
        sa.Column("bpSystolic", sa.Integer(), nullable=True),
        sa.Column("bpDiastolic", sa.Integer(), nullable=True),
        sa.Column("heartRateBPM", sa.Integer(), nullable=True),
        sa.Column("symptoms", sa.Text(), nullable=True),
        sa.Column(
            "trafficLightStatus",
            sa.Enum(
                "NONE",
                "GREEN",
                "YELLOW_UP",
                "YELLOW_DOWN",
                "RED_UP",
                "RED_DOWN",
                name="trafficlightenum",
            ),
            nullable=True,
        ),
        sa.Column("dateLastSaved", sa.String(length=100), nullable=True),
        sa.Column("dateTimeTaken", sa.String(length=100), nullable=True),
        sa.Column("dateUploadedToServer", sa.String(length=100), nullable=True),
        sa.Column("dateRecheckVitalsNeeded", sa.String(length=100), nullable=True),
        sa.Column("gpsLocationOfReading", sa.String(length=50), nullable=True),
        sa.Column("retestOfPreviousReadingIds", sa.String(length=100), nullable=True),
        sa.Column("isFlaggedForFollowup", sa.Boolean(), nullable=True),
        sa.Column("appVersion", sa.String(length=50), nullable=True),
        sa.Column("deviceInfo", sa.String(length=50), nullable=True),
        sa.Column("totalOcrSeconds", sa.Float(), nullable=True),
        sa.Column("manuallyChangeOcrResults", sa.Integer(), nullable=True),
        sa.Column("temporaryFlags", sa.Integer(), nullable=True),
        sa.Column("userHasSelectedNoSymptoms", sa.Boolean(), nullable=True),
        sa.Column("userId", sa.Integer(), nullable=True),
        sa.Column("patientId", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(
            ["patientId"],
            ["patient.patientId"],
        ),
        sa.ForeignKeyConstraint(["userId"], ["user.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("readingId"),
    )
    op.create_table(
        "supervises",
        sa.Column("choId", sa.Integer(), nullable=True),
        sa.Column("vhtId", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["choId"], ["user.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vhtId"], ["user.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("choId", "vhtId", name="unique_supervise"),
    )
    op.create_index(op.f("ix_supervises_choId"), "supervises", ["choId"], unique=False)
    op.create_table(
        "userrole",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("userId", sa.Integer(), nullable=True),
        sa.Column("roleId", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["roleId"],
            ["role.id"],
        ),
        sa.ForeignKeyConstraint(
            ["userId"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "referral",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("dateReferred", sa.String(length=100), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("actionTaken", sa.Text(), nullable=True),
        sa.Column("userId", sa.Integer(), nullable=True),
        sa.Column("patientId", sa.String(length=50), nullable=True),
        sa.Column("referralHealthFacilityName", sa.String(length=50), nullable=True),
        sa.Column("readingId", sa.String(length=50), nullable=True),
        sa.Column("followUpId", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["followUpId"],
            ["followup.id"],
        ),
        sa.ForeignKeyConstraint(
            ["patientId"],
            ["patient.patientId"],
        ),
        sa.ForeignKeyConstraint(
            ["readingId"],
            ["reading.readingId"],
        ),
        sa.ForeignKeyConstraint(
            ["referralHealthFacilityName"],
            ["healthfacility.healthFacilityName"],
        ),
        sa.ForeignKeyConstraint(
            ["userId"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("referral")
    op.drop_table("userrole")
    op.drop_index(op.f("ix_supervises_choId"), table_name="supervises")
    op.drop_table("supervises")
    op.drop_table("reading")
    op.drop_index(op.f("ix_user_username"), table_name="user")
    op.drop_index(op.f("ix_user_email"), table_name="user")
    op.drop_table("user")
    op.drop_table("village")
    op.drop_table("role")
    op.drop_table("patient")
    op.drop_table("healthfacility")
    op.drop_table("followup")
    # ### end Alembic commands ###
