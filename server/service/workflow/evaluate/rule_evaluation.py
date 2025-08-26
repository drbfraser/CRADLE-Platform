from typing import Any, Dict, Type

from flask import json

import data.crud as dl
from models import WorkflowInstanceStepOrm
from service.workflow.datasourcing import data_catalogue as workflow_datacatalogue
from service.workflow.datasourcing import data_sourcing as workflow_datasourcing
from service.workflow.evaluate.rules_engine import RulesEngineFacade


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

    def __init__(
        self,
        datasourcing: workflow_datasourcing,
        rule_engine: Type[RulesEngineFacade],
    ):
        self.datasourcing = datasourcing
        self.rule_engine = rule_engine

    def get_data(self, id: str) -> tuple[str, dict[str]]:
        """
        Retrieve relevant information required for a rule evaluation

        :param id: an id for a workflow instance step
        :returns: a tuple of rule and resolved datasource strings
        """
        # can be a single query:
        #   select rg.rule, rg.datasources
        #   from workflow_template_instance_step as is
        #   join on rule_group as rg
        #   where is.id = id
        instance_step = dl.read_instance_steps(
            WorkflowInstanceStepOrm, WorkflowInstanceStepOrm.id == id
        )[0]
        rule_group = dl.read_rule_group(rule_group_id=instance_step.condition_id)

        datasources = json.loads(rule_group.data_sources)
        data_catalogue = workflow_datacatalogue.get_catalogue()
        resolved_data = self.datasourcing.resolve_datasources(
            datasources, data_catalogue
        )

        return (rule_group.rule, resolved_data)

    def evaluate_rule_engine(
        self, input_data: str, rule: str, datasources: Dict[str, Any]
    ) -> Any:
        """
        Call the engine to evaluate a rule

        :param input_data: an json object representing input data from a form
        :param rule: a rule json string
        :returns: a result object containing the evaluated result
        """
        re = self.rule_engine(datasources, rule)
        return re.evaluate(input_data)
