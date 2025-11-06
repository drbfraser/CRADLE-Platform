from models import (
    RuleGroupOrm,
    WorkflowClassificationOrm,
    WorkflowCollectionOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
)

from .forms import (
    __marshal_form,
    __marshal_form_template,
    __unmarshal_form,
    __unmarshal_form_template,
)
from .utils import __load, __pre_process, _no_autoflush_ctx


def __marshal_rule_group(rg: RuleGroupOrm) -> dict:
    """
    Serialize a ``RuleGroupOrm``. ``__pre_process`` removes private/``None`` fields.

    :param rg: RuleGroup instance to serialize.
    :return: Rule-group dictionary.
    """
    d = vars(rg).copy()
    __pre_process(d)

    return d


def __marshal_workflow_collection(
    wf_collection: WorkflowCollectionOrm, shallow: bool = False
) -> dict:
    """
    Serialize a ``WorkflowCollectionOrm``; optionally include nested classifications.

    :param wf_collection: Workflow collection to serialize.
    :param shallow: If ``True``, omit nested classifications.
    :return: Workflow-collection dictionary.
    """
    d = vars(wf_collection).copy()
    __pre_process(d)

    if not shallow:
        d["classifications"] = [
            __marshal_workflow_classification(
                workflow_classification, if_include_templates=False
            )
            for workflow_classification in wf_collection.workflow_classifications
        ]

    return d


def __marshal_workflow_template_step_branch(
    wtsb: WorkflowTemplateStepBranchOrm,
) -> dict:
    """
    Serialize a ``WorkflowTemplateStepBranchOrm``; include ``condition`` if present.

    :param wtsb: Workflow template step branch instance.
    :return: Branch dictionary with optional serialized ``condition``.
    """
    d = vars(wtsb).copy()
    __pre_process(d)

    if wtsb.condition is not None:
        d["condition"] = __marshal_rule_group(wtsb.condition)

    return d


def __marshal_workflow_template_step(
    wts: WorkflowTemplateStepOrm, shallow: bool = False
) -> dict:
    """
    Serialize a ``WorkflowTemplateStepOrm``; embed form and optionally branches.

    :param wts: Workflow template step to serialize.
    :param shallow: If ``True``, omit branches.
    :return: Workflow-template-step dictionary including serialized form.
    """
    d = vars(wts).copy()
    __pre_process(d)

    d["form"] = __marshal_form_template(wts.form)

    if not shallow:
        d["branches"] = [
            __marshal_workflow_template_step_branch(wtsb) for wtsb in wts.branches
        ]

    return d


def __marshal_workflow_template(wt: WorkflowTemplateOrm, shallow: bool = False) -> dict:
    """
    Serialize a ``WorkflowTemplateOrm``; include classification and optionally steps.

    :param wt: Workflow template to serialize.
    :param shallow: If ``True``, omit steps.
    :return: Workflow-template dictionary.
    """
    d = vars(wt).copy()
    __pre_process(d)

    if wt.classification:
        d["classification"] = __marshal_workflow_classification(
            wc=wt.classification, if_include_templates=False
        )

    if not shallow:
        d["steps"] = [__marshal_workflow_template_step(wts=wts) for wts in wt.steps]
    elif "steps" in d:
        del d["steps"]

    return d


def __marshal_workflow_classification(
    wc: WorkflowClassificationOrm, if_include_templates: bool, shallow: bool = False
) -> dict:
    """
    Serialize a ``WorkflowClassificationOrm``; optionally include templates.

    :param wc: Workflow classification to serialize.
    :param if_include_templates: If ``True``, embed serialized workflow templates.
    :param shallow: If ``True``, propagate ``shallow`` to nested templates.
    :return: Workflow-classification dictionary.
    """
    d = vars(wc).copy()
    __pre_process(d)

    if d.get("workflow_templates") is not None:
        del d["workflow_templates"]

    if if_include_templates:
        d["workflow_templates"] = [
            __marshal_workflow_template(wt=wt, shallow=shallow) for wt in wc.templates
        ]

    return d


