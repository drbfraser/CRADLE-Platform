import pytest
from pydantic import ValidationError

from validation.associations import CreatePatientAssociationRequest


@pytest.mark.parametrize("payload", [{}, {"patient_id": 20}])
def test_invalid_patient_association(payload):
    with pytest.raises(ValidationError):
        CreatePatientAssociationRequest(**payload)
