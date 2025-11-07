from __future__ import annotations

import json

import pytest

from service.workflow.evaluate.variables import extract_variables_from_workflow_template
from service.workflow.workflow_service import WorkflowService
from tests import helpers
from validation.workflow_models import WorkflowTemplateModel


def _condition(rule_id: str, rule: object) -> dict:
    """
    Uniform condition helper for tests.

    Accepts:
      - dict  -> json.dumps(dict)
      - str   -> used as-is (assumed to be a JSON string)
      - None  -> json.dumps(None)  # "no rule" case

    Always includes data_sources="[]" to satisfy the WorkflowTemplateModel validators.
    """
    if rule is None:
        rule_json = json.dumps(None)
    elif isinstance(rule, str):
        rule_json = rule
    else:
        rule_json = json.dumps(rule)
    return {"id": rule_id, "rule": rule_json, "data_sources": "[]"}


def _tmpl(
    wt="wt-core", st1="st-1", st2="st-2", branches: list[dict] | None = None
) -> WorkflowTemplateModel:
    step1 = helpers.make_workflow_template_step(
        id=st1,
        workflow_template_id=wt,
        branches=branches or [],
    )
    step2 = helpers.make_workflow_template_step(id=st2, workflow_template_id=wt)
    tmpl = helpers.make_workflow_template(
        id=wt,
        starting_step_id=st1,
        steps=[step1, step2],
    )
    return WorkflowTemplateModel(**tmpl)


def test_extract_after_workflowservice_generation():
    """
    Build a small template (2 steps, 2 branches on step-1), generate an instance with
    WorkflowService (proves the template is valid), then extract variables from that template.
    """
    wt, st1, st2 = "wt-1", "st-1", "st-2"

    cond1 = _condition(
        "rg-1",
        {
            "and": [
                {">=": [{"var": "patient.age"}, 18]},
                {"==": [{"var": "visit.type"}, "ANC"]},
            ]
        },
    )
    cond2 = _condition(
        "rg-2",
        {
            "or": [
                {"<": [{"var": "vitals.bp.systolic"}, 90]},
                {"in": [{"var": "patient.sex"}, ["FEMALE", "OTHER"]]},
            ]
        },
    )

    step1 = helpers.make_workflow_template_step(
        id=st1,
        workflow_template_id=wt,
        branches=[
            helpers.make_workflow_template_branch(
                id="b-1",
                step_id=st1,
                target_step_id=st2,
                condition_id="rg-1",
                condition=cond1,
            ),
            helpers.make_workflow_template_branch(
                id="b-2",
                step_id=st1,
                target_step_id=st2,
                condition_id="rg-2",
                condition=cond2,
            ),
        ],
    )
    step2 = helpers.make_workflow_template_step(id=st2, workflow_template_id=wt)

    template = WorkflowTemplateModel(
        **helpers.make_workflow_template(
            id=wt, starting_step_id=st1, steps=[step1, step2]
        )
    )

    instance = WorkflowService.generate_workflow_instance(template)
    assert instance.workflow_template_id == wt

    report = extract_variables_from_workflow_template(template)

    assert report.workflow_template_id == wt
    assert set(report.all_variables) == {
        "patient.age",
        "visit.type",
        "vitals.bp.systolic",
        "patient.sex",
    }

    step1 = report.find_step(st1)
    assert step1 and len(step1.branches) == 2

    branch1 = report.find_branch("b-1", step_id=st1)
    assert branch1 and set(branch1.variables) == {"patient.age", "visit.type"}

    branch2 = report.find_branch("b-2", step_id=st1)
    assert branch2 and set(branch2.variables) == {"vitals.bp.systolic", "patient.sex"}


def test_requires_workflow_template_model_input():
    """
    Verify that extract_variables_from_workflow_template raises a TypeError if
    passed a dict instead of a WorkflowTemplateModel.
    """
    wt = "wt-type"
    step = helpers.make_workflow_template_step(
        id="st-1", workflow_template_id=wt, branches=[]
    )
    tmpl_dict = helpers.make_workflow_template(
        id=wt, starting_step_id="st-1", steps=[step]
    )
    with pytest.raises(TypeError):
        extract_variables_from_workflow_template(tmpl_dict)


def test_no_condition_yields_empty_variables():
    """
    Verify that a branch with no condition yields an empty variables list.
    """
    b1 = helpers.make_workflow_template_branch(id="b-1", step_id="st-1", condition=None)
    report = extract_variables_from_workflow_template(_tmpl(branches=[b1]))
    s1 = report.find_step("st-1")
    assert s1 is not None
    assert len(s1.branches) == 1
    assert s1.branches[0].rule_id is None
    assert s1.branches[0].variables == []
    assert report.all_variables == []


def test_condition_without_rule_yields_empty_variables():
    """
    Verify that a branch with a condition but no rule yields an empty variables
    list.
    """
    cond = _condition("rg-1", None)
    b = helpers.make_workflow_template_branch(id="b-2", step_id="st-1", condition=cond)
    report = extract_variables_from_workflow_template(_tmpl(branches=[b]))
    s1 = report.find_step("st-1")
    assert s1 is not None
    assert s1.branches[0].rule_id == "rg-1"
    assert s1.branches[0].variables == []
    assert report.all_variables == []


def test_bad_json_rule():
    """
    Verify that a branch with a bad JSON rule yields an empty variables list.
    A "bad JSON rule" is one that is not a valid JSON object.
    """
    bad_rule = json.dumps(123)
    cond = _condition("rg-bad", bad_rule)
    b = helpers.make_workflow_template_branch(
        id="b-bad", step_id="st-1", condition=cond
    )
    report = extract_variables_from_workflow_template(_tmpl(branches=[b]))
    s1 = report.find_step("st-1")
    assert s1 is not None
    assert s1.branches[0].rule_id == "rg-bad"
    assert s1.branches[0].variables == []
    assert report.all_variables == []


def test_duplicate_variables_across_branches_are_deduped_in_all_variables():
    """
    Verify that variables from different branches of the same step are
    de-duplicated in the WorkflowVariableReport's all_variables field.
    """
    r1 = json.dumps(
        {
            "and": [
                {">=": [{"var": "patient.age"}, 18]},
                {"==": [{"var": "visit.type"}, "ANC"]},
            ]
        }
    )
    r2 = json.dumps(
        {
            "or": [
                {"var": "patient.age"},
                {"==": [{"var": "visit.type"}, "ANC"]},
            ]
        }
    )
    b1 = helpers.make_workflow_template_branch(
        id="b-1", step_id="st-1", condition=_condition("rg-1", r1)
    )
    b2 = helpers.make_workflow_template_branch(
        id="b-2", step_id="st-1", condition=_condition("rg-2", r2)
    )

    report = extract_variables_from_workflow_template(_tmpl(branches=[b1, b2]))
    assert report.all_variables == ["patient.age", "visit.type"]

    s1 = report.find_step("st-1")
    assert s1 is not None and len(s1.branches) == 2
    assert s1.branches[0].variables
    assert s1.branches[1].variables
