from typing import Dict, Any
from rules_engine import RulesEngine
from workflow_datasources import WorkflowDatasourcing
import data.crud as dl


class EvaluteResult:
    value: bool
    details: str


class WorkflowEvaluationService:
    """
    responsible for:
        1. fetching a rule, data sources
        2. calling the datasourcing service to resolve data sources
        3. calling the rule engine to evaluate
        4. handling post-processing of results

    dependencies:
    - datasource service
    - rule engine
    - datalayer crud
    """

    def __init__(self, ds, re):
        self.datasource_service = ds
        self.rule_engine_service = re

    def get_data(self, id: str) -> tuple[str, dict[str]]:
        """
        Retrieve relevant information required for a rule evaluation
        - workflow_instance_step object
        - w/ the object, get the condition_id, fetch a rule object

        get the datasource strings in the rule object, resolve the
        datasource strings via the datasource service

        :param id: an id for a workflow instance step
        :returns: a tuple of rule and resolved datasource strings
        :rtype: tuple of string and dict of strings
        """
        # TODO: Get workflow_instance_step object
        # dl.read_workflow_instance_step(wf_instance_step_id)

        # TODO: Get rule object
        # dl.read_rule()
        
        # future todo: cache the object
        rule = ""
        datasources = [""]

        # NOTE stubbed
        resolved_data = WorkflowDatasourcing.resolve_datasources(datasources)

        return (rule, resolved_data)

    def evaluate_rule_engine(
        self, input_data: str, rule: str, datasources: Dict[str, Any]
    ) -> EvaluteResult:
        """
        Call the engine to evalaute a rule
        - get a scoped instance of the rule engine
        - give it a rule group and the list of datasource args
        - handle any results if needed

        :param input_data: an json object representing input data from a form
        :param rule: a rule group json string
        :returns: a result object containing the evaluated result
        :rtype: EvaluateResult object
        """
        # "instantiate"
        re = RulesEngine(datasources, rule)

        # evaluate
        return re.evaluate(input_data)
