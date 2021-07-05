from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import data
import data.crud as crud
import data.marshal as marshal
import service.assoc as assoc
import service.invariant as invariant
import service.view as view
import service.serialize as serialize
import service.statsCalculation as statsCalculation
from models import Patient
from validation import patients
from utils import get_current_time
from api.decorator import patient_association_required


# /api/patients
class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/patients-get.yml", methods=["GET"], endpoint="patients"
    )
    def get():
        user = util.current_user()

        # query parameters for later SQL use
        limit = util.query_param_limit(request, name="limit")
        page = util.query_param_page(request, name="page")
        sort_by = util.query_param_sortBy(request, name="sortBy")
        sort_dir = util.query_param_sort_dir(request, name="sortDir")
        search = util.query_param_search(request, name="search")

        patients = view.patient_view_for_user(
            user,
            limit=limit,
            page=page,
            sortBy=sort_by,
            sortDir=sort_dir,
            search=search,
        )

        # create JSON format
        return [serialize.serialize_patient(p) for p in patients]

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/patients-post.yml", methods=["POST"], endpoint="patients"
    )
    def post():
        json = request.get_json(force=True)
        error_message = patients.validate(json)
        if error_message is not None:
            abort(400, message=error_message)
        patient = marshal.unmarshal(Patient, json)

        if crud.read(Patient, patientId=patient.patientId):
            abort(409, message=f"A patient already exists with id: {patient.patientId}")

        # Resolve invariants and set the creation timestamp for the patient ensuring
        # that both the created and lastEdited fields have the exact same value.
        invariant.resolve_reading_invariants(patient)
        creation_time = get_current_time()
        patient.created = creation_time
        patient.lastEdited = creation_time

        crud.create(patient, refresh=True)

        # Associate the patient with the user who created them
        user = util.current_user()
        assoc.associate_by_user_role(patient, user)

        # If the patient has any readings, and those readings have referrals, we
        # associate the patient with the facilities they were referred to
        for reading in patient.readings:
            referral = reading.referral
            if referral and not assoc.has_association(patient, referral.healthFacility):
                assoc.associate(patient, facility=referral.healthFacility)
                # The associate function performs a database commit, since this will
                # wipe out the patient we want to return we must refresh it.
                data.db_session.refresh(patient)
        return marshal.marshal(patient), 201


# /api/patients/<string:patient_id>
class SinglePatient(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-patient-get.yml",
        methods=["GET"],
        endpoint="single_patient",
    )
    def get(patient_id: str):
        patient = crud.read(Patient, patientId=patient_id)
        if not patient:
            abort(404, message=f"No patient with id {patient_id}")
        return marshal.marshal(patient)


# /api/mobile/patients/
class AndroidPatients(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/android-patients-get.yml",
        methods=["GET"],
        endpoint="android_patient",
    )
    def get():
        user = util.current_user()
        patients = view.patient_view_for_user(user)

        return patients, 200


# /api/patients/<string:patient_id>/info
class PatientInfo(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/patient-info-get.yml",
        methods=["GET"],
        endpoint="patient_info",
    )
    def get(patient_id: str):
        patient = crud.read(Patient, patientId=patient_id)
        if not patient:
            abort(404, message=f"No patient with id {patient_id}")
        return marshal.marshal(patient, shallow=True)

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/patient-info-put.yml",
        methods=["PUT"],
        endpoint="patient_info",
    )
    def put(patient_id: str):
        json = request.get_json(force=True)
        error_message = patients.validate_put_request(json, patient_id)
        if error_message is not None:
            abort(400, message=error_message)

        # If the inbound JSON contains a `base` field then we need to check if it is the
        # same as the `lastEdited` field of the existing patient. If it is then that
        # means that the patient has not been edited on the server since this inbound
        # patient was last synced and we can apply the changes. If they are not equal,
        # then that means the patient has been edited on the server after it was last
        # synced with the client. In these cases, we reject the changes for the client.
        #
        # You can think of this like aborting a git merge due to conflicts.
        base = json.get("base")
        if base:
            last_edited = crud.read(Patient, patientId=patient_id).lastEdited
            if base != last_edited:
                abort(409, message="Unable to merge changes, conflict detected")

            # Delete the `base` field once we are done with it as to not confuse the
            # ORM as there is no "base" column in the database for patients.
            del json["base"]

        crud.update(Patient, json, patientId=patient_id)
        patient = crud.read(Patient, patientId=patient_id)

        # Update the patient's lastEdited timestamp only if there was no `base` field
        # in the request JSON. If there was then that means that this edit happened some
        # time in the past and is just being synced. In this case we want to keep the
        # `lastEdited` value which is present in the request.
        if not base:
            patient.lastEdited = get_current_time()
            data.db_session.commit()
            data.db_session.refresh(patient)  # Need to refresh the patient after commit

        return marshal.marshal(patient)


# /api/patients/<string:patient_id>/stats
class PatientStats(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/patient-stats-get.yml",
        methods=["GET"],
        endpoint="patient_stats",
    )
    def get(patient_id: str):

        patient = crud.read(Patient, patientId=patient_id)
        if not patient:
            abort(404, message=f"No patient with id {patient_id}")

        # getting all bpSystolic readings for each month
        bp_systolic = statsCalculation.get_stats_data("bpSystolic", patient.readings)

        # getting all bpDiastolic readings for each month
        bp_diastolic = statsCalculation.get_stats_data("bpDiastolic", patient.readings)

        # getting all heart rate readings for each month
        heart_rate = statsCalculation.get_stats_data("heartRateBPM", patient.readings)

        # getting all traffic lights from day 1 for this patient
        traffic_light_statuses = statsCalculation.get_stats_data(
            "trafficLightStatus", patient.readings
        )

        # putting data into one object now
        data = {
            "bpSystolicReadingsMonthly": bp_systolic,
            "bpDiastolicReadingsMonthly": bp_diastolic,
            "heartRateReadingsMonthly": heart_rate,
            "trafficLightCountsFromDay1": {
                "green": traffic_light_statuses[0],  # dont
                "yellowUp": traffic_light_statuses[1],  # hate
                "yellowDown": traffic_light_statuses[2],  # the
                "redUp": traffic_light_statuses[3],  # magic
                "redDown": traffic_light_statuses[4],  # numbers
            },
        }
        return data


# /api/patients/<string:patient_id>/readings
class PatientReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/patient-readings-get.yml",
        methods=["GET"],
        endpoint="patient_readings",
    )
    def get(patient_id: str):
        patient = crud.read(Patient, patientId=patient_id)
        return [marshal.marshal(r) for r in patient.readings]


# /api/patients/<string:patient_id>/medical_info
class PatientMedicalInfo(Resource):
    @staticmethod
    @patient_association_required()
    @swag_from(
        "../../specifications/patient-medical-info-get.yml",
        methods=["GET"],
        endpoint="patient_medical_info",
    )
    def get(patient_id: str):
        records = crud.get_medical_info(patient_id)
        return marshal.marshal_patient_medical_info(**records)


# /api/patients/<string:patient_id>/timeline
class PatientTimeline(Resource):
    @staticmethod
    @patient_association_required()
    @swag_from(
        "../../specifications/patient-timeline-get.yml",
        methods=["GET"],
        endpoint="patient_timeline",
    )
    def get(patient_id: str):
        params = util.get_query_params(request)
        records = crud.read_patient_timeline(patient_id, **params)
        return [serialize.serialize_patient_timeline(r) for r in records]
