# TODO: create an interface out of this?
#       -> can make mocks for testing (but idk if it is "pythonic")
class WorkflowRuleEvaluationService:
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
    
    def get_data(self):
        """
        get workflow data
        - rule group
        - rules

        :param a: rule group id
        :rtype: a rule group object
        """        
        pass

    def _process_arguments(self):
        """
        get and process arguments
        """
        pass

    def evaluate_rule_engine(self):
        """
        call the rules engine
        """
        pass

    def _handle_result(self):
        pass