def __marshal_workflow_instance_step(wis: WorkflowInstanceStepOrm) -> dict:
    """
    Serialize a ``WorkflowInstanceStepOrm``; embed a shallow form if present.

    :param wis: Workflow instance step to serialize.
    :return: Workflow-instance-step dictionary with shallow ``form`` (or ``None``).
    """
    d = vars(wis).copy()
    __pre_process(d)

    if wis.form is not None:
        d["formId"] = wis.form.id
        d["form"] = __marshal_form(wis.form, shallow=True)
    else:
        d["form"] = None

    return d


def __marshal_workflow_instance(wi: WorkflowInstanceOrm, shallow: bool = False) -> dict:
    """
    Serialize a ``WorkflowInstanceOrm``; optionally include steps.

    :param wi: Workflow instance to serialize.
    :param shallow: If ``True``, omit steps.
    :return: Workflow-instance dictionary.
    """
    d = vars(wi).copy()
    __pre_process(d)

    if not shallow:
        d["steps"] = [__marshal_workflow_instance_step(wis) for wis in wi.steps]
    elif "steps" in d:
        del d["steps"]

    return d


def __unmarshal_workflow_template_step_branch(d: dict) -> WorkflowTemplateStepBranchOrm:
    """
    Construct a ``WorkflowTemplateStepBranchOrm`` and unmarshal its condition if present.

    :param d: Workflow template step branch payload dictionary.
    :return: ``WorkflowTemplateStepBranchOrm`` with optional ``condition``.
    """
    template_step_branch_orm = __load(WorkflowTemplateStepBranchOrm, d)

    if d.get("condition") is not None:
        template_step_branch_orm.condition = __load(RuleGroupOrm, d.get("condition"))

    return template_step_branch_orm


def __unmarshal_workflow_template_step(d: dict) -> WorkflowTemplateStepOrm:
    """
    Construct a ``WorkflowTemplateStepOrm``; attach branches and form if provided.

    :param d: Workflow template step payload dictionary.
    :return: ``WorkflowTemplateStepOrm`` with branches/form set.
    """
    branches = []
    form = None

    if d.get("branches") is not None:
        branches = [
            __unmarshal_workflow_template_step_branch(b) for b in d.get("branches")
        ]
        del d["branches"]

    if d.get("form") is not None:
        form = __unmarshal_form_template(d.get("form"))
        del d["form"]

    workflow_template_step_orm = __load(WorkflowTemplateStepOrm, d)
    workflow_template_step_orm.branches = branches
    workflow_template_step_orm.form = form

    return workflow_template_step_orm


def __unmarshal_workflow_template(d: dict) -> WorkflowTemplateOrm:
    """
    Construct a ``WorkflowTemplateOrm``; attach steps and classification if provided.

    :param d: Workflow template payload dictionary.
    :return: ``WorkflowTemplateOrm`` with steps/classification set.
    """
    with _no_autoflush_ctx():
        steps = []
        classification = None

        if d.get("steps") is not None:
            steps = [__unmarshal_workflow_template_step(s) for s in d.get("steps")]
            del d["steps"]

        if d.get("classification") is not None:
            classification = __load(WorkflowClassificationOrm, d.get("classification"))
            del d["classification"]

        workflow_template_orm = __load(WorkflowTemplateOrm, d)
        workflow_template_orm.steps = steps
        workflow_template_orm.classification = classification

    return workflow_template_orm


def __unmarshal_workflow_instance_step(d: dict) -> WorkflowInstanceStepOrm:
    """
    Construct a ``WorkflowInstanceStepOrm``; unmarshal its form if present.

    :param d: Workflow instance step payload dictionary.
    :return: ``WorkflowInstanceStepOrm`` with optional form.
    """
    form = None

    if d.get("form") is not None:
        form = __unmarshal_form(d.get("form"))
        del d["form"]

    workflow_instance_step_orm = __load(WorkflowInstanceStepOrm, d)
    workflow_instance_step_orm.form = form

    return workflow_instance_step_orm


def __unmarshal_workflow_instance(d: dict) -> WorkflowInstanceOrm:
    """
    Construct a ``WorkflowInstanceOrm``; attach steps if present.

    :param d: Workflow instance payload dictionary.
    :return: ``WorkflowInstanceOrm`` with steps set.
    """
    steps = []

    if d.get("steps") is not None:
        steps = [__unmarshal_workflow_instance_step(d) for d in d.get("steps")]
        del d["steps"]

    workflow_instance_orm = __load(WorkflowInstanceOrm, d)
    workflow_instance_orm.steps = steps

    return workflow_instance_orm
