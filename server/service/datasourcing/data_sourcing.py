'''
Datasourcing service component
- for taking datasource strings and resolving them  

todo:
1. defining data layer operations for resolving data strings
2. handling null values during resolution
3. tests
'''

import uuid
from uuid import UUID
from data import crud
from typing import List, Dict, Any
from functools import reduce

class WorkflowDatasourcing:
    def resolve_datasources(self, patient_id: UUID, datasources: List[str]) -> Dict[str, Any]:
        """
        Given a a list of data strings
        - parse, query and return that value

        :param patient_id: a uuid for identifying data relevant to a patient
        :param datasources: a list of strings representing a datasource
        :returns: a dict of resolved datasources, Any can be an int, bool, string
        :rtype: Dict[str, Any]
        """
        resolved = {}
        for ds in datasources:
            value = self.resolve_datastring(patient_id, ds)
            resolved[ds] = value
        return resolved

    def resolve_datastring(self, patient_id: UUID, data_string: str) -> Any:
        """
        Takes a string and resolves it into a concrete value

        Format of the string: $table.column
        - "$" is an identifier reserved to distinguish between a regular
          string and a datasource string
        
        :param data_string: a string representing a source of value
        :returns: a resolved value
        :rtype: any type of int, float, bool, string, char, etc.
        """
        pass