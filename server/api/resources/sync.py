from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import service.view as view
import data.marshal as marshal
from validation import patients
from models import Patient
from utils import get_current_time
import service.invariant as invariant

# /api/sync/updates
import data.crud as crud
from models import HealthFacility


class Updates(Resource):
    @staticmethod
    @jwt_required
    def post():
        timestamp: int = request.args.get("since", None, type=int)
        if not timestamp:
            abort(400, message="'since' query parameter is required")

        # Get all patients for this user
        user = util.current_user()
        all_patients = view.patient_view_for_user(user)

        #  ~~~~~~~~~~~~~~~~~~~~~~ new Logic ~~~~~~~~~~~~~~~~~~~~~~~~~~
        patients_list = []
        json = request.get_json(force=True)
        for p in json:
            error_message = patients.validate(p)
            if error_message is not None:
                abort(400, message=error_message)

            patient = marshal.unmarshal(Patient, p)
            # # Resolve invariants and set the creation timestamp for the patient ensuring
            # # that both the created and lastEdited fields have the exact same value.

            # invariant.resolve_reading_invariants(patient)
            creation_time = get_current_time()
            patient.created = creation_time
            patient.lastEdited = creation_time
            patients_list.append(patient)

        all_patients_ids = sorted([p["patientId"] for p in all_patients])
        mobile_patients_ids = sorted([p.patientId for p in patients_list])

        patientIds_not_in_server = list(
            set(mobile_patients_ids).difference(set(all_patients_ids))
        )

        #  ~~~~~~~~~~~~~~~~~ old logic ~~~~~~~~~~~~~~~~~~~~
        # New patients are patients who are created after the timestamp
        new_patients = [
            p["patientId"] for p in all_patients if p["created"] > timestamp
        ]

        # Edited patients are patients who were created before the timestamp but
        # edited after it
        edited_patients = [
            p["patientId"]
            for p in all_patients
            if p["created"] < p["lastEdited"]
            and p["created"] <= timestamp < p["lastEdited"]
        ]

        # New readings created after the timestamp for patients who where created before
        # the timestamp
        readings = []

        # reads all the Health Facilities form db and returns the updated facilities list
        facilities = [f.healthFacilityName for f in crud.read_all(HealthFacility)]

        # New followups which were created after the timestamp for readings which were
        # created before the timestamp
        followups = []

        for p in all_patients:
            for r in p["readings"]:
                r_time = int(r["dateTimeTaken"])
                if p["created"] <= timestamp < r_time:
                    readings.append(r["readingId"])

                if r["followup"] and r_time < timestamp < int(
                    r["followup"]["dateAssessed"]
                ):
                    followups.append(r["followup"]["id"])

        return {
            "newPatients": new_patients,
            "editedPatients": edited_patients,
            "readings": readings,
            "followups": followups,
            "healthFacilities": facilities,
        }


#
# # /api/mobile/patients
# class PatientList(Resource):
#     @staticmethod
#     @jwt_required
#     @swag_from(
#         "../../specifications/patients-post.yml", methods=["POST"], endpoint="patient_list"
#     )
#     def post():
#
#         # make sure that the call has since parameter
#         timestamp: int = request.args.get("since", None, type=int)
#         if not timestamp:
#             abort(400, message="'since' query parameter is required")
#
#
#         # new Patients from android
#         # new Reading/followup/.. from android
#
#         json = request.get_json(force=True)
#         user = util.current_user()
#         patients_list = []
#         # new patients
#         if not util.query_param_bool(request, "edited"):
#             for p in json:
#                 error_message = patients.validate(p)
#                 if error_message is not None:
#                     abort(400, message=error_message)
#
#                 patient = marshal.unmarshal(Patient, p)
#                 # # Resolve invariants and set the creation timestamp for the patient ensuring
#                 # # that both the created and lastEdited fields have the exact same value.
#                 invariant.resolve_reading_invariants(patient)
#                 creation_time = get_current_time()
#                 patient.created = creation_time
#                 patient.lastEdited = creation_time
#
#                 crud.create(patient, refresh=True)
#                 assoc.associate_by_user_role(patient, user)
#                 # If the patient has any readings, and those readings have referrals, we
#                 # associate the patient with the facilities they were referred to
#                 for reading in patient.readings:
#                     referral = reading.referral
#                     if referral and not assoc.has_association(patient, referral.healthFacility):
#                         assoc.associate(patient, facility=referral.healthFacility)
#                         # The associate function performs a database commit, since this will
#                         # wipe out the patient we want to return we must refresh it.
#                         data.db_session.refresh(patient)
#
#                 # TODO make one single call to DB
#                 patients_list.append(patient)
#
#             # TODO make one single call to DB
#             crud.create_all(patients_list, refresh=True)
#
#
#
#         # if crud.read(Patient, patientId=patient.patientId):
#         #     abort(409, message=f"A patient already exists with id: {patient.patientId}")
#         #
#
#
#         return  201
