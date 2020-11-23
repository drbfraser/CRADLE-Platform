from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import service.view as view
import data.marshal as marshal
from validation import patients
from models import Patient, Reading
from utils import get_current_time
import service.invariant as invariant

# /api/sync/updates
import data.crud as crud
from models import HealthFacility


class Updates(Resource):
    @staticmethod
    @jwt_required
    def post():
        # Get all patients for this user
        user = util.current_user()
        all_patients = view.patient_view_for_user(user)
        all_patients_ids = sorted([p["patientId"] for p in all_patients])

        #  ~~~~~~~~~~~~~~~~~~~~~~ new Logic ~~~~~~~~~~~~~~~~~~~~~~~~~~
        json = request.get_json(force=True)
        for p in json:
            error_message = patients.validate(p)
            if error_message is not None:
                abort(400, message=error_message)

            if p.get("patientId") not in all_patients_ids:
                patient = marshal.unmarshal(Patient, p)
                # # Resolve invariants and set the creation timestamp for the patient ensuring
                # # that both the created and lastEdited fields have the exact same value.
                invariant.resolve_reading_invariants_mobile(patient)
                creation_time = get_current_time()
                patient.created = creation_time
                patient.lastEdited = creation_time
                crud.create(patient, refresh=True)
            else:
                if p.get("readings") is not None:
                    for r in p.get("readings"):
                        reading = marshal.unmarshal(Reading, r)
                        if crud.read(Reading, readingId=reading.readingId):
                            continue
                        else:
                            invariant.resolve_reading_invariants(reading)
                            crud.create(reading, refresh=True)

        all_patients = view.patient_view_for_user(user)

        #  ~~~~~~~~~~~~~~~~~ old logic ~~~~~~~~~~~~~~~~~~~~
        # New patients are patients who are created after the timestamp
        # new_patients = [
        #     p["patientId"] for p in all_patients if p["created"] > timestamp
        # ]

        # Edited patients are patients who were created before the timestamp but
        # edited after it
        # edited_patients = [
        #     p["patientId"]
        #     for p in all_patients
        #     if p["created"] < p["lastEdited"]
        #     and p["created"] <= timestamp < p["lastEdited"]
        # ]

        # New readings created after the timestamp for patients who where created before
        # the timestamp
        # readings = []

        # reads all the Health Facilities form db and returns the updated facilities list
        facilities = [f.healthFacilityName for f in crud.read_all(HealthFacility)]

        # New followups which were created after the timestamp for readings which were
        # created before the timestamp
        # followups = []
        #
        # for p in all_patients:
        #     for r in p["readings"]:
        #         r_time = int(r["dateTimeTaken"])
        #         if p["created"] <= timestamp < r_time:
        #             readings.append(r["readingId"])
        #
        #         if r["followup"] and r_time < timestamp < int(
        #             r["followup"]["dateAssessed"]
        #         ):
        #             followups.append(r["followup"]["id"])

        return {
            "patients": all_patients,
            "healthFacilities": facilities,
        }
