import json

import pytest

from service.workflow.evaluate.variables import extract_variables_from_workflow_template
from service.workflow.workflow_service import WorkflowService
from tests import helpers
from validation.workflow_models import WorkflowTemplateModel


def _condition(rule_id: str, rule: dict, data_sources):
    return {
        "id": rule_id,
        "rule": json.dumps(rule),
        "data_sources": (
            json.dumps(data_sources) if isinstance(data_sources, list) else data_sources
        ),
    }


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
        ["$patient.age", "$visit.type"],  # fully covered
    )
    cond2 = _condition(
        "rg-2",
        {
            "or": [
                {"<": [{"var": "vitals.bp.systolic"}, 90]},
                {"in": [{"var": "patient.sex"}, ["FEMALE", "OTHER"]]},
            ]
        },
        ["$vitals.bp.systolic"],  # missing patient.sex
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
    assert branch1.missing_from_datasources == []

    branch2 = report.find_branch("b-2", step_id=st1)
    assert branch2 and set(branch2.variables) == {"vitals.bp.systolic", "patient.sex"}
    assert set(branch2.data_sources) == {"$vitals.bp.systolic"}
    assert set(branch2.missing_from_datasources) == {"patient.sex"}


@pytest.mark.parametrize("as_model", [True, False], ids=["pydantic_model", "raw_dict"])
def test_extractor_accepts_model_and_dict(as_model: bool):
    """
    The extractor accepts either a WorkflowTemplateModel *or* a raw dict
    shaped like a template. Both should yield the same result.
    """
    wt, st1, st2 = "wt-x", "st-a", "st-b"

    cond = _condition(
        "rg-a1",
        {">": [{"var": "patient.parity"}, 3]},
        ["$patient.parity"],
    )

    step = helpers.make_workflow_template_step(
        id=st1,
        workflow_template_id=wt,
        branches=[
            helpers.make_workflow_template_branch(
                id="b-a1",
                step_id=st1,
                target_step_id=st2,
                condition_id="rg-a1",
                condition=cond,
            )
        ],
    )
    template_dict = helpers.make_workflow_template(
        id=wt,
        starting_step_id=st1,
        steps=[
            step,
            helpers.make_workflow_template_step(id=st2, workflow_template_id=wt),
        ],
    )

    template_input = (
        WorkflowTemplateModel(**template_dict) if as_model else template_dict
    )

    report = extract_variables_from_workflow_template(template_input)

    assert report.workflow_template_id == wt
    assert report.find_step(st1) is not None
    b = report.find_branch("b-a1", step_id=st1)
    assert b and b.rule_id == "rg-a1" and b.datasources == ["$patient.parity"]
    assert set(b.variables) == {"patient.parity"}
    assert b.missing_from_datasources == []
