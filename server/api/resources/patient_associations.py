from flask import abort
from flask_openapi3.blueprint import APIBlueprint

from common import user_utils
from data import crud
from models import HealthFacilityOrm, PatientOrm, UserOrm
from service import assoc
from validation.associations import AssociationValidator

# TODO: Change this path to be in snake case.
# /api/patientAssociations
api_patient_associations = APIBlueprint(
    name="patient_associations",
    import_name=__name__,
    url_prefix="/patientAssociations",
)


# /api/patientAssociations [POST]
@api_patient_associations.post("")
def create_patient_association(body: AssociationValidator):
    patient_id = body.patient_id
    facility_name = body.health_facility_name
    user_id = body.user_id

    patient = crud.read(PatientOrm, patientId=patient_id)
    if patient is None:
        return abort(404, message=f"No patient exists with ID: {patient_id}")

    if facility_name is not None:
        facility = crud.read(HealthFacilityOrm, healthFacilityName=facility_name)
        if facility is None:
            return abort(
                400, message=f"No health facility exists with name: {facility_name}"
            )
    else:
        facility = None

    if user_id is not None:
        user = crud.read(UserOrm, id=user_id)
        if user is None:
            return abort(404, message=f"No user with ID: {user_id}")
        # if user exists but no health facility then assign the patient to the user's health facility
        facility = user.health_facility_name
    else:
        user = None

    if facility_name is None and user_id is None:
        # If neither facility_name or user_id are present in the request, create a
        # associate patient with the current user's health facility
        user_dict = user_utils.get_current_user_from_jwt()
        user = crud.read(UserOrm, id=user_dict["id"])
        if user is None:
            return abort(500, message="Current User does not exist.")
        assoc.associate(patient, user.health_facility, user)
    elif not assoc.has_association(patient, facility, user):
        assoc.associate(patient, facility, user)

    return {}, 201
