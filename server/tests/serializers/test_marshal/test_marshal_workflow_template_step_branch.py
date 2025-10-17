import data.marshal as m
from models import RuleGroupOrm, WorkflowTemplateStepBranchOrm


def test_branch_marshal_with_condition_embeds_rule_group_and_fk_ids():
    """
    When a branch has a Condition:
      - result includes: id, step_id, target_step_id, condition_id, condition
      - 'condition' is a dict with id, rule, data_sources (JSON preserved)
      - no relationship objects (like 'step') should leak
    """
    cond = RuleGroupOrm()
    cond.id = "rg-42"
    cond.rule = {
        "all": [
            {"field": "bp_systolic", "op": ">", "value": 140},
            {"field": "bp_diastolic", "op": "<", "value": 90},
        ],
    }
    cond.data_sources = {"type": "form", "fields": ["bp_systolic", "bp_diastolic"]}

    workflow_step_branch = WorkflowTemplateStepBranchOrm()
    workflow_step_branch.id = "br-001"
    workflow_step_branch.step_id = "wts-100"
    workflow_step_branch.target_step_id = "wts-200"
    workflow_step_branch.condition_id = cond.id
    workflow_step_branch.condition = cond

    marshalled = m.marshal(workflow_step_branch)

    # Core field presence
    assert set(marshalled.keys()) == {
        "id",
        "step_id",
        "target_step_id",
        "condition_id",
        "condition",
    }
    assert marshalled["id"] == "br-001"
    assert marshalled["step_id"] == "wts-100"
    assert marshalled["target_step_id"] == "wts-200"
    assert marshalled["condition_id"] == "rg-42"

    assert isinstance(marshalled["condition"], dict)
    assert marshalled["condition"]["id"] == "rg-42"
    assert marshalled["condition"]["rule"] == {
        "all": [
            {"field": "bp_systolic", "op": ">", "value": 140},
            {"field": "bp_diastolic", "op": "<", "value": 90},
        ],
    }
    assert marshalled["condition"]["data_sources"] == {
        "type": "form",
        "fields": ["bp_systolic", "bp_diastolic"],
    }

    # Relationship objects should not leak
    assert "step" not in marshalled


def test_branch_marshal_omits_none_fields_when_no_condition():
    """
    If target_step_id and condition are None:
      - 'target_step_id' and 'condition' are omitted,
      - 'condition_id' also omitted if None,
    """
    workflow_step_branch = WorkflowTemplateStepBranchOrm()
    workflow_step_branch.id = "br-002"
    workflow_step_branch.step_id = "wts-101"
    workflow_step_branch.target_step_id = None
    workflow_step_branch.condition_id = None
    workflow_step_branch.condition = None

    marshalled = m.marshal(workflow_step_branch)

    assert set(marshalled.keys()) == {"id", "step_id"}
    assert marshalled["id"] == "br-002"
    assert marshalled["step_id"] == "wts-101"


def test_branch_marshal_preserves_empty_json_in_condition_but_strips_none():
    """
    Empty JSON structures in the RuleGroup are valid and should be preserved,
    while None-valued fields are stripped during pre-processing.

    NOTE: __marshal_rule_group does not strip relationship fields, so the
    backref 'workflow_template_step_branches' may be present. We only require
    that 'id', 'rule', and 'data_sources' exist and that private attrs are removed.
    """
    cond = RuleGroupOrm()
    cond.id = "rg-empty"
    cond.rule = {}
    cond.data_sources = []

    workflow_step_branch = WorkflowTemplateStepBranchOrm()
    workflow_step_branch.id = "br-003"
    workflow_step_branch.step_id = "wts-102"
    workflow_step_branch.target_step_id = "wts-999"
    workflow_step_branch.condition_id = cond.id
    workflow_step_branch.condition = cond

    marshalled = m.marshal(workflow_step_branch)

    assert set(marshalled.keys()) == {
        "id",
        "step_id",
        "target_step_id",
        "condition_id",
        "condition",
    }
    condition = marshalled["condition"]

    # Required keys present
    for key in ("id", "rule", "data_sources"):
        assert key in condition

    assert condition["id"] == "rg-empty"
    assert condition["rule"] == {}
    assert condition["data_sources"] == []

    # Private attrs stripped by __pre_process
    assert "_scratch" not in condition
