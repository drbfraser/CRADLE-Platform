from data import crud

"""
1. given inputs from `workflow_evaluate.py`
    - get workflow rule group
    - get rule group's rules
    - process the rules to get arguments
        - datasources -- a "pointer" to where this data lies in
        - constants -- in the rules themselves
        
2. collect rule arguments into a list, wrap as structured object
    - query datasources
    - insert constants

3. pass into rule engine
    a. rule group
    b. list of rules
    c. list of arguments

4. parse result, handle next step
"""

class WorkflowEvaluation:
    def __init__(self):
        """
        call stuff here
        """
        pass

    def get_data(self):
        """
        get workflow data
        """
        pass

    def process_arguments(self):
        """
        get and process arguments
        """
        pass

    def evaluate_rule_engine(self):
        """
        call the rules engine
        """
        pass

    def handle_result(self):
        pass