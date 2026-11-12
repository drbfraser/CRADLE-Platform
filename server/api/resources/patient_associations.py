from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from api.authorization import require_existing_patient_assignment
from models import PatientOrm, UserOrm
from service import assoc
from validation.associations import CreatePatientAssociationRequest

# /api/patient_associations
api_patient_associations = APIBlueprint(
    name="patient_associations",
    import_name=__name__,
    url_prefix="/patient_associations",
    abp_tags=[Tag(name="Patient Associations", description="")],
    abp_security=[{"jwt": []}],
)


# /api/patient_associations [POST]
@api_patient_associations.post("")
def create_patient_association(body: CreatePatientAssociationRequest):
    """Create Patient Association"""
    current_user = require_existing_patient_assignment()
    patient_id = body.patient_id

    patient = crud.read(PatientOrm, id=patient_id)
    if patient is None:
        return abort(404, description=f"No patient exists with ID: {patient_id}")

    user = crud.read(UserOrm, id=current_user["id"])
    if user is None:
        return abort(500, description="Current User does not exist.")
    facility = user.health_facility

    if not assoc.has_association(patient, facility, user):
        assoc.associate(patient, facility, user)

    return {}, 201
