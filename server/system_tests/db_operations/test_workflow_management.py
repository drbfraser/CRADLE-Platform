import json

import data.db_operations as crud
import models
from enums import WorkflowInstanceDataFieldTypeEnum, WorkflowStatusEnum


def _template(
    workflow_classification_factory,
    workflow_template_factory,
    id="workflow-template",
):
    classification = workflow_classification_factory.create(
        id=f"{id}-classification",
        name=f"{id} classification",
    )
    template = workflow_template_factory.create(
        id=id,
        classification_id=classification.id,
    )
    return classification, template


def _instance(
    patient_factory,
    workflow_classification_factory,
    workflow_template_factory,
    workflow_instance_factory,
    id="workflow-instance",
):
    patient = patient_factory.create(id=f"{id}-patient")
    _, template = _template(
        workflow_classification_factory,
        workflow_template_factory,
        f"{id}-template",
    )
    instance = workflow_instance_factory.create(
        id=id,
        patient_id=patient.id,
        workflow_template_id=template.id,
    )
    return patient, template, instance


# delete_workflow_step_branch tests


def test_delete_workflow_step_branch(
    workflow_classification_factory,
    workflow_template_factory,
    workflow_template_step_factory,
    workflow_template_step_branch_factory,
    rule_group_factory,
):
    _, template = _template(
        workflow_classification_factory,
        workflow_template_factory,
        "delete-branch-template",
    )
    step = workflow_template_step_factory.create(
        id="delete-branch-step",
        workflow_template_id=template.id,
    )
    rule_group = rule_group_factory.create(
        id="delete-branch-rule",
        rule={"==": [{"var": "x"}, 1]},
    )
    branch = workflow_template_step_branch_factory.create(
        id="delete-branch",
        step_id=step.id,
        condition_id=rule_group.id,
    )

    crud.delete_workflow_step_branch(id=branch.id)
    workflow_template_step_branch_factory.models.remove(branch)
    rule_group_factory.models.remove(rule_group)

    assert crud.read(models.WorkflowTemplateStepBranchOrm, id=branch.id) is None
    assert crud.read(models.RuleGroupOrm, id=rule_group.id) is None


# read_instance_steps tests


def test_read_instance_steps_basic(
    patient_factory,
    workflow_classification_factory,
    workflow_template_factory,
    workflow_instance_factory,
    workflow_instance_step_factory,
):
    _, _, instance = _instance(
        patient_factory,
        workflow_classification_factory,
        workflow_template_factory,
        workflow_instance_factory,
        "instance-steps",
    )
    _, _, other_instance = _instance(
        patient_factory,
        workflow_classification_factory,
        workflow_template_factory,
        workflow_instance_factory,
        "other-instance-steps",
    )
    step = workflow_instance_step_factory.create(
        id="instance-step",
        workflow_instance_id=instance.id,
    )
    workflow_instance_step_factory.create(
        id="other-instance-step",
        workflow_instance_id=other_instance.id,
    )

    steps = crud.read_instance_steps(
        models.WorkflowInstanceStepOrm,
        workflow_instance_id=instance.id,
    )

    assert [s.id for s in steps] == [step.id]


# read_workflow_instances tests


def test_read_workflow_instances_filters(
    patient_factory,
    workflow_classification_factory,
    workflow_template_factory,
    workflow_instance_factory,
):
    patient = patient_factory.create(id="workflow-instance-filter-patient")
    other_patient = patient_factory.create(id="other-workflow-instance-filter-patient")
    _, template = _template(
        workflow_classification_factory,
        workflow_template_factory,
        "workflow-instance-filter-template",
    )
    instance = workflow_instance_factory.create(
        id="matching-workflow-instance",
        patient_id=patient.id,
        workflow_template_id=template.id,
    )
    workflow_instance_factory.create(
        id="other-workflow-instance",
        patient_id=other_patient.id,
        workflow_template_id=template.id,
    )

    instances = crud.read_workflow_instances(
        patient_id=patient.id,
        status=WorkflowStatusEnum.ACTIVE,
        workflow_template_id=template.id,
    )

    assert [i.id for i in instances] == [instance.id]


# read_workflow_templates tests


def test_read_workflow_templates_filters(
    workflow_classification_factory,
    workflow_template_factory,
):
    classification = workflow_classification_factory.create(
        id="workflow-template-filter-classification",
        name="Workflow Template Filter",
    )
    template = workflow_template_factory.create(
        id="workflow-template-filter",
        classification_id=classification.id,
        archived=False,
    )
    workflow_template_factory.create(
        id="archived-workflow-template-filter",
        classification_id=classification.id,
        archived=True,
        version="2",
    )

    templates = crud.read_workflow_templates(
        workflow_classification_id=classification.id,
        is_archived=False,
    )

    assert [t.id for t in templates] == [template.id]


# read_template_steps tests


def test_read_template_steps_basic(
    workflow_classification_factory,
    workflow_template_factory,
    workflow_template_step_factory,
):
    _, template = _template(
        workflow_classification_factory,
        workflow_template_factory,
        "template-steps-template",
    )
    _, other_template = _template(
        workflow_classification_factory,
        workflow_template_factory,
        "other-template-steps-template",
    )
    step = workflow_template_step_factory.create(
        id="template-step",
        workflow_template_id=template.id,
    )
    workflow_template_step_factory.create(
        id="other-template-step",
        workflow_template_id=other_template.id,
    )

    steps = crud.read_template_steps(workflow_template_id=template.id)

    assert [s.id for s in steps] == [step.id]


