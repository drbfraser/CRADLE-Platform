from dataclasses import dataclass
from functools import reduce
from typing import Any, Callable, Dict, List, Optional, TypeAlias, Union

from pydantic import BaseModel

# Import Pydantic models
from validation.patients import PatientModel
from validation.readings import ReadingModel, UrineTestModel
from validation.assessments import AssessmentModel
from validation.pregnancies import PregnancyModel

ObjectResolver = Callable[[str, str], Any]
CustomResolver = Callable[[Dict], Any]

ObjectCatalogue: TypeAlias = Dict[str, Dict[str, Any]]

# WorkflowContext: Context information for resolving workflow data
WorkflowContext: TypeAlias = Dict[str, str]

DataModel = Union[
    PatientModel,
    ReadingModel,
    AssessmentModel,
    PregnancyModel,
    UrineTestModel,
]

MODEL_REGISTRY: Dict[str, type[BaseModel]] = {
    "patient": PatientModel,
    "reading": ReadingModel,
    "assessment": AssessmentModel,
    "pregnancy": PregnancyModel,
    "urine_test": UrineTestModel,
}


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
    """
    obj: DatasourceObject
    attr: DatasourceAttribute

    @classmethod
    def from_string(cls, variable: str) -> Optional["DatasourceVariable"]:
        """Parse a string variable into a DatasourceVariable."""
        parts = variable.split(".")
        if len(parts) < 2:
            return None

        obj_name = parts[0]
        attr_name = parts[1]

        if not obj_name or not attr_name:
            return None

        return cls(
            obj=DatasourceObject(name=obj_name),
            attr=DatasourceAttribute(name=attr_name),
        )

    def to_string(self) -> str:
        """Convert back to string format."""
        return f"{self.obj.name}.{self.attr.name}"

    def __str__(self) -> str:
        return self.to_string()

    def __hash__(self) -> int:
        return hash((self.obj.name, self.attr.name))


def _group_objects(
    accumulator: Dict[str, List[DatasourceAttribute]], 
    variable: DatasourceVariable
) -> Dict[str, List[DatasourceAttribute]]:
    """Group variables by object name for batch resolution."""
    obj_name = variable.obj.name

    if obj_name in accumulator:
        accumulator[obj_name].append(variable.attr)
    else:
        accumulator[obj_name] = [variable.attr]

    return accumulator


def _resolve_object(
    catalogue: Dict[str, ObjectCatalogue], 
    context: WorkflowContext, 
    object_name: str
) -> Optional[BaseModel]:
    """
    Resolve an object instance from the catalogue and return as a Pydantic model.

    :param catalogue: The data catalogue
    :param context: Workflow context containing IDs (e.g., {"patient_id": "p123"})
    :param object_name: Name of object type to resolve (e.g., "patient", "assessment")
    :returns: Pydantic model instance or None if not found
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
        dict_data = object_query(id=id_value)
        
        if dict_data is None:
            return None
        
        model_class = MODEL_REGISTRY.get(object_name)
        if model_class is None:
            raise ValueError(f"No Pydantic model registered for {object_name}")
        
        return model_class(**dict_data)
        
    except Exception as e:
        import sys
        print(f"Error resolving {object_name}: {e}", file=sys.stderr)
        return None


def resolve_variables(
    context: WorkflowContext,
    variables: List[DatasourceVariable],
    catalogue: Dict[str, ObjectCatalogue],
) -> Dict[str, Any]:
    """
    Resolve multiple variables into their concrete values.

    :param context: Workflow context containing IDs (e.g., {"patient_id": "p123", "assessment_id": "a456"})
    :param variables: List of DatasourceVariable objects to resolve
    :param catalogue: The data catalogue of supported objects
    :returns: Dict mapping variable names to resolved values
    """
    object_groups = reduce(_group_objects, variables, {})
    resolved = {}

    for obj_name, attrs in object_groups.items():
        model_instance = _resolve_object(catalogue, context, obj_name)

        if model_instance is None:
            # If object not found, all its attributes are None
            for attr in attrs:
                variable_key = f"{obj_name}.{attr.name}"
                resolved[variable_key] = None
            continue

        for attr in attrs:
            variable_key = f"{obj_name}.{attr.name}"

            attr_value = getattr(model_instance, attr.name, None)

            if attr_value is not None:
                resolved[variable_key] = attr_value
            else:
                custom_queries = catalogue.get(obj_name, {}).get("custom", {})
                custom_query = custom_queries.get(attr.name)
                
                if custom_query is not None:
                    model_dict = model_instance.model_dump()
                    ca_value = custom_query(model_dict)
                    resolved[variable_key] = ca_value
                else:
                    resolved[variable_key] = None

    return resolved


def resolve_variable(
    context: WorkflowContext,
    variable: DatasourceVariable,
    catalogue: Dict[str, ObjectCatalogue],
) -> Any:
    """
    Resolve a single variable into a concrete value.

    :param context: Workflow context containing IDs
    :param variable: DatasourceVariable object to resolve
    :param catalogue: The data catalogue of supported objects
    :returns: Resolved value or None if not found
    """
    obj_name = variable.obj.name
    attr_name = variable.attr.name

    model_instance = _resolve_object(catalogue, context, obj_name)

    if model_instance is None:
        return None

    attr_value = getattr(model_instance, attr_name, None)

    if attr_value is not None:
        return attr_value

    custom_queries = catalogue.get(obj_name, {}).get("custom", {})
    custom_query = custom_queries.get(attr_name)

    if custom_query is not None:
        model_dict = model_instance.model_dump()
        return custom_query(model_dict)

    return None