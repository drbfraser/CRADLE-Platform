from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common import user_utils
from models import HealthFacilityOrm, PatientOrm, UserOrm
from service import assoc
from service.patient_authorization import can_assign_existing_patient
from validation.associations import PatientAssociationModel

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
def create_patient_association(body: PatientAssociationModel):
    """Create Patient Association"""
    current_user = user_utils.get_current_user_from_jwt()
    if not can_assign_existing_patient(current_user):
        return abort(403, description="Not authorized to assign an existing patient.")
    patient_id = body.patient_id
    facility_name = body.health_facility_name
    user_id = body.user_id

    patient = crud.read(PatientOrm, id=patient_id)
    if patient is None:
        return abort(404, description=f"No patient exists with ID: {patient_id}")

    if facility_name is not None:
        facility = crud.read(HealthFacilityOrm, name=facility_name)
        if facility is None:
            return abort(
                400, description=f"No health facility exists with name: {facility_name}"
            )
    else:
        facility = None

    if user_id is not None:
        user = crud.read(UserOrm, id=user_id)
        if user is None:
            return abort(404, description=f"No user with ID: {user_id}")
        facility = user.health_facility
    else:
        user = None

    if facility_name is None and user_id is None:
        user = crud.read(UserOrm, id=current_user["id"])
        if user is None:
            return abort(500, description="Current User does not exist.")
        facility = user.health_facility

    if not assoc.has_association(patient, facility, user):
        assoc.associate(patient, facility, user)

    return {}, 201
