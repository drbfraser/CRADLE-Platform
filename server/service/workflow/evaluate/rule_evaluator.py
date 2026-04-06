import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Set, Tuple

from service.workflow.datasourcing.data_catalogue import get_catalogue
from service.workflow.datasourcing.data_sourcing import (
    MISSING,
    WORKFLOW_VARIABLE_NAMESPACE,
    DatasourceVariable,
    VariablePath,
    VariableResolution,
    VariableResolutionStatus,
    resolve_collection_variables,
    resolve_variables,
    resolve_workflow_namespace_variables,
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
        self,
        rule: Optional[str],
        patient_id: str,
        workflow_instance_id: Optional[str] = None,
        current_user: Optional[Dict[str, Any]] = None,
    ) -> Tuple[RuleStatus, List[VariableResolution]]:
        """
        Evaluate a rule with a given context.

        :param rule: JsonLogic rule string to evaluate
        :param patient_id: Patient ID for data resolution
        :param workflow_instance_id: When set, enables ``wf.*`` and ties them to this instance
        :param current_user: User context for ``current-user.*`` system variables.
                             When omitted, ``current-user.*`` will resolve as missing.
        :returns: Tuple of (RuleStatus, list of VariableResolution)
        """
        if rule is None or rule == "":
            return (RuleStatus.TRUE, [])

        variable_strings = extract_variables_from_rule(rule)
        logger.debug(
            "Variables to resolve: %s for patient %s", variable_strings, patient_id
        )

        # Split variables into simple datasource variables and collection-based paths.
        collection_namespaces = {
            "vitals",
            "pregnancies",
            "referrals",
            "assessments",
            "forms",
            "all_wf",
        }

        collection_paths = []
        wf_paths: List[VariablePath] = []
        simple_variables = []
        system_literal_vars: Set[str] = set()
        current_user_vars: Set[str] = set()

        system_literal_var_names = {"local-date", "local-time", "local-date-time"}
        current_user_prefix = "current-user."

        for var_str in variable_strings:
            if var_str in system_literal_var_names:
                system_literal_vars.add(var_str)
                continue
            if var_str.startswith(current_user_prefix):
                current_user_vars.add(var_str)
                continue

            vp = VariablePath.from_string(var_str)
            if vp is not None and vp.namespace in collection_namespaces:
                collection_paths.append(vp)
                continue
            if (
                vp is not None
                and vp.namespace == WORKFLOW_VARIABLE_NAMESPACE
                and vp.collection_index is None
            ):
                wf_paths.append(vp)
                continue

            dv = DatasourceVariable.from_string(var_str)
            if dv is not None:
                simple_variables.append(dv)

        context: Dict[str, Any] = {"patient_id": patient_id}
        if workflow_instance_id:
            context["workflow_instance_id"] = workflow_instance_id

        resolved_data: Dict[str, Any] = {}
        if simple_variables:
            resolved_data.update(
                resolve_variables(
                    context=context,
                    variables=simple_variables,
                    catalogue=self.catalogue,
                    use_missing_sentinel=True,
                )
            )

        if collection_paths:
            resolved_data.update(
                resolve_collection_variables(
                    context=context,
                    variable_paths=collection_paths,
                    catalogue=self.catalogue,
                    use_missing_sentinel=True,
                )
            )

        if wf_paths:
            resolved_data.update(
                resolve_workflow_namespace_variables(
                    context=context,
                    variable_paths=wf_paths,
                    use_missing_sentinel=True,
                )
            )

        # Resolve system context variables after other resolvers so they can be
        # included in ``missing_vars`` checks.
        if system_literal_vars:
            now = datetime.now()
            if "local-date" in system_literal_vars:
                resolved_data["local-date"] = now.date().isoformat()
            if "local-time" in system_literal_vars:
                resolved_data["local-time"] = now.time().isoformat()
            if "local-date-time" in system_literal_vars:
                resolved_data["local-date-time"] = now.isoformat()

        if current_user_vars:
            if current_user is None:
                for var_str in current_user_vars:
                    resolved_data[var_str] = MISSING
            else:

                def _navigate_dict_path(root: Any, path_parts: List[str]) -> Any:
                    """Navigate through dicts (and simple objects) for dotted paths."""
                    current: Any = root
                    for part in path_parts:
                        if isinstance(current, dict):
                            if part not in current:
                                return MISSING
                            current = current.get(part)
                        else:
                            if not hasattr(current, part):
                                return MISSING
                            current = getattr(current, part)

                        # Explicit nulls remain null even if there are more path parts.
                        if current is None:
                            return None
                    return current

                for var_str in current_user_vars:
                    # e.g. "current-user.name" -> ["name"]
                    field_path = var_str.split(".")[1:]
                    resolved_data[var_str] = _navigate_dict_path(
                        current_user, field_path
                    )

        logger.debug("Resolved data for context %s: %s", context, resolved_data)

        missing_vars = [k for k, v in resolved_data.items() if v is MISSING]
        if missing_vars:
            logger.info(
                "Missing data for variables: %s for context %s", missing_vars, context
            )
            var_resolutions = self._create_variable_resolutions(resolved_data)
            return (RuleStatus.NOT_ENOUGH_DATA, var_resolutions)

        # Replace sentinel values before passing to JsonLogic (should be none after the
        # missing-vars early return, but keep this defensive).
        resolved_for_engine = {
            k: (None if v is MISSING else v) for k, v in resolved_data.items()
        }

        rule_engine = RulesEngineFacade(rule=rule, args={})
        evaluation_result = rule_engine.evaluate(input=resolved_for_engine)

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
            if value is not MISSING:
                var_resolutions.append(
                    VariableResolution(
                        var=var_name,
                        value=None if value is MISSING else value,
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
