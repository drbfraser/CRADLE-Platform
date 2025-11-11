from __future__ import annotations

import json

import pytest

from service.workflow.evaluate.variables import extract_variables_from_current_step
from service.workflow.workflow_service import WorkflowService
from tests import helpers
from validation.workflow_models import WorkflowTemplateModel


def _condition(rule_id: str, rule: object, data_sources=[]) -> dict:
    """
    Uniform condition helper for tests.

    Accepts:
      - dict  -> json.dumps(dict)
      - str   -> used as-is (assumed to be a JSON string)
      - None  -> json.dumps(None)  # "no rule" case
    """
    if rule is None:
        rule_json = json.dumps(None)
    elif isinstance(rule, str):
        rule_json = rule
    else:
        rule_json = json.dumps(rule)

    data_sources = json.dumps(data_sources)
    return {"id": rule_id, "rule": rule_json, "data_sources": data_sources}


def _tmpl(
    wt="wt-core", st1="st-1", st2="st-2", branches1=None, branches2=None
) -> WorkflowTemplateModel:
    step1 = helpers.make_workflow_template_step(
        id=st1,
        workflow_template_id=wt,
        branches=branches1 or [],
    )
    step2 = helpers.make_workflow_template_step(
        id=st2,
        workflow_template_id=wt,
        branches=branches2 or [],
    )
    tmpl = helpers.make_workflow_template(
        id=wt,
        starting_step_id=st1,
        steps=[step1, step2],
    )
    return WorkflowTemplateModel(**tmpl)


def _tmpl(
    wt="wt-vars", st1="st-1", st2="st-2", branches1=None, branches2=None
) -> WorkflowTemplateModel:
    s1 = helpers.make_workflow_template_step(
        id=st1, workflow_template_id=wt, branches=branches1 or []
    )
    s2 = helpers.make_workflow_template_step(
        id=st2, workflow_template_id=wt, branches=branches2 or []
    )
    t = helpers.make_workflow_template(id=wt, starting_step_id=st1, steps=[s1, s2])
    return WorkflowTemplateModel(**t)


def test_isolated_per_step_extraction():
    """
    Test that variables are extracted only from the current step and do not leak across branches.
    The test case consists of two steps with different variables. We extract variables for each step separately and verify that there is no cross-step leakage.
    """
    wt, st1, st2 = "wt-vars", "st-1", "st-2"

    # Step 1 variables: patient.age, visit.type
    b1 = helpers.make_workflow_template_branch(
        id="b-1",
        step_id=st1,
        condition=_condition(
            "rg-1",
            {
                "and": [
                    {">=": [{"var": "patient.age"}, 18]},
                    {"==": [{"var": "visit.type"}, "ANC"]},
                ]
            },
        ),
        target_step_id=st2,
    )

    # Step 2 variables: vitals.hr, patient.sex (different set)
    b2 = helpers.make_workflow_template_branch(
        id="b-2",
        step_id=st2,
        condition=_condition(
            "rg-2",
            {
                "and": [
                    {">": [{"var": "vitals.hr"}, 100]},
                    {"var": "patient.sex"},
                ]
            },
        ),
        target_step_id=None,
    )

    template = _tmpl(wt=wt, st1=st1, st2=st2, branches1=[b1], branches2=[b2])

    # Sanity: template is valid in the system
    inst = WorkflowService.generate_workflow_instance(template)
    assert inst.workflow_template_id == wt

    # Extract for step 1 only
    rep1 = extract_variables_from_current_step(template, current_step_id=st1)
    assert [s.step_id for s in rep1.steps] == [st1]
    assert rep1.all_variables == ["patient.age", "visit.type"]

    # Extract for step 2 only
    rep2 = extract_variables_from_current_step(template, current_step_id=st2)
    assert [s.step_id for s in rep2.steps] == [st2]
    assert rep2.all_variables == ["patient.sex", "vitals.hr"]

    # Prove isolation: no cross-step leakage
    assert set(rep1.all_variables).isdisjoint(set(rep2.all_variables)) is True


