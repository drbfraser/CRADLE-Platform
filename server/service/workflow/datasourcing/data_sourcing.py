from functools import reduce
from typing import Any, Callable, Dict, List


def resolve_datasources(
    patient_id: str, datasources: List[str], catalogue: Dict[str, Callable]
) -> Dict[str, Any]:
    """
    Given a list of datastrings, returns a dict of resolved datasources

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
    :param data_string: a string representing a source of value of format `$object.attribute`
    :param catalogue: a dict representing valid data strings that can be resolved
    :returns: a resolved value
    :rtype: any type of int, float, bool, string, char, None if not found
    """
    col = parse_attribute_name(data_string)
    query = catalogue.get(data_string)

    if query is None:
        return None

    return query(id=patient_id, attribute=col)


def parse_attribute_name(data_string: str) -> str:
    if not data_string.startswith("$"):
        return ""

    # "$object.attribute" -> ["$object", "attribute"]
    #  future: modify to fetch trailing attributes if required
    return data_string.split(".")[1]


def parse_object_name(data_string: str) -> str:
    if not data_string.startswith("$"):
        return ""

    # "object.attribute" -> ["object", "attribute"]
    return data_string[1:].split(".")[0]
