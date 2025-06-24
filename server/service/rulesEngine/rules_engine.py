class RulesEngineFacade:
    """
        An abstraction layer for the underlying Rules Engine Implementation
    """
    
    def __init__(self, args, ruleGroup, rules):
        """
        Initializes the rules engine
        
        :param a: list of args used in the rules
        :param b: a ruleGroup, defines how we want to combine given list of rles
        :param c: list of rules
        :rtype: RulesEngineFacade
        """
        self.rulesEngine = RulesEngineImpl2(args, ruleGroup, rules)

    def evaluate(self, input):
        """
        Evaluate the given rules

        :param a: input object
        :rtype: bool
        """
        return self.rulesEngine.evaluate(input)


# NOTE: Currently will keep this empty/incomplete, 
# implementation heavily depends on chosen Rules Engine
# - ref: https://github.com/nadirizr/json-logic-py
from json_logic import jsonLogicRE
class RulesEngineImpl1:
    """
    example
    rules = { "and" : [
        {"<" : [ { "var" : "temp" }, 110 ]},
        {"==" : [ { "var" : "pie.filling" }, "apple" ] }
    ] }

    data = { "temp" : 100, "pie" : { "filling" : "apple" } }
    """
    
    def __init__(self, args, rg, rules):
        self.parsed_rules = self._parsed_rules(args, rg, rules)

    def evaluate(self, input):
        res = jsonLogicRE(self.parsed_rules, input)
        # process result
        return res

    def _parsed_rules(self, args, rg, rules):
        """
        args - list of args to be used in the rules
        args = [
            {
                "argId": "",
                "name": ""
                "value": ""
            }
        ]
        
        rules - a list of rules
        "leftOp" is the input we are evaluating
            - { "var": "<name of variable>"} 
        "rightOp" is the argument the rule is comparing against
            - constant value or from a datasource
            - populate "rightOp", match against an id?
        [
            {
                "ruleId" : "",
                "operator": "",
                "leftOp": "",
                "rightOp": "<argId>"
            }
        ]

        rg - a rule group, combines list of rules
        rg = {
            "op1" : ["<ruleId1>", "ruleId2>],
            "op2" : ["<ruleId3>", "<ruleId4>"]
        }


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