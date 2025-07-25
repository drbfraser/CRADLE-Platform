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
import data_catalouge as dc

class WorkflowDatasourcing:
    # NOTE: a format overhaul may be needed in system data
    #       as a way to conform with data resolution structures
    #       or we have custom logic per data strings
    #       realistically we have this layer for translating between, it also allows us to add our own behavior
    #       e.g. "$patient.age", `age` is not a column that exists, but we can define behavior for it:
    #           current date - patient.date_of_birth -> to_int
    
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
        col = self._parse_column_name(data_string)
        query = dc.data_catalouge.get(data_string)
    
        value = query(id=patient_id, column=col)
        
        return value

    def _parse_column_name(self, data_string: str) -> str:
        return data_string.split('.')[-1]

    def _parse_table_name(self, data_string: str) -> str:
        return data_string.split('.')[0][1:]