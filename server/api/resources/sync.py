
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import service.view as view
import data.marshal as marshal

# /api/sync/updates
import data.crud as crud
from models import HealthFacility


class Updates(Resource):
    @staticmethod
    @jwt_required
    def get():
        timestamp: int = request.args.get("since", None, type=int)
        if not timestamp:
            abort(400, message="'since' query parameter is required")

        # Get all patients for this user
        user = util.current_user()
        all_patients = view.patient_view_for_user(user)

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
