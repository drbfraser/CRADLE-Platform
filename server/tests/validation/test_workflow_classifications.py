import pytest
from pydantic import ValidationError

from validation.workflow_classifications import WorkflowClassificationModel

ID = "workflow_classification_123"
NAME = "Example Workflow Classification"

workflow_classification_with_valid_fields_should_return_none = {"id": ID, "name": NAME}

workflow_classification_with_wrong_id_type_should_return_validation_error = {
    "id": 123,
    "name": NAME,
}

workflow_classification_with_wrong_name_type_should_return_validation_error = {
    "id": ID,
    "name": 123,
}

workflow_classification_with_extra_field_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "extra": "Hello!",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (workflow_classification_with_valid_fields_should_return_none, None),
        (
            workflow_classification_with_wrong_id_type_should_return_validation_error,
            ValidationError,
        ),
        (
            workflow_classification_with_wrong_name_type_should_return_validation_error,
            ValidationError,
        ),
        (
            workflow_classification_with_extra_field_should_return_validation_error,
            ValidationError,
        ),
    ],
)
def test_workflow_classification_model_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            WorkflowClassificationModel(**json)

    else:
        try:
            WorkflowClassificationModel(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error from {e}") from e
