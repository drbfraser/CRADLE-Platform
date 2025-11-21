from typing import Any, Dict, List, Optional, Set

from service.workflow.datasourcing.data_sourcing import (
    DatasourceVariable,
    resolve_variables,
)
from service.workflow.evaluate.jsonlogic_parser import extract_variables_from_rule
from service.workflow.evaluate.rules_engine import evaluate_branches


class WorkflowDataResolver:
    """
    Resolves data needed for workflow branch evaluation.
    """

    def __init__(self, catalogue: Optional[Dict[str, Any]] = None):
        """
        Initialize the resolver.

        :param catalogue: Optional data catalogue for dependency injection.
                         If None, will lazy-load the real catalogue when needed.
        """
        self._catalogue = catalogue

    @property
    def catalogue(self):
        """Lazy-load the catalogue only when needed."""
        if self._catalogue is None:
            from service.workflow.datasourcing.data_catalogue import (  # noqa: E402
                get_catalogue,
            )

            self._catalogue = get_catalogue()
        return self._catalogue

    def extract_variables_from_branches(
        self, branches: List[Dict[str, Any]]
    ) -> Set[str]:
        """
        Extract all unique variables from a list of branches.

        :param branches: List of branch dicts with 'rule' fields containing JsonLogic
        :returns: Set of variable strings in "object.attribute" format

        Note: Replace with integration to variable extractor.
        """
        all_variables = set()

        for branch in branches:
            if "rule" not in branch:
                continue

            rule = branch["rule"]
            variables = extract_variables_from_rule(rule)
            all_variables.update(variables)

        return all_variables

    def resolve_data_for_branches(
        self, patient_id: str, branches: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Extract variables from branches and resolve their data.

        :param patient_id: Primary patient identifier for the workflow
        :param branches: List of branch dicts containing rules
        :returns: Dict mapping variable names to resolved values
        """
        context = {"patient_id": patient_id}

        variables_strings = self.extract_variables_from_branches(branches)

        variables = [DatasourceVariable.from_string(v) for v in variables_strings]
        variables = [v for v in variables if v is not None]

        resolved_data = resolve_variables(context, variables, self.catalogue)

        return resolved_data

    def evaluate_workflow_branches(
        self, patient_id: str, branches: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Complete workflow: extract variables, fetch data, evaluate branches.

        :param patient_id: Primary patient identifier for the workflow
        :param branches: List of branch dicts containing rules and target_step_ids
        :returns: Evaluation result dict with status and branch/missing_variables

        Returns:
            - {"status": "TRUE", "branch": {...}} if a branch matched
            - {"status": "NOT_ENOUGH_DATA", "missing_variables": {...}} if data missing
            - {"status": "NO_MATCH"} if no branches matched

        """
        resolved_data = self.resolve_data_for_branches(patient_id, branches)

        result = evaluate_branches(branches=branches, data=resolved_data)

        return result


def evaluate_workflow_step(
    patient_id: str, branches: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Function to evaluate workflow branches.

    :param patient_id: Primary patient identifier for the workflow
    :param branches: List of branch dicts containing rules
    :returns: Evaluation result dict
    """
    resolver = WorkflowDataResolver()
    return resolver.evaluate_workflow_branches(patient_id, branches)