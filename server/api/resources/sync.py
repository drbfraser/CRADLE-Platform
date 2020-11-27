from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import service.view as view
import data.marshal as marshal
from validation import patients, referrals, assessments
from models import Patient, Reading, Referral, FollowUp
from utils import get_current_time
import service.invariant as invariant
import service.assoc as assoc
import data

import data.crud as crud
from models import HealthFacility

# /api/sync/updates
class Updates(Resource):
    @staticmethod
    @jwt_required
    def post():
        # Get all patients for this user
        user = util.current_user()
        timestamp: int = request.args.get("since", None, type=int)
        if not timestamp:
            abort(400, message="'since' query parameter is required")

        all_patients = view.patient_view_for_user(user)
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
                if p.get("readings") is not None:
                    for r in p.get("readings"):
                        if crud.read(Reading, readingId=r.get("readingId")):
                            continue
                        else:
                            reading = marshal.unmarshal(Reading, r)
                            invariant.resolve_reading_invariants(reading)
                            crud.create(reading, refresh=True)

                            handle_referral(r.get("referral"))
                            handle_followup(r.get("followup"), user)

                same_patient_in_server: [Patient] = [
                    pat
                    for pat in all_patients
                    if pat["patientId"] == p.get("patientId")
                ]
                if int(same_patient_in_server[0]["lastEdited"]) < timestamp:
                    if p.get("base"):
                        if p.get("base") != p.get("lastEdited"):
                            abort(
                                409,
                                message="Unable to merge changes, conflict detected",
                            )
                        del p["base"]
                    del p["readings"]
                    p["lastEdited"] = get_current_time()
                    crud.update(Patient, p, patientId=p["patientId"])

        # update association
        if patients_to_be_added:
            crud.create_all_patients(patients_to_be_added)
            for new_patient in patients_to_be_added:
                if not assoc.has_association(new_patient, user=user):
                    assoc.associate(new_patient, user.healthFacility, user)

        # read all the patients from the DB
        all_patients = view.patient_view_for_user(user)
        all_patients_edited_or_new = [
            p for p in all_patients if p["lastEdited"] > timestamp
        ]

        # reads all the Health Facilities form db and returns the updated facilities list
        facilities = [f.healthFacilityName for f in crud.read_all(HealthFacility)]

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
            "patients": all_patients_edited_or_new,
            "healthFacilities": facilities,
        }


def handle_referral(json: any):

    error_message = referrals.validate(json)
    if error_message is not None:
        abort(400, message=error_message)

    referral = marshal.unmarshal(Referral, json)
    crud.create(referral)

    # Creating a referral also associates the corresponding patient to the health
    # facility they were referred to.
    patient = referral.patient
    facility = referral.healthFacility
    if not assoc.has_association(patient, facility):
        assoc.associate(patient, facility=facility)


def handle_followup(json: any, user):

    # Populate the dateAssessed and healthCareWorkerId fields of the followup
    json["dateAssessed"] = get_current_time()
    json["healthcareWorkerId"] = user.id

    error_message = assessments.validate(json)
    if error_message is not None:
        abort(400, message=error_message)

    follow_up = marshal.unmarshal(FollowUp, json)

    # Check that reading id which doesn’t reference an existing reading in the database
    reading = crud.read(Reading, readingId=follow_up.readingId)
    if reading:
        crud.create(follow_up)

    # Creating an assessment also marks any referral attached to the associated
    # reading as "assessed"
    if follow_up.reading.referral:
        follow_up.reading.referral.isAssessed = True
        data.db_session.commit()
