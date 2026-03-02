import logging
import re
from dataclasses import dataclass
from functools import reduce
from typing import Any, Callable, Dict, List, Optional, TypeAlias, Union

from pydantic import BaseModel

from enums import StrEnum
from validation.assessments import AssessmentModel
from validation.patients import PatientModel
from validation.pregnancies import PregnancyModel
from validation.readings import ReadingModel, UrineTestModel

ObjectResolver = Callable[[str, str], Any]
CustomResolver = Callable[[Dict], Any]

ObjectCatalogue: TypeAlias = Dict[str, Dict[str, Any]]

# ResolverContext: Context information for resolving data
# Contains ID mappings for data resolution, e.g., {"patient_id": "p123", "assessment_id": "a456"}
ResolverContext: TypeAlias = Dict[str, str]

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


class VariableResolutionStatus(StrEnum):
    """Status codes for variable resolution"""

    RESOLVED = "RESOLVED"
    DATABASE_ERROR = "DATABASE_ERROR"
    OBJECT_NOT_FOUND = "OBJECT_NOT_FOUND"


class VariableResolution(BaseModel):
    """
    Represents the resolution of a single variable to its data value.

    :param var: Variable name (e.g., "patient.age")
    :param value: Resolved value (None if not resolved)
    :param status: Resolution status
    """

    var: str
    value: Optional[Union[int, float, str, bool]] = None
    status: VariableResolutionStatus


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
        """
        Parse a string variable into a DatasourceVariable.

        Only supports simple object.attribute format (e.g. patient.age).
        Returns None for collection-indexed paths (e.g. vitals[latest].systolic);
        use VariablePath.from_string() for those.
        """
        if not variable or "[" in variable:
            return None
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


@dataclass(frozen=True)
class VariablePath:
    """
    Represents a parsed variable path with optional collection indexing.

    Supports:
    - Simple: patient.age -> namespace="patient", collection_index=None, field_path=["age"]
    - Collection indexed: vitals[latest].systolic -> namespace="vitals", index="latest", field_path=["systolic"]
    - Nested: vitals[latest].urine_test.leukocytes -> field_path=["urine_test", "leukocytes"]
    - Collection size: vitals.size -> namespace="vitals", field_path=["size"]
    """

    namespace: str
    collection_index: Optional[Union[str, int]]
    field_path: List[str]

    @classmethod
    def from_string(cls, variable: str) -> Optional["VariablePath"]:
        """
        Parse a variable string into a VariablePath.

        Handles:
        - object.attribute (patient.age)
        - object.attribute.nested (patient.medical_history.x)
        - collection[index].field (vitals[latest].systolic, vitals[1].systolic)
        - collection[index].nested.field (vitals[latest].urine_test.leukocytes)
        - collection.size (vitals.size)
        - Namespaces with hyphens (current-user.name)
        """
        if not variable or not variable.strip():
            return None
        s = variable.strip()

        # Match collection indexing: name[index] or name[index].path.path
        bracket_match = re.match(r"^([^\[]+)\[([^\]]+)\](.*)$", s)
        if bracket_match:
            namespace = bracket_match.group(1).rstrip(".")
            index_str = bracket_match.group(2).strip().lower()
            rest = bracket_match.group(3).strip()
            if rest.startswith("."):
                rest = rest[1:].strip()

            if index_str == "latest":
                collection_index: Optional[Union[str, int]] = "latest"
            else:
                try:
                    collection_index = int(index_str)
                except ValueError:
                    return None

            field_path = [p for p in rest.split(".") if p] if rest else []
            # Allow vitals[latest] with no field path (resolves to the item itself)
            return cls(
                namespace=namespace,
                collection_index=collection_index,
                field_path=field_path,
            )

        # No bracket: simple path namespace.f1.f2.f3
        parts = [p for p in s.split(".") if p]
        if len(parts) < 2:
            return None
        namespace = parts[0]
        field_path = parts[1:]
        return cls(
            namespace=namespace,
            collection_index=None,
            field_path=field_path,
        )

    def to_string(self) -> str:
        """Convert back to canonical variable string."""
        if self.collection_index is not None:
            index_str = (
                "latest"
                if self.collection_index == "latest"
                else str(self.collection_index)
            )
            base = f"{self.namespace}[{index_str}]"
        else:
            base = self.namespace
        if self.field_path:
            return base + "." + ".".join(self.field_path)
        return base

    def __str__(self) -> str:
        return self.to_string()

    def __hash__(self) -> int:
        return hash((self.namespace, self.collection_index, tuple(self.field_path)))


