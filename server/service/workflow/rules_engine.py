from json_logic import jsonLogic

class RulesEngineFacade:
    """
    An abstraction layer for the underlying Rules Engine Implementation
    """
    def __init__(self, args, ruleGroup, rules):
        """
        Initializes the rules engine
 
        :param a: list of data args used in the rules
        :param b: a json object defining how we want to combine given list of rules
        :param c: list of rules
        :rtype: RulesEngineFacade
        """
        self.rulesEngine = RulesEngineImpl(args, ruleGroup, rules)

    def evaluate(self, input):
        """
        Evaluate the given rules

        :param a: an input data object
        :rtype: bool
        """
        return self.rulesEngine.evaluate(input)


class RulesEngineImpl:    
    """
    example 1
    {
        "and": [
            { ">" : [ {"var": "age"}, 18 ] },
            { "==" : [ {"var": "reading.status" }, "yellow"] }
        ]
    }
    example 2
    {
        "and": [
            { "<" : [{"var": "age"}, 18]},
            {
                "or": [
                    {"==": [{"var": "b"}, "$table.column$"]},
                    {"!=": [{"var": "a"}, 15]}
                ]
            },
            {"in": ["banana", {"var": "fruits_list"}]}
        ]
    }
    """
    def __init__(self, args, rg, _):
        self.parsed_rules = self._parse_rules(args, rg, _)
        
    def _parse_rules(self, args, rg, _):
        """
        processes given input arguments and rule group 
        into a rule object ready for evaluation 
        
        :param a: list of data source args
        :param b: a rule group object combining the rules
        :param c: unsused
        :rtype: a json object representing a formed rule
        """

        # method 1
        # go through the string and look for a datastring enclosed with "$$"
        # exact that out, use as a key to search from list of datasource args
        # replace that datastring, with the matched data
        # continue until end of string

        # method 2
        # deserialize into a dict
        # recursively search this dict until we find datasource strings (assume format: $table.column$)
        # update the value with list of args
        # repeat until all args are completed
        return ""
        
    def evaluate(self, input):
        res = jsonLogic(self.parsed_rules, input)
        return True