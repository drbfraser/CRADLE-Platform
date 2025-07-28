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
    example 1 -- fixed data
    {
        "and": [
            { ">" : [ {"var": "age"}, 18 ] },
            { "==" : [ {"var": "reading.status" }, "yellow"] }
        ]
    }
    example 2 -- complex: fixed, lists, datasourcing w/ default values
    - every datasource string would be in the form: {"var": ["$table.column", <default value>]}
    - resolved datasource dne -> don't need to include it / give it a value of None
    {
        "and": [
            { "<" : [{"var": "age"}, 18]},
            {
                "or": [
                    {"==": [{"var": "b"}, {"var": ["$table.column"}, <default value>]]},
                    {"!=": [{"var": "a"}, 15]}
                ]
            },
            {"in": ["banana", {"var": "fruits_list"}]}
        ]
    }

    -- if we want date eval, FE will need to handle logic around getting this

    example 3 -- dates
    - predicates/input data we expect to be dates is a value in a `{"date": ... }` dict
    - applies for variables and constant data
    - data format: a date string: "yyyy-mm-dd"
    - {"today": []} operator gets current date (replace w/ a `{"date": ...}` obj)
    {
        "<=": [
            {"date": {"var": "testDate"}}, {"date": "2021-01-01"}
        ]
    }
    
    example 4 -- date times
    - same idea as example 3, datetimes are in a `{"datetime": ... }` dict
    - data format: a datetime string
    - some special work will need to be done if we want to get current datetime
       - i.e. introduce our own operator (switch to another implementation)
       - learn and experiment w/ the datetime operations to compose a way to compare
         e.g. on a patients age, but computing it via rules
    {
        "<=": [
            {"datetime": {"var": "testDatetime"}},
            {"datetime": "2022-12-01T10:00:00.000+02:00"},
        ]
    }
    e.g.: 
    {
        "-": [
            {"datetime": 2022-12-01T12:00:00.000+02:00},
            {"datetime": "2022-11-01T10:00:00.000+01:00"},
        ]
    }
    - generates a ISO Duration result format, some way to interpret a result, or find another
      way to compute the given example
    """

    def __init__(self, args: Dict[str, Any], rule: str):
        self.args: Dict[str, Any] = args
        self.rule = self._parse_rules(rule)

    def _parse_rules(self, rule: str) -> Dict:
        """
        attempt to deserialize a rule string
        into a rule object ready for evaluation

        :param rule: a string representing a rule
        :returns: a dict representing a rule
        :rtype: Dict
        :raises: JSONDecodeError
        """
        try:
            rule = json.loads(rule)
            return rule
        except:
            raise json.JSONDecodeError("rule string could not be deserialized")

    def evaluate(self, input) -> bool:
        """
        Evaluate a parsed rule and given input
        :param input: an input data object
        :returns: the result from jsonLogic
        :rtype: a boolean
        """
        
        # inject datasources into the input data object
        # let jsonlogic do resolution for us 
        for key, value in self.args.items():
            input[key] = value
            
        return jsonLogic(self.rule, input)