# read_workflows_in_collection tests


def test_read_workflows_in_collection(
    workflow_collection_factory,
    workflow_classification_factory,
):
    collection = workflow_collection_factory.create(
        id="workflow-collection",
        name="Collection",
    )
    matching = workflow_classification_factory.create(
        id="collection-classification",
        name="Collection classification",
        collection_id=collection.id,
    )
    workflow_classification_factory.create(
        id="other-collection-classification",
        name="Other classification",
    )

    classifications = crud.read_workflows_in_collection(collection.id)

    assert [c.id for c in classifications] == [matching.id]


# read_rule_group tests


def test_read_rule_group_basic(rule_group_factory):
    rule_group = rule_group_factory.create(
        id="read-rule-group",
        rule={"==": [{"var": "x"}, 1]},
    )

    result = crud.read_rule_group(rule_group.id)

    assert result.id == rule_group.id
    assert result.rule == rule_group.rule


def test_read_rule_group_empty():
    assert crud.read_rule_group("") is None


# read_workflow_instance tests


def test_read_workflow_instance_basic(
    patient_factory,
    workflow_classification_factory,
    workflow_template_factory,
    workflow_instance_factory,
):
    _, _, instance = _instance(
        patient_factory,
        workflow_classification_factory,
        workflow_template_factory,
        workflow_instance_factory,
        "read-workflow-instance",
    )

    result = crud.read_workflow_instance(instance.id)

    assert result.id == instance.id


def test_read_workflow_instance_empty():
    assert crud.read_workflow_instance("") is None


# read_workflow_instance_data_for_instance tests


def test_read_workflow_instance_data_for_instance_orders_by_field_tag(
    patient_factory,
    workflow_classification_factory,
    workflow_template_factory,
    workflow_instance_factory,
):
    _, _, instance = _instance(
        patient_factory,
        workflow_classification_factory,
        workflow_template_factory,
        workflow_instance_factory,
        "workflow-data-order",
    )

    crud.upsert_workflow_instance_data_row(
        instance.id,
        "wf.z",
        WorkflowInstanceDataFieldTypeEnum.STRING,
        "last",
    )
    crud.upsert_workflow_instance_data_row(
        instance.id,
        "wf.a",
        WorkflowInstanceDataFieldTypeEnum.STRING,
        "first",
    )

    rows = crud.read_workflow_instance_data_for_instance(instance.id)

    assert [row.field_tag for row in rows] == ["wf.a", "wf.z"]


# read_workflow_instance_data_by_field_tag tests


def test_read_workflow_instance_data_by_field_tag(
    patient_factory,
    workflow_classification_factory,
    workflow_template_factory,
    workflow_instance_factory,
):
    _, _, instance = _instance(
        patient_factory,
        workflow_classification_factory,
        workflow_template_factory,
        workflow_instance_factory,
        "workflow-data-field",
    )

    row = crud.upsert_workflow_instance_data_row(
        instance.id,
        "wf.lookup",
        WorkflowInstanceDataFieldTypeEnum.BOOLEAN,
        True,
    )

    result = crud.read_workflow_instance_data_by_field_tag(instance.id, "wf.lookup")

    assert result.id == row.id
    assert json.loads(result.field_value) is True


# upsert_workflow_instance_data_row tests


def test_workflow_instance_data_upsert_insert(
    patient_factory,
    workflow_classification_factory,
    workflow_template_factory,
    workflow_instance_factory,
):
    _, _, instance = _instance(
        patient_factory,
        workflow_classification_factory,
        workflow_template_factory,
        workflow_instance_factory,
        "workflow-data-insert",
    )

    row = crud.upsert_workflow_instance_data_row(
        workflow_instance_id=instance.id,
        field_tag="wf.randomization_arm",
        field_type=WorkflowInstanceDataFieldTypeEnum.STRING,
        value="control",
    )

    assert row.workflow_instance_id == instance.id
    assert row.field_tag == "wf.randomization_arm"
    assert json.loads(row.field_value) == "control"


def test_workflow_instance_data_upsert_update(
    patient_factory,
    workflow_classification_factory,
    workflow_template_factory,
    workflow_instance_factory,
):
    _, _, instance = _instance(
        patient_factory,
        workflow_classification_factory,
        workflow_template_factory,
        workflow_instance_factory,
        "workflow-data-update",
    )

    first = crud.upsert_workflow_instance_data_row(
        workflow_instance_id=instance.id,
        field_tag="wf.score",
        field_type=WorkflowInstanceDataFieldTypeEnum.INTEGER,
        value=1,
    )
    second = crud.upsert_workflow_instance_data_row(
        workflow_instance_id=instance.id,
        field_tag="wf.score",
        field_type=WorkflowInstanceDataFieldTypeEnum.INTEGER,
        value=2,
    )

    assert second.id == first.id
    assert json.loads(second.field_value) == 2