def test_extract_only_current_step_after_workflowservice_generation():
    """
    Test that variables are extracted only from the current step after the WorkflowService generates a workflow instance.
    """
    wt, st1, st2 = "wt-1", "st-1", "st-2"

    # step-1 has variables: patient.age, visit.type
    cond1 = _condition(
        "rg-1",
        {
            "and": [
                {">=": [{"var": "patient.age"}, 18]},
                {"==": [{"var": "visit.type"}, "ANC"]},
            ]
        },
    )
    # step-2 has different variables we should NOT see when current_step_id=st-1
    cond2 = _condition(
        "rg-2",
        {"and": [{">": [{"var": "vitals.hr"}, 100]}, {"var": "patient.sex"}]},
    )

    b1 = helpers.make_workflow_template_branch(
        id="b-1", step_id=st1, condition=cond1, target_step_id=st2
    )
    b2 = helpers.make_workflow_template_branch(
        id="b-2", step_id=st2, condition=cond2, target_step_id=None
    )

    template = _tmpl(wt=wt, st1=st1, st2=st2, branches1=[b1], branches2=[b2])

    instance = WorkflowService.generate_workflow_instance(template)
    assert instance.workflow_template_id == wt

    report = extract_variables_from_current_step(template, current_step_id=st1)

    assert report.workflow_template_id == wt
    assert [s.step_id for s in report.steps] == [st1]
    assert report.all_variables == ["patient.age", "visit.type"]

    s1 = report.steps[0]
    assert len(s1.branches) == 1
    assert s1.branches[0].rule_id == "rg-1"
    assert s1.branches[0].variables == ["patient.age", "visit.type"]


def test_requires_workflow_template_model_input():
    """
    Test that extract_variables_from_current_step requires a WorkflowTemplateModel input.
    Raises TypeError when given a dict instead.
    """
    wt = "wt-type"
    st = helpers.make_workflow_template_step(
        id="st-1", workflow_template_id=wt, branches=[]
    )
    tmpl_dict = helpers.make_workflow_template(
        id=wt, starting_step_id="st-1", steps=[st]
    )
    with pytest.raises(TypeError):
        extract_variables_from_current_step(tmpl_dict, current_step_id="st-1")  # type: ignore[arg-type]


def test_no_condition_yields_empty_variables():
    """
    Test that no condition yields an empty list of variables for the corresponding branch.
    """
    st1 = "st-1"
    b = helpers.make_workflow_template_branch(id="b-1", step_id=st1, condition=None)
    template = _tmpl(st1=st1, branches1=[b])
    report = extract_variables_from_current_step(template, current_step_id=st1)

    assert report.all_variables == []
    assert report.steps[0].step_id == st1
    assert report.steps[0].branches[0].variables == []


def test_condition_without_rule_yields_empty_variables():
    """
    Test that a condition with no rule yields an empty list of variables for the corresponding branch.
    """
    st1 = "st-1"
    cond = _condition("rg-1", None)  # rule="null"
    b = helpers.make_workflow_template_branch(id="b-1", step_id=st1, condition=cond)
    template = _tmpl(st1=st1, branches1=[b])
    report = extract_variables_from_current_step(template, current_step_id=st1)

    assert report.all_variables == []
    assert report.steps[0].branches[0].rule_id == "rg-1"
    assert report.steps[0].branches[0].variables == []


def test_bad_json_rule():
    """
    Test that bad JSON rules are handled by the extractor.
    """
    st1 = "st-1"

    bad_rule = json.dumps(123)
    cond = _condition("rg-bad", bad_rule)
    b = helpers.make_workflow_template_branch(id="b-bad", step_id=st1, condition=cond)
    template = _tmpl(st1=st1, branches1=[b])
    report = extract_variables_from_current_step(template, current_step_id=st1)

    assert report.all_variables == []
    assert report.steps[0].branches[0].rule_id == "rg-bad"
    assert report.steps[0].branches[0].variables == []


def test_dedup_within_current_step_across_branches():
    """
    Test that variables are de-duplicated across branches within a single step.
    Variables from different branches are merged without duplicates.
    """
    st1 = "st-1"
    r1 = json.dumps(
        {
            "and": [
                {">=": [{"var": "patient.age"}, 18]},
                {"==": [{"var": "visit.type"}, "ANC"]},
            ]
        }
    )
    r2 = json.dumps(
        {"or": [{"var": "patient.age"}, {"==": [{"var": "visit.type"}, "ANC"]}]}
    )

    b1 = helpers.make_workflow_template_branch(
        id="b-1", step_id=st1, condition=_condition("rg-1", r1)
    )
    b2 = helpers.make_workflow_template_branch(
        id="b-2", step_id=st1, condition=_condition("rg-2", r2)
    )

    template = _tmpl(st1=st1, branches1=[b1, b2])
    report = extract_variables_from_current_step(template, current_step_id=st1)

    assert report.all_variables == ["patient.age", "visit.type"]

    s1 = report.steps[0]
    assert len(s1.branches) == 2
    assert s1.branches[0].variables
    assert s1.branches[1].variables
