from data import crud
from typing import List, Dict, Any


class WorkflowDatasourcing:
    def resolve_datasources(self, datasources: List[str]) -> Dict[str, Any]:
        """
        NOTE: this is a stubbed function
        Given a a list of strings representing a data source,
        - parse and determine where this instance exists, return that value

        :param datasources: a list of strings representing a datasource
        :rtype: Dict[str, Any]
        :returns: a dict of resolved datasources, Any can be an int, bool, string
        """
        return {"$patient.age": 18, "$reading.status": "yellow"}