def _group_objects(
    accumulator: Dict[DatasourceObject, List[DatasourceAttribute]],
    variable: DatasourceVariable,
) -> Dict[DatasourceObject, List[DatasourceAttribute]]:
    """Group variables by object name for batch resolution."""
    obj = variable.obj

    if obj in accumulator:
        accumulator[obj].append(variable.attr)
    else:
        accumulator[obj] = [variable.attr]

    return accumulator


def _resolve_object(
    catalogue: Dict[str, ObjectCatalogue], context: ResolverContext, object_name: str
) -> Optional[BaseModel]:
    """
    Resolve an object instance from the catalogue and return as a Pydantic model.

    :param catalogue: The data catalogue
    :param context: Context containing IDs (e.g., {"patient_id": "p123"})
    :param object_name: Name of object type to resolve (e.g., "patient", "assessment")
    :returns: Pydantic model instance or None if not found
    """
    logger = logging.getLogger(__name__)

    if object_name not in catalogue:
        logger.debug(
            "Object resolution failed: Object '%s' not found in catalogue.", object_name
        )
        return None

    object_entry = catalogue.get(object_name)
    if not object_entry or "query" not in object_entry:
        logger.debug(
            "Object resolution failed: No query function for '%s'.", object_name
        )
        return None

    object_query = object_entry.get("query")
    if object_query is None:
        logger.debug(
            "Object resolution failed: Query function is None for '%s'.", object_name
        )
        return None

    # Try object-specific ID first (e.g., "assessment_id"), fall back to patient_id
    id_value = context.get(f"{object_name}_id") or context.get("patient_id")

    if id_value is None:
        logger.debug(
            "Object resolution failed: No ID found in context for '%s'.", object_name
        )
        return None

    try:
        dict_data = object_query(id=id_value)

        if dict_data is None:
            logger.debug(
                "Object resolution failed: Query returned None for '%s' with id '%s'.",
                object_name,
                id_value,
            )
            return None

        model_class = MODEL_REGISTRY.get(object_name)
        if model_class is None:
            logger.error("No Pydantic model registered for '%s'.", object_name)
            raise ValueError(f"No Pydantic model registered for {object_name}")

        return model_class(**dict_data)

    except Exception as e:
        logger.error("Error resolving '%s': %s", object_name, e)
        return None


def resolve_variables(
    context: ResolverContext,
    variables: List[DatasourceVariable],
    catalogue: Dict[str, ObjectCatalogue],
) -> Dict[str, Any]:
    """
    Resolve multiple variables into their concrete values.

    :param context: Context containing IDs (e.g., {"patient_id": "p123", "assessment_id": "a456"})
    :param variables: List of DatasourceVariable objects to resolve
    :param catalogue: The data catalogue of supported objects
    :returns: Dict mapping variable names to resolved values
    """
    object_groups = reduce(_group_objects, variables, {})
    resolved = {}

    for obj, attrs in object_groups.items():
        obj_name = obj.name
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
    context: ResolverContext,
    variable: DatasourceVariable,
    catalogue: Dict[str, ObjectCatalogue],
) -> Any:
    """
    Resolve a single variable into a concrete value.

    :param context: Context containing IDs
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
