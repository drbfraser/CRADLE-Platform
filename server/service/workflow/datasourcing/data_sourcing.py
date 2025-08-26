from functools import reduce
from typing import Any, Callable, Dict, List, TypeAlias, Union

ObjectResolver = Callable[[str, str], Any]
CustomResolver = Callable[[Dict], Any]

ObjectCatalogue: TypeAlias = Dict[str, Union[ObjectResolver, Dict[str, CustomResolver]]]


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


def __group_objects(a: Dict[str, List[str]], ds: str):
    object = parse_object_name(ds)
    attr = parse_attribute_name(ds)

    if object in a:
        a[object].append(attr)
    else:
        a[object] = [attr]
    return a


def __resolve_object(catalogue: Dict, patient_id: str, object_name: str) -> Dict:
    object_query = catalogue.get(object_name).get("query")
    return object_query(id=patient_id)


def resolve_datasources(
    patient_id: str, datasources: List[str], catalogue: Dict[str, ObjectCatalogue]
) -> Dict[str, Any]:
    """
    Given a list of datastrings, returns a dict of resolved datasources

    :param patient_id: an id for identifying data relevant to a patient
    :param datasources: a list of strings representing a datasource
    :param catalogue: the data catalogue of support objects
    :returns: a dict of resolved datasources, Any can be an int, bool, string
    :rtype: Dict[str, Any]
    """
    # group datastrings by object
    object_groups = reduce(__group_objects, datasources, {})
    resolved = {}

    for obj, attrs in object_groups.items():
        inst = __resolve_object(catalogue, patient_id, obj)
        resolved_attrs = []

        for a in attrs:
            if inst.get(a) is not None:
                resolved_attrs.append((f"${obj}.{a}", inst.get(a)))
            else:
                # attempt custom attribute lookup
                ca_query = catalogue.get(obj).get("custom")
                print(ca_query)

                ca_query = ca_query.get(a)
                ca_value = None

                if ca_query is not None:
                    ca_value = ca_query(inst)

                resolved_attrs.append((f"${obj}.{a}", ca_value))

        resolved.update(resolved_attrs)

    return resolved


def resolve_datastring(
    patient_id: str, data_string: str, catalogue: Dict[str, ObjectCatalogue]
) -> Any:
    """
    Resolve a single datastring it into a concrete value

    :param patient_id: an id for identifying data relevant to a patient
    :param data_string: a string representing a source of value of format `$object.attribute`
    :param catalogue: the data catalogue of support objects
    :returns: a resolved value
    :rtype: any type of int, float, bool, string, char, None if not found
    """
    object = parse_object_name(data_string)
    attribute = parse_attribute_name(data_string)
    query = catalogue.get(object).get("query")

    if query is None:
        return None

    object: Dict = query(id=patient_id)

    return object.get(attribute)
