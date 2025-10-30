from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Iterator, List, Optional, Tuple

Json = Dict[str, Any]

@dataclass(slots=True)
class BranchVariableInfo:
    """Variables and data-source info for a single branch."""

    branch_id: Optional[str]
    rule_id: Optional[str]
    variables: List[str] = field(default_factory=list)
    data_sources: List[str] = field(default_factory=list)
    missing_from_datasources: List[str] = field(default_factory=list)


    @property
    def datasources(self) -> List[str]: 
        return self.data_sources

@dataclass(slots=True)
class StepVariableInfo:
    """Branches for a single step."""

    step_id: Optional[str]
    branches: List[BranchVariableInfo] = field(default_factory=list)

@dataclass(slots=True)
class WorkflowVariableReport:
    """Aggregate variables across all steps + branches of a workflow template."""

    workflow_template_id: Optional[str]
    steps: List[StepVariableInfo] = field(default_factory=list)
    all_variables: List[str] = field(default_factory=list)

    def to_dict(self) -> Json:
        """Legacy JSON shape for easy serialization/sharing."""
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
                            "datasources": list(b.data_sources),  # legacy key
                            "missing_from_datasources": list(b.missing_from_datasources),
                        } for b in s.branches
                    ],
                } for s in self.steps
            ],
            "all_variables": list(self.all_variables),
        }

    @property
    def by_step_id(self) -> Dict[Optional[str], StepVariableInfo]:
        return {s.step_id: s for s in self.steps}

    def iter_branches(self) -> Iterator[Tuple[Optional[str], BranchVariableInfo]]:
        for s in self.steps:
            for b in s.branches:
                yield s.step_id, b

    def find_step(self, step_id: str) -> Optional[StepVariableInfo]:
        return self.by_step_id.get(step_id)

    def find_branch(self, branch_id: str, step_id: Optional[str] = None) -> Optional[BranchVariableInfo]:
        if step_id is not None:
            s = self.find_step(step_id)
            return next((b for b in (s.branches if s else []) if b.branch_id == branch_id), None)
        for _, b in self.iter_branches():
            if b.branch_id == branch_id:
                return b
        return None
