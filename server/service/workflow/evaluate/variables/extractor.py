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


def extract_variables_from_current_step(
    template: WorkflowTemplateModel,
    *,
    current_step_id: str,
) -> WorkflowVariableReport:
    """
    Extract variables **only from the current step** of a workflow template.

    - Input MUST be a WorkflowTemplateModel.
    - You MUST pass current_step_id (template step id).
    - Variables come only from JsonLogic in branch condition.rule.
    - Gracefully handles: no condition, condition with no rule ("null"), and rules
      that are valid JSON but not valid JsonLogic (returns empty for that branch).
    """
    if not isinstance(template, WorkflowTemplateModel):
        raise TypeError(
            "extract_variables_from_current_step expects a WorkflowTemplateModel"
        )
    if not current_step_id:
        raise ValueError("current_step_id is required")

    t = _as_dict(template)
    report = WorkflowVariableReport(
        workflow_template_id=t.get("id") or t.get("workflow_template_id"),
        steps=[],
        all_variables=[],
    )

    # Find the current step in the template
    target_step = None
    for step in _iter_steps(template):
        s = _as_dict(step)
        if s.get("id") == current_step_id:
            target_step = s
            break

    # If not found, return empty report (or you could raise; choice: return empty)
    if target_step is None:
        return report

    step_entry = StepVariableInfo(step_id=current_step_id, branches=[])
    all_vars: Set[str] = set()

    for branch in _iter_branches(target_step):
        b = _as_dict(branch)
        cond = _get_condition(branch)

        # No condition or no rule -> empty branch
        if not cond or not cond.get("rule"):
            step_entry.branches.append(
                BranchVariableInfo(
                    branch_id=b.get("id"),
                    rule_id=None,
                    variables=[],
                )
            )
            continue

        try:
            extracted = extract_variables_from_rule(cond["rule"])
            variables = set(extracted)
        except Exception:
            # we need to add a traceback here
            log.exception(
                "Variable extraction failed for step=%s branch=%s",
                current_step_id,
                b.get("id"),
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
