from common.commonUtil import get_current_time, get_uuid

from .base import db


# MODELS
class WorkflowCollectionOrm(db.Model):
    """
    Groups related workflows together for organizational purposes.

    Tracks creation and modification timestamps.
    """

    __tablename__ = "workflow_collection"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)
    date_created = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )


class WorkflowClassificationOrm(db.Model):
    """
    Categorizes workflow templates by type or purpose within collections.

    Provides sub-categorization of workflows within broader collections.
    """

    __tablename__ = "workflow_classification"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)

    # FOREIGN KEYS
    collection_id = db.Column(
        db.String(50),
        db.ForeignKey("workflow_collection.id", ondelete="SET NULL"),
        nullable=True,
    )

    # RELATIONSHIPS
    collection = db.relationship(
        "WorkflowCollectionOrm",
        backref=db.backref("workflow_classifications", lazy=True),
        passive_deletes=True,
    )


class RuleGroupOrm(db.Model):
    """
    Stores conditional logic rules for workflow automation.

    Contains JSON-based rule definitions and data sources for determining
    workflow behavior. Structure may change based on chosen rules engine.
    """

    __tablename__ = "rule_group"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    # NOTE: These attributes may need to be altered or removed depending on what rules engine we choose
    rule = db.Column(db.JSON, nullable=True)
    data_sources = db.Column(db.JSON, nullable=True)


class WorkflowTemplateOrm(db.Model):
    """
    Defines reusable workflow blueprints.

    Templates specify the sequence of steps, forms, and conditions for
    standardized procedures. Can be versioned and archived over time.
    """

    __tablename__ = "workflow_template"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    archived = db.Column(db.Boolean, nullable=False, default=False)
    date_created = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    starting_step_id = db.Column(db.String(50), nullable=True)
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )
    version = db.Column(db.Text, nullable=False)

    # FOREIGN KEYS
    classification_id = db.Column(
        db.String(50),
        db.ForeignKey("workflow_classification.id", ondelete="SET NULL"),
        nullable=True,
    )

    # RELATIONSHIPS
    classification = db.relationship(
        "WorkflowClassificationOrm",
        backref=db.backref("workflow_templates", lazy=True),
        passive_deletes=True,
    )


class WorkflowTemplateStepOrm(db.Model):
    """
    Individual steps within a workflow template.

    Each step can have associated forms, completion deadlines, and conditions
    that determine when the step becomes active or branches to other steps.
    """

    __tablename__ = "workflow_template_step"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    expected_completion = db.Column(
        db.BigInteger, nullable=True, default=None, onupdate=get_current_time
    )
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )

    # FOREIGN KEYS
    form_id = db.Column(
        db.String(50),
        db.ForeignKey("form_template.id", ondelete="SET NULL"),
        nullable=True,
    )
    workflow_template_id = db.Column(
        db.String(50),
        db.ForeignKey("workflow_template.id", ondelete="CASCADE"),
        nullable=False,
    )

    # RELATIONSHIPS
    workflow_template = db.relationship(
        "WorkflowTemplateOrm",
        backref=db.backref("steps", cascade="all, delete", lazy=True),
    )

    form = db.relationship(
        "FormTemplateOrm",
        backref=db.backref("workflow_template_steps", lazy=True),
        passive_deletes=True,
    )


class WorkflowTemplateStepBranchOrm(db.Model):
    """
    Defines conditional branches between workflow template steps.

    Specifies which step to go to next based on conditions or user choices.
    """

    __tablename__ = "workflow_template_step_branch"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    target_step_id = db.Column(db.String(50), nullable=True)

    # FOREIGN KEYS
    step_id = db.Column(
        db.String(50),
        db.ForeignKey("workflow_template_step.id", ondelete="CASCADE"),
        nullable=False,
    )
    condition_id = db.Column(
        db.String(50),
        db.ForeignKey("rule_group.id", ondelete="SET NULL"),
        nullable=True,
    )

    # RELATIONSHIPS
    step = db.relationship(
        "WorkflowTemplateStepOrm",
        backref=db.backref("branches", cascade="all, delete", lazy=True),
    )
    condition = db.relationship(
        "RuleGroupOrm",
        backref=db.backref("workflow_template_step_branches", lazy=True),
        passive_deletes=True,
    )


class WorkflowInstanceOrm(db.Model):
    """
    Active workflow execution for a specific patient.

    Created from a workflow template and tracks progress through steps.
    Maintains current status and completion state for ongoing processes.
    """

    __tablename__ = "workflow_instance"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    start_date = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    current_step_id = db.Column(db.String(50), nullable=True)
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )
    completion_date = db.Column(
        db.BigInteger, nullable=True, default=None, onupdate=get_current_time
    )
    status = db.Column(db.String(20), nullable=False, default="Active")

    # FOREIGN KEYS
    workflow_template_id = db.Column(
        db.String(50),
        db.ForeignKey("workflow_template.id", ondelete="SET NULL"),
        nullable=True,
    )
    patient_id = db.Column(
        db.String(50), db.ForeignKey("patient.id", ondelete="CASCADE"), nullable=False
    )

    # RELATIONSHIPS
    patient = db.relationship(
        "PatientOrm",
        backref=db.backref("workflow_instances", cascade="all, delete", lazy=True),
    )
    workflow_template = db.relationship(
        "WorkflowTemplateOrm",
        backref=db.backref("workflow_instances", lazy=True),
    )


class WorkflowInstanceStepOrm(db.Model):
    __tablename__ = "workflow_instance_step"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    start_date = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    triggered_by = db.Column(
        db.String(50), nullable=True
    )  # The prior step in the workflow that activated the current step
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )
    expected_completion = db.Column(
        db.BigInteger, nullable=True, default=None, onupdate=get_current_time
    )
    completion_date = db.Column(
        db.BigInteger, nullable=True, default=None, onupdate=get_current_time
    )
    status = db.Column(db.String(20), nullable=False, default="Active")
    data = db.Column(db.Text, nullable=True)

    # FOREIGN KEYS
    form_id = db.Column(
        db.String(50), db.ForeignKey("form.id", ondelete="SET NULL"), nullable=True
    )
    workflow_template_step_id = db.Column(
        db.String(50),
        db.ForeignKey("workflow_template_step.id", ondelete="SET NULL"),
        nullable=True,
    )
    assigned_to = db.Column(
        db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )
    workflow_instance_id = db.Column(
        db.String(50),
        db.ForeignKey("workflow_instance.id", ondelete="CASCADE"),
        nullable=False,
    )

    # RELATIONSHIPS
    workflow_instance = db.relationship(
        "WorkflowInstanceOrm",
        backref=db.backref("steps", cascade="all, delete", lazy=True),
    )
    form = db.relationship(
        "FormOrm",
        backref=db.backref("workflow_instance_steps", lazy=True),
    )
    workflow_template_step = db.relationship(
        "WorkflowTemplateStepOrm",
        backref=db.backref("workflow_instance_steps", lazy=True),
    )
