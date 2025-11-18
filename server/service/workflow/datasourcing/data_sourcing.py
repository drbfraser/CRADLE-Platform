from dataclasses import dataclass
from functools import reduce
from typing import Any, Callable, Dict, List, Optional, TypeAlias

ObjectResolver = Callable[[str, str], Any]
CustomResolver = Callable[[Dict], Any]

ObjectCatalogue: TypeAlias = Dict[str, Dict[str, Any]]

# WorkflowContext: Context information for resolving workflow data
# 
# Contains identifiers needed to fetch data during workflow execution.
# Required keys:
#   - "patient_id": Primary patient identifier 
# 
# Optional keys (may be present depending on workflow step):
#   - "assessment_id": For assessment-specific queries
#   - "reading_id": For reading-specific queries
#   - Any other entity IDs needed for data resolution
#
# Example: {"patient_id": "p123", "assessment_id": "a456"}
WorkflowContext: TypeAlias = Dict[str, str]


@dataclass(frozen=True)
class DatasourceAttribute:
    """Represents an attribute name in a datasource variable (e.g., 'age' in 'patient.age')"""
    name: str


@dataclass(frozen=True)
class DatasourceObject:
    """Represents an object name in a datasource variable (e.g., 'patient' in 'patient.age')"""
    name: str


@dataclass(frozen=True)
class DatasourceVariable:
    """
    Represents a complete datasource variable (e.g., 'patient.age').
    
    Composed of an object name and attribute name.
    This provides type safety over raw string manipulation.
    """
    obj: DatasourceObject
    attr: DatasourceAttribute
    
    @classmethod
    def from_string(cls, variable: str) -> Optional['DatasourceVariable']:
        """
        Parse a string variable into a DatasourceVariable.
        
        :param variable: String in format "object.attribute"
        :returns: DatasourceVariable or None if invalid format
        """
        parts = variable.split(".")
        if len(parts) < 2:
            return None
        
        obj_name = parts[0]
        attr_name = parts[1]
        
        if not obj_name or not attr_name:
            return None
        
        return cls(
            obj=DatasourceObject(name=obj_name),
            attr=DatasourceAttribute(name=attr_name)
        )
    
    def to_string(self) -> str:
        """
        Convert back to string format.
        
        :returns: String in format "object.attribute"
        """
        return f"{self.obj.name}.{self.attr.name}"
    
    def __str__(self) -> str:
        return self.to_string()
    
    def __hash__(self) -> int:
        return hash((self.obj.name, self.attr.name))


def __group_objects(
    accumulator: Dict[str, List[DatasourceAttribute]], 
    variable: DatasourceVariable
) -> Dict[str, List[DatasourceAttribute]]:
    """
    Group variables by object name for batch resolution.
    
    :param accumulator: Dict mapping object names to lists of attributes
    :param variable: DatasourceVariable to add to groups
    :returns: Updated accumulator dict
    """
    obj_name = variable.obj.name
    
    if obj_name in accumulator:
        accumulator[obj_name].append(variable.attr)
    else:
        accumulator[obj_name] = [variable.attr]
    
    return accumulator


def __resolve_object(
    catalogue: Dict[str, ObjectCatalogue], 
    context: WorkflowContext, 
    object_name: str
) -> Optional[Dict[str, Any]]:
    """
    Resolve an object instance from the catalogue.
    
    :param catalogue: The data catalogue
    :param context: Workflow context containing IDs
    :param object_name: Name of object type to resolve (e.g., "patient", "assessment")
    :returns: Resolved object dict with model attributes, or None if not found
    
    The resolved object dict is a flat dictionary containing the model's attributes.
    Example for a patient object:
        {
            "id": "patient_123",
            "first_name": "John",
            "last_name": "Doe",
            "sex": "MALE",
            "age": 25
        }

    TODO: Consider returning Pydantic models instead of dicts for better type safety.
    """
    if object_name not in catalogue:
        return None
    
    object_entry = catalogue.get(object_name)
    if not object_entry or "query" not in object_entry:
        return None
    
    object_query = object_entry.get("query")
    if object_query is None:
        return None
    
    id_value = context.get(f"{object_name}_id") or context.get("patient_id")
    
    if id_value is None:
        return None
    
    try:
        return object_query(id=id_value)
    except Exception:
        return None


def resolve_variables(
    context: WorkflowContext, 
    variables: List[DatasourceVariable], 
    catalogue: Dict[str, ObjectCatalogue]
) -> Dict[str, Any]:
    """
    Resolve multiple variables into their concrete values.
    
    :param context: Workflow context containing IDs 
    :param variables: List of DatasourceVariable objects to resolve
    :param catalogue: The data catalogue of supported objects
    :returns: A dict mapping variable names (strings) to their resolved values
    :rtype: Dict[str, Any]
    """
    object_groups = reduce(__group_objects, variables, {})
    resolved = {}

    for obj_name, attrs in object_groups.items():
        inst = __resolve_object(catalogue, context, obj_name)
        
        if inst is None:
            # If object not found, all its attributes are None
            for attr in attrs:
                variable_key = f"{obj_name}.{attr.name}"
                resolved[variable_key] = None
            continue
        
        resolved_attrs = []

        for attr in attrs:
            variable_key = f"{obj_name}.{attr.name}"
            
            if inst.get(attr.name) is not None:
                resolved_attrs.append((variable_key, inst.get(attr.name)))
            else:
                ca_query = catalogue.get(obj_name).get("custom")
                ca_query = ca_query.get(attr.name)
                ca_value = None

                if ca_query is not None:
                    ca_value = ca_query(inst)

                resolved_attrs.append((variable_key, ca_value))

        resolved.update(dict(resolved_attrs))

    return resolved


def resolve_variable(
    context: WorkflowContext, 
    variable: DatasourceVariable, 
    catalogue: Dict[str, ObjectCatalogue]
) -> Any:
    """
    Resolve a single variable into a concrete value.

    :param context: Workflow context containing IDs
    :param variable: DatasourceVariable object to resolve
    :param catalogue: The data catalogue of supported objects
    :returns: A resolved value (int, float, bool, string, etc.) or None if not found
    :rtype: Any
    """
    obj_name = variable.obj.name
    attr_name = variable.attr.name
    
    if obj_name not in catalogue:
        return None
    
    obj_entry = catalogue.get(obj_name)
    if not obj_entry or "query" not in obj_entry:
        return None
    
    query = obj_entry["query"]
    if query is None:
        return None

    id_value = context.get(f"{obj_name}_id") or context.get("patient_id")
    
    if id_value is None:
        return None

    try:
        obj_instance = query(id=id_value)
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