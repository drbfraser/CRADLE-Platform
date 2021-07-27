from typing import List
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource, abort

import api.util as util
import service.view as view
import service.serialize as serialize
import data.marshal as marshal
from validation.patients import validate as validate_patient
from validation.readings import validate as validate_reading
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

        patients_to_be_added: List[Patient] = []
        json = request.get_json(force=True)
        for p in json:
            patient_on_server = crud.read(Patient, patientId=p.get("patientId"))
            if patient_on_server is None:
                error_message = validate_patient(p)
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
        user = get_jwt_identity()
        all_patients = view.patient_with_records_view(user)
        all_patients_edited_or_new = [
            serialize.serialize_patient_with_records(p)
            for p in all_patients
            if p.lastEdited > timestamp
            or p.pLastEdited > timestamp
            or p.mLastEdited > timestamp
            or p.dLastEdited > timestamp
        ]

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
        last_sync: int = request.args.get("since", None, type=int)
        if not last_sync:
            abort(400, message="'since' query parameter is required")

        json = request.get_json(force=True)
        patients_on_server_cache = set()
        for r in json:
            if r.get("patientId") not in patients_on_server_cache:
                patient_on_server = crud.read(Patient, patientId=r.get("patientId"))
                if patient_on_server is None:
                    continue
                else:
                    patients_on_server_cache.add(patient_on_server.patientId)

            if crud.read(Reading, readingId=r.get("readingId")):
                crud.update(
                    Reading,
                    {"dateRecheckVitalsNeeded": r.get("dateRecheckVitalsNeeded")},
                    readingId=r.get("readingId"),
                )
            else:
                error_message = validate_reading(r)
                if error_message is not None:
                    abort(400, message=error_message)
                reading = marshal.unmarshal(Reading, r)
                invariant.resolve_reading_invariants(reading)
                crud.create(reading, refresh=True)

        user = get_jwt_identity()
        new_readings = view.reading_view(user, last_sync)
        new_referrals = view.referral_view(user, last_sync)
        new_assessments = view.assessment_view(user, last_sync)

        return {
            "total": len(new_readings) + len(new_referrals) + len(new_assessments),
            "readings": [marshal.marshal(r) for r in new_readings],
            "newReferralsForOldReadings": [marshal.marshal(r) for r in new_referrals],
            "newFollowupsForOldReadings": [marshal.marshal(a) for a in new_assessments],
        }
