import json
from typing import Dict, Any
from json_logic import jsonLogic


class RulesEngine:
    """
    An abstraction layer for the underlying Rules Engine Implementation
    """

    def __init__(self, args: Dict[str, Any], rule: str):
        """
        Initializes the rules engine

        :param args: dict of resolved datasources used in the rules
        :param rule: a json object defining how we want to combine given list of rules
        :returns: an instance of RulesEngine
        :rtype: RulesEngine
        """
        self.rules_engine = _RulesEngineImpl(args, rule)

    def evaluate(self, input: Dict[str, Any]):
        """
        Evaluate the given rules

        :param input: an input data object
        :returns: a Result object
        :rtype: Result object
        """
        return self.rules_engine.evaluate(input)


class _RulesEngineImpl:
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
                    {"==": [{"var": "b"}, "$table.column"]},
                    {"!=": [{"var": "a"}, 15]}
                ]
            },
            {"in": ["banana", {"var": "fruits_list"}]}
        ]
    }
    """

    def __init__(self, args: Dict[str, Any], rg: str):
        self.parsed_rules = self._parse_rules(args, rg)

    def _parse_rules(self, args: Dict[str, Any], rule: str) -> Dict:
        """
        processes given input arguments and rule
        into a rule object ready for evaluation

        :param args: a dict of resolved datasource args
        :param rg: a rule object
        :returns: a dict representing a formed rule
        :rtype: Dict
        """

        # method 1
        # go through the string and look for a datastring enclosed with "$$"
        # exact that out, use as a key to search from list of datasource args
        # replace that datastring, with the matched data
        # continue until end of string

        # method 2
        # deserialize into a dict
        rule = json.loads(rule)

        # TODO
        # recursively search this dict until we find datasource strings (assume format: "$table.column")
        # update the value with list of args
        # repeat until all args are completed

        return rule

    def evaluate(self, input) -> bool:
        """
        Evaluate a parsed rule and given input
        :param input: an input data object
        :returns: the result from jsonLogic
        :rtype: a boolean
        """
        return jsonLogic(self.parsed_rules, input)
