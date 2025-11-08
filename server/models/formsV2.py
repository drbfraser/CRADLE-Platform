from common.commonUtil import get_current_time, get_uuid
from enums import QuestionTypeEnum

from .base import db


class LangVersionOrmV2(db.Model):
    """
    Translation table for all user-facing text in forms.

    This table stores translations for form names, question text, and any other
    displayable content. Each piece of text is identified by a string_id and can
    have multiple translations (one per language).

    Translation Example:
        string_id='some-uuid', lang='English' -> "What is the patient's heart rate?"
        string_id='some-uuid', lang='French'  -> "Quelle est la fréquence cardiaque du patient?"

    Primary Key: (string_id, lang) - ensures one translation per language per string

    """

    __tablename__ = "lang_version_v2"
    string_id = db.Column(db.String(50), primary_key=True)
    lang = db.Column(db.String(50), primary_key=True, default="English")
    text = db.Column(db.Text(collation="utf8mb4_general_ci"), nullable=False)

    __table_args__ = (db.PrimaryKeyConstraint("string_id", "lang"),)


class FormClassificationOrmV2(db.Model):
    """
    Groups different versions of the same logical form together.

    A classification represents a type of form (for example "Patient Intake Form")
    and can have multiple template versions over time. This allows us to:
    - Track all versions of a form under one identifier
    - Rename a form once and have it apply to all versions
    - Query for all versions of a specific form type, or the latest version of a form type
    - name_string_id points to the translation for this form's name, enabling internationalization.

    Example:
        "Patient Intake Form" classification has:
        - Version 1 (created Sept 2025)
        - Version 2 (created Oct 2025, updated questions)
        - Version 3 (created Nov 2025, added new section)

    """

    __tablename__ = "form_classification_v2"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)

    name_string_id = db.Column(db.String(50), index=True, nullable=False)

    templates = db.relationship(
        "FormTemplateOrmV2",
        backref=db.backref("classification", lazy=True),
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class FormTemplateOrmV2(db.Model):
    """
    Immutable blueprint of a form's structure at a specific point in time.

    Each template represents a specific version of a form. Templates are never
    modified after creation - any edits create a new version. This ensures that
    submitted forms can always reference the exact template structure they were
    filled out with, maintaining data integrity over time.

    Key behaviors:
    - Creating/editing a form creates a new template with version++
    - The previous version is marked archived=True
    - Only one version per classification has is_latest=True

    Example lifecycle:
        1. Admin creates "Patient Intake v1" (version=1)
        2. Admin edits form -> creates "Patient Intake v2" (version=2)
        3. v1 is marked archived=True
        4. Submissions from v1 still reference v1 template correctly
    """

    __tablename__ = "form_template_v2"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    form_classification_id = db.Column(
        db.String(50),
        db.ForeignKey("form_classification_v2.id", ondelete="RESTRICT"),
        nullable=False,
    )

    version = db.Column(db.Integer, nullable=False, default=1)
    archived = db.Column(db.Boolean, nullable=False, default=False)
    date_created = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
    )

    questions = db.relationship(
        "FormQuestionTemplateOrmV2",
        backref=db.backref("template", lazy=True),
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class FormQuestionTemplateOrmV2(db.Model):
    """
    Defines a single question within a form template.

    Each question has:
    - A type (text input, multiple choice, date, etc.)
    - Validation rules specific to that type
    - A user entered identifier for the question, to be used in the rules engine for workflows
    - Display logic (when it should be visible)
    - Translation support via string_id

    Key concepts:
    - `string_id`: Internal translation key (UUID) used for internationalization.
      Each question's text and options are stored in separate language tables referencing this ID.

    - `user_question_id`: A user-defined, human-readable identifier that
      can be used to reference this field in workflows, specifically the data extractor in rules engine.
      For example, if the question asks for the patient's age, the user might define
      `user_question_id="patient_age"`. This value is stored as-is (not converted to a UUID)
      and remains consistent across versions for rule referencing. This value should be unique per form template.

    - Questions are immutable - they belong to a specific template version.
      Editing a question means creating a new template version with the updated question.

    Example 1 — Numeric Question:
            "What is the patient's heart rate?"
            - question_type: NUMBER
            - string_id: "some-uuid-1"
            - user_question_id: "patient_heart_rate"
            - required: True
            - num_min: 40, num_max: 200
            - units: "bpm"

    Example 2 — Multiple Choice Question:
        "What is the patient's blood type?"
        - question_type: MULTIPLE_CHOICE
        - string_id: "some-uuid-2"
        - user_question_id: "patient_blood_type"
        - mc_options: [
            "some-uuid-2-mc-1",
            "some-uuid-2-mc-2",
            ...
            ]

    """

    __tablename__ = "form_question_template_v2"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    form_template_id = db.Column(
        db.String(50),
        db.ForeignKey("form_template_v2.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    order = db.Column(db.Integer, nullable=False)
    question_type = db.Column(db.Enum(QuestionTypeEnum), nullable=False)

    question_string_id = db.Column(db.String(50), nullable=False)
    mc_options = db.Column(db.Text, nullable=True)  # JSON array of UUIDs
    user_question_id = db.Column(db.String(50), nullable=False)

    has_comment_attached = db.Column(db.Boolean, nullable=False, default=False)
    category_index = db.Column(db.Integer, nullable=True)
    required = db.Column(db.Boolean, nullable=False, default=False)
    visible_condition = db.Column(db.Text, nullable=False, default="[]")
    units = db.Column(db.Text, nullable=True)

    num_min = db.Column(db.Float, nullable=True)
    num_max = db.Column(db.Float, nullable=True)
    string_max_length = db.Column(db.Integer, nullable=True)
    string_max_lines = db.Column(db.Integer, nullable=True)
    allow_future_dates = db.Column(db.Boolean, nullable=True, default=True)
    allow_past_dates = db.Column(db.Boolean, nullable=True, default=True)

    __table_args__ = (
        db.UniqueConstraint(
            "form_template_id",
            "user_question_id",
            name="unique_user_question_per_template",
        ),
    )


class FormSubmissionOrmV2(db.Model):
    """
    Records a single completed form submission by a user.

    A submission represents one instance of a patient's form being filled out.
    It captures:
    - Which template version was used (to ensure we can always validate the answers)
    - Which patient it belongs to
    - Which user filled it out
    - When it was submitted and last modified
    - What language it was filled out in

    Key note: Each submission is permanently linked to the exact template
    version that was active when the form was filled out. This means even if
    the template is updated later, historical submissions remain valid and
    can be correctly interpreted.
    """

    __tablename__ = "form_submission_v2"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    form_template_id = db.Column(
        db.String(50),
        db.ForeignKey("form_template_v2.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey("patient.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"), nullable=True
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
        backref=db.backref("submission", lazy=True),
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class FormAnswerOrmV2(db.Model):
    """
    Stores a single answer to a question within a form submission.

    Each answer:
    - References the question it answers (for validation and display)
    - Contains the actual response data in JSON format (to display by question type)
    - Is linked to a specific submission

    The answer field stores data in different formats depending on question type:
    - STRING: {"text": "Patient has low heart rate"}
    - NUMBER: {"value": 72.5}
    - MULTIPLE_CHOICE: {"mc_id_array": [0, 2]}  (indices of selected choices)
    - DATE: {"date": "2025-10-30"}

    For questions with comments attached, the format includes:
    - {"text": "Other", "comment": "Allergies to peanuts"}
    - {"mc_id_array": [3], "comment": "Since childhood"}

    Example:
        Question: "What is the patient's heart rate?"
        Answer: {"value": 75}

        Question: "Select all symptoms" (multiple choice)
        Answer: {"mc_id_array": [0, 2, 5]}  (selected options at indices 0, 2, and 5)

    """

    __tablename__ = "form_answer_v2"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    question_id = db.Column(
        db.String(50),
        db.ForeignKey("form_question_template_v2.id", ondelete="RESTRICT"),
        nullable=False,
    )
    form_submission_id = db.Column(
        db.String(50),
        db.ForeignKey("form_submission_v2.id", ondelete="CASCADE"),
        nullable=False,
    )
    answer = db.Column(db.Text(collation="utf8mb4_general_ci"), nullable=False)
