import pytest
from pydantic import ValidationError

from validation.workflow_collections import WorkflowCollectionModel

ID = "workflow_collection_123"
NAME = "Example Workflow Collection"

workflow_collection_with_valid_fields_should_return_none = {"id": ID, "name": NAME}

workflow_collection_with_wrong_id_type_should_return_validation_error = {
    "id": 123,
    "name": NAME,
}

workflow_collection_with_wrong_name_type_should_return_validation_error = {
    "id": ID,
    "name": 123,
}

workflow_collection_with_extra_field_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "extra": "Hello!",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (workflow_collection_with_valid_fields_should_return_none, None),
        (
            workflow_collection_with_wrong_id_type_should_return_validation_error,
            ValidationError,
        ),
        (
            workflow_collection_with_wrong_name_type_should_return_validation_error,
            ValidationError,
        ),
        (
            workflow_collection_with_extra_field_should_return_validation_error,
            ValidationError,
        ),
    ],
)
def test_workflow_collections(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            WorkflowCollectionModel(**json)
    else:
        try:
            WorkflowCollectionModel(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error from {e}") from e
