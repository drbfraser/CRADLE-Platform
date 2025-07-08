class RulesEngineFacade:
    """
        An abstraction layer for the underlying Rules Engine Implementation
    """

    # NOTE: do we want datasource arg processing to happen w/in the rule engine, or outside?
    #           a. keep responsibility of datasource format and processing outside of rule engine
    #           b. logic on parsing a rule is dependent on a rule, keep it in the rule engine
    def __init__(self, args, ruleGroup, rules):
        """
        Initializes the rules engine
 
        :param a: list of data args used in the rules
        :param b: a json object defining how we want to combine given list of rules
        :param c: list of rules
        :rtype: RulesEngineFacade
        """
        self.rulesEngine = RulesEngineImpl1(args, ruleGroup, rules)

    def evaluate(self, input):
        """
        Evaluate the given rules

        :param a: an input data object
        :rtype: bool
        """
        return self.rulesEngine.evaluate(input)

# NOTE: Currently will keep this empty/incomplete, 
# implementation heavily depends on chosen Rules Engine
# - ref: https://github.com/nadirizr/json-logic-py
from json_logic import jsonLogicRE
class RulesEngineImpl1:    
    def __init__(self, args, rg, rules):
        self.parsed_rules = self._parse_rules(args, rg, rules)

    def evaluate(self, input):
        """
        example
            rules = { "and" : [
                {"<" : [ { "var" : "temp" }, 110 ]},
                {"==" : [ { "var" : "pie.filling" }, "apple" ] }
            ] }

            input = { "temp" : 100, "pie" : { "filling" : "apple" } }
        """ 
        res = jsonLogicRE(self.parsed_rules, input)
        # TODO process result if needed
        return res

    def _parse_rules(self, args, rg, rules):
        """
        processes given input arguments, rules and rule group 
        into a rule object ready for evaluation 
        
        :param a: list of data source args
        :param b: a rule group object combining the rules
        :param c: list of processed rules
        :rtype: a json object representing a formed rule
        """
        pass
        
# NOTE: Currently will keep this empty/incomplete, 
# implementation heavily depends on chosen Rules Engine
# - ref: https://github.com/santalvarez/python-rule-engine
from python_rule_engine import re
class RulesEngineImpl2:
    """
    The actual implementation of the rules engine
    """
    rule_group_template = {
        "name": "",
        "conditions": {
            # all - AND, 
            # any - OR
        }
    }
    
    rule_template = {
        "path": "", # optional json path to the object
        "operator": "",
        "value": "" # fixed / variable value
    }

    def __init__(self, arguments, ruleGroup, rules):
        parsed_rules = self._parse_rules(ruleGroup, rules, arguments)
        self.engine = re.RuleEngine(parsed_rules)

    def evaluate(self, input):
        pass
        '''
        example:
        input = {
            "person": {
                "name": "Lionel",
                "last_name": "Messi"
            }
        }
        '''
        results = self.engine.evaluate(input)
        # do post processing work
        return results

    def _parse_rules(self, ruleGroup, rules, arguments):
        pass
        # match ids in datasources list, into the rules
        
        # construct a parsed_rule with templates
        # process given ruleGroup, rules and arguments into a parsed_rule
        '''
        example
        rule = {
            ## i believe this implies an engine can hold diff rules
            "name": "<name of the rule>",
            "conditions": {
                "all": [
                    {
                        # JSONPath support
                        "path": "$.person.name",
                        "operator": "equal",
                        "value": "<argument>"
                    },
                    {
                        "path": "$.person.last_name",
                        "operator": "equal",
                        "value": "<argument>"
                    }
                ]
            }
        }
        '''

        # ...
        parsed_rule = self.rule_group_template
        # if ruleGroup has "all" operator, insert it into parsed_template["conditions"]
        # ...
        
        return parsed_rule