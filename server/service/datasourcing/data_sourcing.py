from functools import reduce
from typing import Any, Callable, Dict, List


def resolve_datasources(
    patient_id: str, datasources: List[str], catalogue: Dict[str, Callable]
) -> Dict[str, Any]:
    """
    Given a a list of datastrings, returns a dict of resolved datasources

    :param patient_id: an id for identifying data relevant to a patient
    :param datasources: a list of strings representing a datasource
    :returns: a dict of resolved datasources, Any can be an int, bool, string
    :rtype: Dict[str, Any]
    """

    def ds_fold(a: Dict, ds: str):
        a[ds] = resolve_datastring(patient_id, ds, catalogue)
        return a

    # TODO: more efficient querying

    return reduce(ds_fold, datasources, {})


def resolve_datastring(
    patient_id: str, data_string: str, catalogue: Dict[str, Callable]
) -> Any:
    """
    Takes a datastring and resolves it into a concrete value

    :param patient_id: an id for identifying data relevant to a patient
    :param data_string: a string representing a source of value of format `$table.column`
    :param catalogue: a dict representing valid data strings that can be resolved
    :returns: a resolved value
    :rtype: any type of int, float, bool, string, char, None if not found
    """
    col = __parse_column_name(data_string)
    query = catalogue.get(data_string)

    if query is None:
        return None

    return query(id=patient_id, column=col)


def __parse_column_name(data_string: str) -> str:
    return data_string.split(".")[-1]


def __parse_table_name(data_string: str) -> str:
    return data_string.split(".")[0][1:]
