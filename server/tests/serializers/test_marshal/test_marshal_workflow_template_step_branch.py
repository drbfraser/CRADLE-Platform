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

    br = WorkflowTemplateStepBranchOrm()
    br.id = "br-001"
    br.step_id = "wts-100"
    br.target_step_id = "wts-200"
    br.condition_id = cond.id
    br.condition = cond

    out = m.marshal(br)

    # Core field presence
    assert set(out.keys()) == {
        "id",
        "step_id",
        "target_step_id",
        "condition_id",
        "condition",
    }
    assert out["id"] == "br-001"
    assert out["step_id"] == "wts-100"
    assert out["target_step_id"] == "wts-200"
    assert out["condition_id"] == "rg-42"

    assert isinstance(out["condition"], dict)
    assert out["condition"]["id"] == "rg-42"
    assert out["condition"]["rule"] == {
        "all": [
            {"field": "bp_systolic", "op": ">", "value": 140},
            {"field": "bp_diastolic", "op": "<", "value": 90},
        ],
    }
    assert out["condition"]["data_sources"] == {
        "type": "form",
        "fields": ["bp_systolic", "bp_diastolic"],
    }

    # Relationship objects should not leak
    assert "step" not in out


def test_branch_marshal_omits_none_fields_when_no_condition():
    """
    If target_step_id and condition are None:
      - 'target_step_id' and 'condition' are omitted,
      - 'condition_id' also omitted if None,
    """
    br = WorkflowTemplateStepBranchOrm()
    br.id = "br-002"
    br.step_id = "wts-101"
    br.target_step_id = None
    br.condition_id = None
    br.condition = None

    out = m.marshal(br)

    assert set(out.keys()) == {"id", "step_id"}
    assert out["id"] == "br-002"
    assert out["step_id"] == "wts-101"


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

    br = WorkflowTemplateStepBranchOrm()
    br.id = "br-003"
    br.step_id = "wts-102"
    br.target_step_id = "wts-999"
    br.condition_id = cond.id
    br.condition = cond

    out = m.marshal(br)

    assert set(out.keys()) == {
        "id",
        "step_id",
        "target_step_id",
        "condition_id",
        "condition",
    }
    c = out["condition"]

    # Required keys present
    for key in ("id", "rule", "data_sources"):
        assert key in c

    assert c["id"] == "rg-empty"
    assert c["rule"] == {}
    assert c["data_sources"] == []

    # Private attrs stripped by __pre_process
    assert "_scratch" not in c
