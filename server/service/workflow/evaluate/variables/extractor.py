from __future__ import annotations

import logging
from typing import Any, Dict, Set, Union

from service.workflow.evaluate.jsonlogic_parser import extract_variables_from_rule

from .models import BranchVariableInfo, StepVariableInfo, WorkflowVariableReport
from .utils import (
    _as_dict,
    _get_condition,
    _iter_branches,
    _iter_steps,
    _normalize,
    _parse_datasources,
)

Json = Dict[str, Any]
TemplateLike = Union[Json, Any]

log = logging.getLogger(__name__)


def extract_variables_from_workflow_template(
    template: TemplateLike,
) -> WorkflowVariableReport:
    """
    Extracts variables from a workflow template.

    Iterates through each step in the template and, for each step, iterates
    through each branch. For each branch, extracts the variables used in the
    condition rule and adds them to the report.

    Returns a WorkflowVariableReport with the extracted variables.
    """
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
            if not cond or not cond.get("rule"):
                step_entry.branches.append(
                    BranchVariableInfo(branch_id=b.get("id"), rule_id=None)
                )
                continue

            rule = cond["rule"]

            variables = extract_variables_from_rule(rule)

            all_vars |= variables
            ds_tokens = _parse_datasources(cond.get("data_sources"))
            ds_norm = {_normalize(x) for x in ds_tokens}
            missing = sorted(variables - ds_norm)

            step_entry.branches.append(
                BranchVariableInfo(
                    branch_id=b.get("id"),
                    rule_id=cond.get("id"),
                    variables=sorted(variables),
                    data_sources=ds_tokens,
                    missing_from_datasources=missing,
                )
            )
        report.steps.append(step_entry)

    report.all_variables = sorted(all_vars)
    return report
