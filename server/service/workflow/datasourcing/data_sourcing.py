from functools import reduce
from typing import Any, Callable, Dict, List, Optional, TypeAlias, Union

ObjectResolver = Callable[[str, str], Any]
CustomResolver = Callable[[Dict], Any]

ObjectCatalogue: TypeAlias = Dict[str, Union[ObjectResolver, Dict[str, CustomResolver]]]


def parse_attribute_name(data_string: str) -> str:
    """
    Extract attribute name from a datastring.
    
    :param data_string: String in format "$object.attribute"
    :returns: The attribute name, or empty string if invalid format
    """
    if not data_string.startswith("$"):
        return ""

    parts = data_string.split(".")
    if len(parts) < 2:
        return ""
    
    return parts[1]


def parse_object_name(data_string: str) -> str:
    """
    Extract object name from a datastring.
    
    :param data_string: String in format "$object.attribute"
    :returns: The object name (without $), or empty string if invalid format
    """
    if not data_string.startswith("$"):
        return ""

    return data_string[1:].split(".")[0]


def __group_objects(accumulator: Dict[str, List[str]], datastring: str) -> Dict[str, List[str]]:
    """
    Group datastrings by object name for batch resolution.
    
    :param accumulator: Dict mapping object names to lists of attributes
    :param datastring: Single datastring to add to groups
    :returns: Updated accumulator dict
    """
    obj = parse_object_name(datastring)
    attr = parse_attribute_name(datastring)
    
    if not obj or not attr:
        return accumulator

    if obj in accumulator:
        accumulator[obj].append(attr)
    else:
        accumulator[obj] = [attr]
    
    return accumulator


def __resolve_object(
    catalogue: Dict[str, ObjectCatalogue], 
    patient_id: str, 
    object_name: str
) -> Optional[Dict[str, Any]]:
    """
    Resolve an object instance from the catalogue.
    
    :param catalogue: The data catalogue
    :param patient_id: Patient identifier for query
    :param object_name: Name of object type to resolve
    :returns: Resolved object dict or None if not found
    """
    if object_name not in catalogue:
        return None
    
    object_entry = catalogue.get(object_name)
    if not object_entry or "query" not in object_entry:
        return None
    
    object_query = object_entry.get("query")
    if object_query is None:
        return None
    
    try:
        return object_query(id=patient_id)
    except Exception:
        return None


def resolve_datasources(
    patient_id: str, datasources: List[str], catalogue: Dict[str, ObjectCatalogue]
) -> Dict[str, Any]:
    object_groups = reduce(__group_objects, datasources, {})
    resolved = {}

    for obj, attrs in object_groups.items():
        inst = __resolve_object(catalogue, patient_id, obj)

        # if object not found attributes are none
        
        if inst is None:
            for a in attrs:
                resolved[f"${obj}.{a}"] = None
            continue
        
        resolved_attrs = []

        for a in attrs:
            if inst.get(a) is not None:
                resolved_attrs.append((f"${obj}.{a}", inst.get(a)))
            else:
                ca_query = catalogue.get(obj).get("custom")
                ca_query = ca_query.get(a)
                ca_value = None

                if ca_query is not None:
                    ca_value = ca_query(inst)

                resolved_attrs.append((f"${obj}.{a}", ca_value))

        resolved.update(dict(resolved_attrs)) 

    return resolved


def resolve_datastring(
    patient_id: str, data_string: str, catalogue: Dict[str, ObjectCatalogue]
) -> Any:
    """
    Resolve a single datastring into a concrete value.

    :param patient_id: An id for identifying data relevant to a patient
    :param data_string: A string representing a data source in format "$object.attribute"
    :param catalogue: The data catalogue of supported objects
    :returns: A resolved value (int, float, bool, string, etc.) or None if not found
    :rtype: Any
    """
    obj_name = parse_object_name(data_string)
    attr_name = parse_attribute_name(data_string)
    
    if not obj_name or not attr_name:
        return None
    
    if obj_name not in catalogue:
        return None
    
    obj_entry = catalogue.get(obj_name)
    if not obj_entry or "query" not in obj_entry:
        return None
    
    query = obj_entry["query"]
    if query is None:
        return None

    try:
        obj_instance = query(id=patient_id)
    except Exception:
        return None
    
    if obj_instance is None:
        return None
    
    if attr_name in obj_instance:
        return obj_instance[attr_name]
    
    if "custom" in obj_entry and attr_name in obj_entry["custom"]:
        custom_query = obj_entry["custom"][attr_name]
        try:
            return custom_query(obj_instance)
        except Exception:
            return None
    
    return None