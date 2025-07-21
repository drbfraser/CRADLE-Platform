# TODO: create an interface out of this?
#       -> can make mocks for testing (but idk if it is "pythonic")
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
        1. fetching rule groups, rules, data sources
        2. do (any) pre-processing
        3. calling the rule engine
        4. handling post-processing of results

    1. given inputs from `workflow_evaluate.py`
        - get workflow rule group by rule group id
        - get rule group's rules
        - process the rules to get arguments (or even better, have predfined list, so we skip this step)
            - datasources -- a "pointer" to where this data lies in
            - constants -- dont do anything
        
    2. collect rule arguments into a list, wrap as structured object, included with inputs
        - query datasources
        
    3. pass into rule engine
        a. rule group
        b. list of rules
        c. list of arguments

    4. parse result, handle next step

    dependencies:
    - rule engine facade/interface
    - datasource service facade/interface
    """
    def __init__(self, ds, re):
        self.datasource_service = ds
        self.rule_engine_service = re 
    
    def get_data(self, wf_instance_step_id: str) -> tuple[str, dict[str]]:
        """
        Retrieve relevant information required for a rule evaluation
        - workflow_instance_step object
        - w/ the object, get the condition_id, fetch a rule_group object

        get the datasource strings in the rule_group object, resolve the 
        datasource strings via the datasource service
        
        :param wf_instance_step_id: an id for a workflow instance step
        :rtype: a tuple of rule_group and resolved datasource strings 
        """
        # TODO: Get workflow_instance_step object
        # dl.read_workflow_instance_step(wf_instance_step_id)

        # TODO: Get rule_group object
        # dl.read_rule_group()
        rule_group = ""
        datasources = [""]

        # NOTE stubbed
        # Resolve the datasource strings
        # returns a dict { "datasource_key":"value" }
        resolved_data = WorkflowDatasourcing.resolve_datasources(datasources)
        
        return (rule_group, resolved_data)

    def evaluate_rule_engine(self, input_data: str, rule_group: str, datasources: Dict[str, Any]) -> EvaluteResult:
        """
        Call the engine to evalaute a rule
        - get a scoped instance of the rule engine
        - give it a rule group and the list of datasource args
        - handle any results if needed

        :param input_data: an json object representing input data from a form
        :param rule_group: a rule group json string
        :rtype: a EvalauteResult object containing the evalauted result
        """
        # "instantiate"
        re = RulesEngine(datasources, rule_group)

        # evaluate
        return re.evaluate(input_data)