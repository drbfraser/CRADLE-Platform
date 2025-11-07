from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Iterator, List, Tuple

Json = Dict[str, Any]


@dataclass(slots=True)
class BranchVariableInfo:
    branch_id: str | None
    rule_id: str | None
    variables: List[str] = field(default_factory=list)


@dataclass(slots=True)
class StepVariableInfo:
    """Branches for a single step."""

    step_id: str | None
    branches: List[BranchVariableInfo] = field(default_factory=list)


@dataclass(slots=True)
class WorkflowVariableReport:
    """Aggregate variables across all steps + branches of a workflow template."""

    workflow_template_id: str | None
    steps: List[StepVariableInfo] = field(default_factory=list)
    all_variables: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        """JSON-ready payload (datasources removed)."""
        return {
            "workflow_template_id": self.workflow_template_id,
            "steps": [
                {
                    "step_id": s.step_id,
                    "branches": [
                        {
                            "branch_id": b.branch_id,
                            "rule_id": b.rule_id,
                            "variables": list(b.variables),
                        }
                        for b in s.branches
                    ],
                }
                for s in self.steps
            ],
            "all_variables": list(self.all_variables),
        }

    @property
    def by_step_id(self) -> Dict[str | None, StepVariableInfo]:
        return {s.step_id: s for s in self.steps}

    def iter_branches(self) -> Iterator[Tuple[str | None, BranchVariableInfo]]:
        for s in self.steps:
            for b in s.branches:
                yield s.step_id, b

    def find_step(self, step_id: str) -> StepVariableInfo | None:
        return self.by_step_id.get(step_id)

    def find_branch(
        self, branch_id: str, step_id: str | None = None
    ) -> BranchVariableInfo | None:
        if step_id is not None:
            s = self.find_step(step_id)
            if not s:
                return None
            return next((b for b in s.branches if b.branch_id == branch_id), None)
        for _, b in self.iter_branches():
            if b.branch_id == branch_id:
                return b
        return None
