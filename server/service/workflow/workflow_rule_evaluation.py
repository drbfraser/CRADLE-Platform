from typing import Any, Dict

from flask import json
from workflow_datasources import WorkflowDatasourcing

import data.crud as dl
from models import WorkflowInstanceStepOrm


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

    def __init__(self, datasource, rule_engine):
        self.datasource = datasource
        self.rule_engine = rule_engine

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
        # can be a single query:
        #   select rg.rule, rg.datasources
        #   from workflow_template_instance_step as is
        #   join on rule_group as rg
        #   where is.id = id
        instance_step = dl.read_instance_steps(WorkflowInstanceStepOrm, WorkflowInstanceStepOrm.id == id)[0]
        rule_group = dl.read_rule_group(rule_group_id=instance_step.condition_id)

        rule = rule_group.rule
        datasources = json.loads(rule_group.data_sources)

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
        re = self.rule_engine.RulesEngine(datasources, rule)

        # evaluate
        return re.evaluate(input_data)
