from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import service.view as view
import data.marshal as marshal
from validation import patients, readings
from models import Patient, Reading
from utils import get_current_time
import service.invariant as invariant
import service.assoc as assoc
import data.crud as crud

# /api/sync/patients
class UpdatesPatients(Resource):
    @staticmethod
    @jwt_required
    def post():
        # Get all patients for this user
        user = util.current_user()
        timestamp: int = request.args.get("since", None, type=int)
        if not timestamp:
            abort(400, message="'since' query parameter is required")

        patients_to_be_added: [Patient] = []
        #  ~~~~~~~~~~~~~~~~~~~~~~ new Logic ~~~~~~~~~~~~~~~~~~~~~~~~~~
        json = request.get_json(force=True)
        for p in json:
            patient_on_server = crud.read(Patient, patientId=p.get("patientId"))
            if patient_on_server is None:
                error_message = patients.validate(p)
                if error_message is not None:
                    abort(400, message=error_message)

                patient = marshal.unmarshal(Patient, p)
                # # Resolve invariants and set the creation timestamp for the patient ensuring
                # # that both the created and lastEdited fields have the exact same value.
                invariant.resolve_reading_invariants_mobile(patient)
                creation_time = get_current_time()
                patient.created = creation_time
                patient.lastEdited = creation_time
                patients_to_be_added.append(patient)
            else:
                if (
                    int(patient_on_server.lastEdited)
                    < int(p.get("lastEdited"))
                    < timestamp
                ):
                    if p.get("base"):
                        if p.get("base") != p.get("lastEdited"):
                            abort(
                                409,
                                message="Unable to merge changes, conflict detected",
                            )
                        del p["base"]

                    p["lastEdited"] = get_current_time()
                    crud.update(Patient, p, patientId=p["patientId"])
                #     TODO: revisit association logic
                if not assoc.has_association(patient_on_server, user=user):
                    assoc.associate(patient_on_server, user.healthFacility, user)

        # update association
        if patients_to_be_added:
            crud.create_all_patients(patients_to_be_added)
            for new_patient in patients_to_be_added:
                #     TODO: revisit association logic
                if not assoc.has_association(new_patient, user=user):
                    assoc.associate(new_patient, user.healthFacility, user)

        # read all the patients from the DB
        #     TODO: optimize to get only patients
        all_patients = view.patient_view_for_user(user)
        all_patients_edited_or_new = [
            p for p in all_patients if p["lastEdited"] > timestamp
        ]

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
            "total": len(all_patients_edited_or_new),
            "patients": all_patients_edited_or_new,
        }


# /api/sync/readings
class UpdatesReadings(Resource):
    @staticmethod
    @jwt_required
    def post():
        # Get all patients for this user
        timestamp: int = request.args.get("since", None, type=int)
        if not timestamp:
            abort(400, message="'since' query parameter is required")

        #  ~~~~~~~~~~~~~~~~~~~~~~ new Logic ~~~~~~~~~~~~~~~~~~~~~~~~~~
        json = request.get_json(force=True)
        patients_on_server_chache = set()
        for r in json:
            if r.get("patientId") not in patients_on_server_chache:
                patient_on_server = crud.read(Patient, patientId=r.get("patientId"))
                if patient_on_server is None:
                    continue
                else:
                    patients_on_server_chache.add(patient_on_server.patientId)

            if crud.read(Reading, readingId=r.get("readingId")):
                continue
            else:
                error_message = readings.validate(r)
                if error_message is not None:
                    abort(400, message=error_message)
                reading = marshal.unmarshal(Reading, r)
                invariant.resolve_reading_invariants(reading)
                crud.create(reading, refresh=True)

        user = util.current_user()
        #     TODO: create custome DB calls for referral and followup

        all_patients = view.patient_view_for_user(user)
        new_readings = []
        new_referral = []
        new_followup = []
        for p in all_patients:
            for r in p["readings"]:
                if r["dateTimeTaken"] > timestamp:
                    new_readings.append(r)
                if (
                    r["referral"]
                    and r["referral"]["dateReferred"] > timestamp
                    and r["dateTimeTaken"] < timestamp
                ):
                    new_referral.append(r["referral"])
                if (
                    r["followup"]
                    and r["followup"]["dateAssessed"] > timestamp
                    and r["dateTimeTaken"] < timestamp
                ):
                    new_followup.append(r["followup"])

        return {
            "total": len(new_readings) + len(new_referral) + len(new_followup),
            "readings": new_readings,
            "newReferralsForOldReadings": new_referral,
            "newFollowupsForOldReadings": new_followup,
        }
