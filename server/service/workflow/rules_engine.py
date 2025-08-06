import json
from typing import Any, Dict

from json_logic import jsonLogic


class RulesEngineFacade:
    """
    An abstraction layer for the underlying Rules Engine Implementation
    """

    def __init__(self, rule: str, args: Dict[str, Any]):
        """
        Initializes the rules engine

        :param rule: a json object defining how we want to combine given list of rules
        :param args: dict of resolved datasources used in the rules
        :returns: an instance of RulesEngineFacade
        :rtype: RulesEngineFacade
        """
        self.__rules_engine = RulesEngineImpl(rule, args)

    def evaluate(self, input: Dict[str, Any]) -> Any:
        """
        Evaluate the given rules

        :param input: an input data object
        :returns: an evaluated result
        """
        return self.__rules_engine.evaluate(input)


class RulesEngineImpl:
    """
    Rule Engine Implementation

    refer to: 
    - https://github.com/maykinmedia/json-logic-py
    - https://jsonlogic.com/operations.html
    """

    def __init__(self, rule: str, args: Dict[str, Any]):
        self.args: Dict[str, Any] = args
        self.rule = self._parse_rules(rule)

    def _parse_rules(self, rule: str) -> Dict:
        """
        Attempt to deserialize a rule string into a rule object ready for evaluation

        :param rule: a string representing a rule
        :returns: a dict representing a rule
        :rtype: Dict
        :raises: JSONDecodeError
        """
        try:
            rule = json.loads(rule)
            return rule
        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(e)

    def evaluate(self, input: Dict) -> Any:
        """
        Evaluate a parsed rule and given input
        
        :param input: an input data object
        :returns: the result from jsonLogic
        :rtype: Any
        """
        # inject datasources into the input data object
        # let jsonlogic do resolution for us
        for key, value in self.args.items():
            input[key] = value

        return jsonLogic(self.rule, input)
