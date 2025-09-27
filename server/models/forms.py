from .base import *

# MODELS
class FormClassificationOrm(db.Model):
    """
    Categories for organizing different types of forms.
    
    Provides a classification system for grouping related forms together.
    Used to organize and filter forms by their clinical purpose.
    """
    __tablename__ = "form_classification"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)

    @staticmethod
    def schema():
        return FormClassificationSchema

class FormTemplateOrm(db.Model):
    """
    Templates that define the structure and questions for  forms.
    
    Reusable form blueprints that can be versioned and archived over time.
    When healthcare workers need to fill out a form, they create instances based on these templates. 
    Supports classification grouping and lifecycle management through archiving.
    """
    __tablename__ = "form_template"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    version = db.Column(db.Text, nullable=True)
    date_created = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
    )
    archived = db.Column(db.Boolean, nullable=False, default=False)
    
    # FOREIGN KEYS
    form_classification_id = db.Column(
        db.String(50),
        db.ForeignKey('form_classification.id', ondelete="SET NULL"),
        nullable=True,
    )

    # RELATIONSHIPS
    classification = db.relationship(
        'FormClassificationOrm',
        backref=db.backref("templates", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return FormTemplateSchema

class FormOrm(db.Model):
    """
    Completed form instances filled out by healthcare workers for specific patients.
    
    Created from form templates and contains actual patient data and responses.
    Supports multiple languages and tracks creation/editing history. 
    Each form belongs to a specific patient and a form template, it can be archived when no longer active.
    """
    __tablename__ = "form"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    lang = db.Column(db.Text, nullable=False)
    name = db.Column(db.Text, nullable=False, default="")
    category = db.Column(db.Text, nullable=False, default="")
    date_created = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
    )
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )
    archived = db.Column(db.Boolean, nullable=False, default=False)
    
    # FOREIGN KEYS
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey('patient.id', ondelete="CASCADE"),
        nullable=False,
    )
    form_template_id = db.Column(
        db.String(50),
        db.ForeignKey('form_template.id', ondelete="SET NULL"),
        nullable=True,
    )
    last_edited_by = db.Column(
        db.String(50),
        db.ForeignKey('user.id', ondelete="SET NULL"), nullable=True
    )

    # RELATIONSHIPS
    patient = db.relationship(
        'PatientOrm',
        backref=db.backref("forms", cascade="all, delete", lazy=True),
    )
    template = db.relationship(
        'FormTemplateOrm',
        backref=db.backref("forms", lazy=True)
    )

    @staticmethod
    def schema():
        return FormSchema

class QuestionOrm(db.Model):
    """
    Individual questions that make up healthcare forms and form templates.
    
    Supports various question types (text, number, multiple choice, dates) with validation rules, conditional visibility, and multiple choice options. Questions can exist as blank templates or filled instances with actual answers. Stores both the question structure and user responses in JSON format.
    
    Question: a child model related to a form template or a form

    isBlank: true means the question is related to form template, vice versa
    questionIndex: a custom-defined question number index e.g. 1,2,3...
    visible_condition: any json format string indicating a visible condition, the content logic should be handled in frontend
    e.g.
    [{
        "qidx": 1,
        "relation": "EQUAL_TO",
        "answers": {
            "number": 1
        }
    }]

    mcOptions: a json format list string indicating a list of multiple choices
    (maximum 5 options)
    e.g.
    [
        {
            "mcId": 0,
            "opt": "abcd"
        },
        ... (maximum 5 answers)
    ]

    answers: a json format string indicating the answers filled by user
    e.g.
    {
        "number": 5/5.0,
        "text": "a",
        "mcIdArray":[0,1],
        "comment": "other opt"
    }
    """
    __tablename__ = "question"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    is_blank = db.Column(db.Boolean, nullable=False, default=0)
    question_index = db.Column(db.Integer, nullable=False)
    question_text = db.Column(
        db.Text(collation="utf8mb4_general_ci"),
        nullable=False,
        default="",
    )
    question_type = db.Column(db.Enum(QuestionTypeEnum), nullable=False)
    has_comment_attached = db.Column(db.Boolean, nullable=False, default=0)
    required = db.Column(db.Boolean, nullable=False, default=0)
    allow_future_dates = db.Column(db.Boolean, nullable=False, default=1)
    allow_past_dates = db.Column(db.Boolean, nullable=False, default=1)
    units = db.Column(db.Text, nullable=True)
    visible_condition = db.Column(db.Text, nullable=False, default="[]")
    mc_options = db.Column(
        db.Text(collation="utf8mb4_general_ci"),
        nullable=False,
        default="[]",
    )
    num_min = db.Column(db.Float, nullable=True)
    num_max = db.Column(db.Float, nullable=True)
    string_max_length = db.Column(db.Integer, nullable=True)
    answers = db.Column(db.Text, nullable=False, default="{}")
    category_index = db.Column(db.Integer, nullable=True)
    string_max_lines = db.Column(db.Integer, nullable=True)

    # FOREIGN KEYS
    form_id = db.Column(
        db.String(50),
        db.ForeignKey('form.id', ondelete="CASCADE"),
        nullable=True,
    )
    form_template_id = db.Column(
        db.String(50),
        db.ForeignKey('form_template.id', ondelete="CASCADE"),
        nullable=True,
    )

    # RELATIONSHIPS
    form = db.relationship(
        'FormOrm',
        backref=db.backref("questions", cascade="all, delete", lazy=True),
    )
    form_template = db.relationship(
        'FormTemplateOrm',
        backref=db.backref("questions", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return QuestionSchema

class QuestionLangVersionOrm(db.Model):
    """
    This model is used to store different language versions of a single question.
    """
    __tablename__ = "question_lang_version"

    id = db.Column(db.Integer, primary_key=True)
    lang = db.Column(db.Text, nullable=False)
    question_text = db.Column(db.Text(collation="utf8mb4_general_ci"), nullable=False)
    mc_options = db.Column(
        db.Text(collation="utf8mb4_general_ci"),
        nullable=False,
        default="[]",
    )

    # FOREIGN KEYS
    question_id = db.Column(
        db.String(50),
        db.ForeignKey('question.id', ondelete="CASCADE"),
        nullable=False,
    )

    # RELATIONSHIPS
    question = db.relationship(
        'QuestionOrm',
        backref=db.backref("lang_versions", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return QuestionLangVersionSchema

# SCHEMAS
# class FormClassificationSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         include_fk = True
#         model = FormClassificationOrm
#         load_instance = True
#         include_relationships = True

# class FormTemplateSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         include_fk = True
#         model = FormTemplateOrm
#         load_instance = True
#         include_relationships = True

# class FormSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         include_fk = True
#         model = FormOrm
#         load_instance = True
#         include_relationships = True

# class QuestionSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         include_fk = True
#         model = QuestionOrm
#         load_instance = True
#         include_relationships = True

# class QuestionLangVersionSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         include_fk = True
#         model = QuestionLangVersionOrm
#         load_instance = True
#         include_relationships = True
