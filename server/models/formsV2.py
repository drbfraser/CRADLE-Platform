from common.commonUtil import get_current_time, get_uuid
from enums import QuestionTypeEnum

from .base import db


class LangVersionOrmV2(db.Model):

    __tablename__ = "lang_version_v2"
    string_id = db.Column(db.String(200), primary_key=True)
    lang = db.Column(db.String(50), primary_key=True, default="English")
    text = db.Column(db.Text(collation="utf8mb4_general_ci"), nullable=False)

    __table_args__ = (db.PrimaryKeyConstraint("string_id", "lang"),)


class FormClassificationOrmV2(db.Model):

    __tablename__ = "form_classification_v2"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)

    name_string_id = db.Column(db.String(200), index=True, nullable=False)

    templates = db.relationship(
        "FormTemplateOrmV2",
        backref=db.backref("classification", cascade="all, delete", lazy=True),
    )


class FormTemplateOrmV2(db.Model):

    __tablename__ = "form_template_v2"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    form_classification_id = db.Column(
        db.String(50),
        db.ForeignKey("form_classification_v2.id", ondelete="SET NULL"),
        nullable=True,
    )

    version = db.Column(db.Integer, nullable=False, default=1)
    archived = db.Column(db.Boolean, nullable=False, default=False)
    is_latest = db.Column(db.Boolean, nullable=False, default=True)
    date_created = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
    )

    questions = db.relationship(
        "FormQuestionTemplateOrmV2",
        backref=db.backref("template", cascade="all, delete", lazy=True),
    )


class FormQuestionTemplateOrmV2(db.Model):

    __tablename__ = "form_question_template_v2"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    form_template_id = db.Column(
        db.String(50),
        db.ForeignKey("form_template_v2.id", ondelete="SET NULL"),
        index=True,
    )

    order = db.Column(db.Integer, nullable=False)
    question_type = db.Column(db.Enum(QuestionTypeEnum), nullable=False)
    string_id = db.Column(db.String(200), nullable=False)
    required = db.Column(db.Boolean, nullable=False, default=False)
    visible_condition = db.Column(db.Text, nullable=False, default="[]")
    units = db.Column(db.Text, nullable=True)
    num_min = db.Column(db.Float, nullable=True)
    num_max = db.Column(db.Float, nullable=True)
    string_max_length = db.Column(db.Integer, nullable=True)
    string_max_lines = db.Column(db.Integer, nullable=True)
    allow_future_dates = db.Column(db.Boolean, nullable=False, default=True)
    allow_past_dates = db.Column(db.Boolean, nullable=False, default=True)


class FormSubmissionOrmV2(db.Model):

    __tablename__ = "form_submission_v2"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    form_template_id = db.Column(
        db.String(50),
        db.ForeignKey("form_template_v2.id", ondelete="SET NULL"),
    )
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey("patient.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"), nullable=False
    )
    date_submitted = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )
    lang = db.Column(db.String(50), nullable=False, default="English")

    answers = db.relationship(
        "FormAnswerOrmV2",
        backref=db.backref("submission", cascade="all, delete", lazy=True),
    )


class FormAnswerOrmV2(db.Model):

    __tablename__ = "form_answer_v2"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    question_id = db.Column(
        db.String(50),
        db.ForeignKey("form_question_template_v2.id", ondelete="SET NULL"),
        nullable=False,
    )
    form_submission_id = db.Column(
        db.String(50),
        db.ForeignKey("form_submission_v2.id", ondelete="SET NULL"),
        nullable=False,
    )
    answer = db.Column(db.Text(collation="utf8mb4_general_ci"), nullable=False)
