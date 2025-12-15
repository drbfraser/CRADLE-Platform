import logging
from typing import Any, Dict, List, Optional, Tuple

from service.workflow.datasourcing.data_catalogue import get_catalogue
from service.workflow.datasourcing.data_sourcing import (
    DatasourceVariable,
    VariableResolution,
    VariableResolutionStatus,
    resolve_variables,
)
from service.workflow.evaluate.jsonlogic_parser import extract_variables_from_rule
from service.workflow.evaluate.rules_engine import RulesEngineFacade, RuleStatus

logger = logging.getLogger(__name__)


class RuleEvaluator:
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

    def evaluate_rule(
        self, rule: Optional[str], patient_id: str
    ) -> Tuple[RuleStatus, List[VariableResolution]]:
        """
        Evaluate a rule with a given context.

        :param rule: JsonLogic rule string to evaluate
        :param patient_id: Patient ID for data resolution
        :returns: Tuple of (RuleStatus, list of VariableResolution)
        """
        if rule is None or rule == "":
            return (RuleStatus.TRUE, [])

        variable_strings = extract_variables_from_rule(rule)
        logger.debug(
            "Variables to resolve: %s for patient %s", variable_strings, patient_id
        )

        variables = [DatasourceVariable.from_string(v) for v in variable_strings]
        variables = [v for v in variables if v is not None]

        context = {"patient_id": patient_id}
        resolved_data = resolve_variables(
            context=context, variables=variables, catalogue=self.catalogue
        )

        logger.debug("Resolved data for context %s: %s", context, resolved_data)

        missing_vars = [k for k, v in resolved_data.items() if v is None]
        if missing_vars:
            logger.info(
                "Missing data for variables: %s for context %s", missing_vars, context
            )
            var_resolutions = self._create_variable_resolutions(resolved_data)
            return (RuleStatus.NOT_ENOUGH_DATA, var_resolutions)

        rule_engine = RulesEngineFacade(rule=rule, args={})
        evaluation_result = rule_engine.evaluate(input=resolved_data)

        var_resolutions = self._create_variable_resolutions(resolved_data)

        return (evaluation_result.status, var_resolutions)

    def _create_variable_resolutions(
        self, resolved_data: Dict[str, Any]
    ) -> List[VariableResolution]:
        """
        Create VariableResolution objects from resolved data.

        TODO: Move VariableResolution creation to resolve_variables() for finer-grained
        error status. This requires updating _resolve_object() to preserve error context.

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
            else:
                var_resolutions.append(
                    VariableResolution(
                        var=var_name,
                        value=None,
                        status=VariableResolutionStatus.OBJECT_NOT_FOUND,
                    )
                )
        return var_resolutions
