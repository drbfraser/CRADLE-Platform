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
    
    '''
    1. parse strings, group into 
       object : [attribute]
    2. lookup object
    3. get attributes
    4. do special lookup if required
       - use queried object, if need new query, make that query
    '''

    # parse and group strings
    def group_objects(a: Dict[str, List[str]], ds: str):
        object = parse_object_name(ds)
        attr = parse_attribute_name(ds)

        if object in a:
            a[object].append(attr)
        else:
            a[object] = [attr]
        return a
    
    parsed_groups = reduce(group_objects, datasources, {})
    resolved = {}

    for obj, attrs in parsed_groups.items():
        inst = __resolve_object(catalogue, patient_id, obj)
        
        # attribute lookups 
        resolved_attrs = []

        for a in attrs:
            if inst.get(a):
                resolved_attrs.append(f"${obj}.{a}", inst.get(a))
            else:
                cl = catalogue.get(obj).get("custom")
                v = cl.get(a)
                if v:
                    resolved.append(f"${obj}.{a}", v)
        
        resolved.update(resolved_attrs)
    return resolved

def __resolve_object(catalogue: Dict, patient_id: str, object_name: str) -> Dict:
    object_query = catalogue.get(object_name).get("query")
    return object_query(id=patient_id)

def resolve_datastring(
    patient_id: str, data_string: str, catalogue: Dict[str, Callable]
) -> Any:
    """
    Resolve a single datastring it into a concrete value

    :param patient_id: an id for identifying data relevant to a patient
    :param data_string: a string representing a source of value of format `$object.attribute`
    :param catalogue: a dict representing valid data strings that can be resolved
    :returns: a resolved value
    :rtype: any type of int, float, bool, string, char, None if not found
    """
    object = parse_object_name(data_string)
    attribute = parse_attribute_name(data_string)
    query = catalogue.get(object)

    if query is None:
        return None

    object: Dict = query(id=patient_id)
    
    return object.get(attribute)
       

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
