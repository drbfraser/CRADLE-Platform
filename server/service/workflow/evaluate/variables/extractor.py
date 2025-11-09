from __future__ import annotations

import logging
from typing import Any, Dict, Set, Union

from service.workflow.evaluate.jsonlogic_parser import extract_variables_from_rule
from validation.workflow_models import WorkflowTemplateModel

from .models import BranchVariableInfo, StepVariableInfo, WorkflowVariableReport
from .utils import (
    _as_dict,
    _get_condition,
    _iter_branches,
    _iter_steps,
)

Json = Dict[str, Any]
TemplateLike = Union[Json, Any]

log = logging.getLogger(__name__)


def extract_variables_from_workflow_template(
    template: WorkflowTemplateModel,
) -> WorkflowVariableReport:
    """
    Extracts variables from a workflow template.

    Iterates through each step in the template and, for each step, iterates
    through each branch. For each branch, extracts the variables used in the
    condition rule and adds them to the report.

    Returns a WorkflowVariableReport with the extracted variables.
    """
    if not isinstance(template, WorkflowTemplateModel):
        raise TypeError(
            "extract_variables_from_workflow_template expects a WorkflowTemplateModel"
        )

    t = _as_dict(template)
    report = WorkflowVariableReport(
        workflow_template_id=t.get("id") or t.get("workflow_template_id")
    )

    all_vars: Set[str] = set()

    for step in _iter_steps(template):
        s = _as_dict(step)
        step_entry = StepVariableInfo(step_id=s.get("id"))

        for branch in _iter_branches(step):
            b = _as_dict(branch)
            cond = _get_condition(branch)

            # No condition or no rule -> empty branch entry
            if not cond or not cond.get("rule"):
                step_entry.branches.append(
                    BranchVariableInfo(
                        branch_id=b.get("id"),
                        rule_id=None,
                        variables=[],
                    )
                )
                continue

            # Extract from JsonLogic rule (robust to parser errors)
            try:
                extracted = extract_variables_from_rule(cond["rule"])
                variables = set(extracted)  # coerce defensively
            except Exception:
                log.exception(
                    "Rule variable extraction failed",
                    extra={
                        "step_id": s.get("id"),
                        "branch_id": b.get("id"),
                    },
                )
                variables = set()

            all_vars |= variables

            step_entry.branches.append(
                BranchVariableInfo(
                    branch_id=b.get("id"),
                    rule_id=cond.get("id"),
                    variables=sorted(variables),
                )
            )

        report.steps.append(step_entry)

    report.all_variables = sorted(all_vars)
    return report
