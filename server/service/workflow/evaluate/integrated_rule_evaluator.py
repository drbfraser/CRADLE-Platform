import logging
from typing import Any, Dict, List, Optional, Tuple

from service.workflow.datasourcing.data_catalogue import get_catalogue
from service.workflow.datasourcing.data_sourcing import (
    DatasourceVariable,
    resolve_variables,
    VariableResolution,
    VariableResolutionStatus,
)
from service.workflow.datasourcing.workflow_data_resolver import WorkflowDataResolver
from service.workflow.evaluate.jsonlogic_parser import extract_variables_from_rule
from service.workflow.evaluate.rules_engine import RuleStatus, RulesEngineFacade

logger = logging.getLogger(__name__)


class IntegratedRuleEvaluator:
    """
    Evaluates workflow rules by:
    1. Extracting variables from the rule (extractor)
    2. Resolving variables to actual data (resolver)
    3. Evaluating the rule with resolved data (rule engine)
    """

    def __init__(self, catalogue: Optional[Dict[str, Any]] = None):
        """
        Initialize the evaluator.

        :param catalogue: Data catalogue to use for resolving variables.
                         If None, uses the default catalogue.
        """
        self.catalogue = catalogue or get_catalogue()
        self.resolver = WorkflowDataResolver(self.catalogue)

    def evaluate_rule(
        self, rule: Optional[str], patient_id: str
    ) -> Tuple[RuleStatus, List[VariableResolution]]:
        """
        Evaluate a rule with a given context.

        :param rule: JsonLogic rule string to evaluate
        :param context: Context dict with IDs (e.g., {"patient_id": "p123", "assessment_id": "a456"})
        :param variables_to_resolve: Pre-extracted variables
        :returns: Tuple of (RuleStatus, list of VariableResolution)
        """
        if rule is None or rule == "":
            return (RuleStatus.TRUE, [])

        try:
            variable_strings = extract_variables_from_rule(rule)
            logger.debug(
                f"Variables to resolve: {variable_strings} for context {patient_id}"
            )
            if not variable_strings:
                return self._evaluate_static_rule(rule)

            variables = [
                DatasourceVariable.from_string(v) for v in variable_strings
            ]
            variables = [v for v in variables if v is not None]

            context = {"patient_id": patient_id}
            resolved_data = resolve_variables(
                context=context, variables=variables, catalogue=self.catalogue
            )

            logger.debug(f"Resolved data for context {context}: {resolved_data}")

            missing_vars = [k for k, v in resolved_data.items() if v is None]
            if missing_vars:
                logger.info(
                    f"Missing data for variables: {missing_vars} for context {context}"
                )
                var_resolutions = self._create_variable_resolutions(resolved_data)
                return (RuleStatus.NOT_ENOUGH_DATA, var_resolutions)

            rule_engine = RulesEngineFacade(rule=rule, args={})
            evaluation_result = rule_engine.evaluate(input=resolved_data)

            var_resolutions = self._create_variable_resolutions(resolved_data)

            return (evaluation_result.status, var_resolutions)

        except Exception as e:
            logger.exception(
                f"Error evaluating rule for context {context}: {e}"
            )
            # change this for specific error handling
            return (RuleStatus.NOT_ENOUGH_DATA, [])

    def _create_variable_resolutions(
        self, resolved_data: Dict[str, Any]
    ) -> List[VariableResolution]:
        """
        Create VariableResolution objects from resolved data.

        :param resolved_data: Dict mapping variable names to resolved values
        :returns: List of VariableResolution objects
        """
        var_resolutions = []
        for var_name, value in resolved_data.items():
            if value is not None:
                var_resolutions.append(
                    VariableResolution(
                        var=var_name,
                        value=value,
                        status=VariableResolutionStatus.RESOLVED,
                    )
                )
        return var_resolutions

    def evaluate_branches_for_patient(
        self, patient_id: str, branches: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Function to evaluate all branches for a patient.

        This wraps the WorkflowDataResolver's evaluate_workflow_branches method.

        :param patient_id: Patient ID
        :param branches: List of branch dicts with 'rule' and 'target_step_id'
        :returns: Evaluation result dict
        """
        return self.resolver.evaluate_workflow_branches(patient_id, branches)