from python_rule_engine import re

# Facade for the rules engine
class RulesEngine:
    """
        an abstraction layer, calls the underlying implementation: _RulesEngine
    """
    def __init__(self):
        self.rulesEngine = _RulesEngine()

    def evaluate(self):
        return self.rulesEngine.evaluate()


# actual rules engine implementation
class _RulesEngine:
    rule_group_template = {
        "name": "",
        "conditions": {
            "all": [
            ]
        }
    }
    
    rule_template = {
        "path": "",
        "operator": "",
        "value": ""
    }

    def __init__(self, rules, datasources):
        rules = self._parse_rules(rules, datasources)
        self.engine = re.RuleEngine(rules)

    def evaluate(self, inputs):
        # the input object to evaluate
        obj = {
            "person": {
                "name": "Lionel",
                "last_name": "Messi"
            }
        }

        results = self.engine.evaluate(obj)
        # do post processing work
        return results


    def _parse_rules(self, rules, datasources):
        # match ids in datasources list, into the rules
        datasources

        # construct a rule group with templates
        # treat as a dict
        '''
        example
        rule = {
            "name": "<name of the rule>",
            "conditions": {
                "all": [
                    {
                        # JSONPath support
                        "path": "$.person.name",
                        "operator": "equal",
                        "value": "<hard coded or data source>"
                    },
                    {
                        "path": "$.person.last_name",
                        "operator": "equal",
                        "value": "<hard coded or data source>"
                    }
                ]
            }
        }
        '''
        rule_group = self.rule_group_template

    
        return rule_group


__all__ = ['RulesEngine']