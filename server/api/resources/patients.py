from datetime import date
from typing import Any, cast

from flasgger import swag_from
from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource, abort

import data
from api import util
from api.decorator import patient_association_required
from data import crud, marshal
from models import FollowUpOrm, PatientOrm, PregnancyOrm, ReadingOrm, ReferralOrm
from service import assoc, invariant, serialize, statsCalculation, view
from shared.user_utils import UserUtils
from utils import get_current_time
from validation import assessments, patients, readings

patient_not_found_message = "Patient with id ({}) not found."


# /api/patients
class Root(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/patients-get.yml",
        methods=["GET"],
        endpoint="patients",
    )
    # gets all UNARCHIVED patients
    def get():
        current_user = UserUtils.get_current_user_from_jwt()
        current_user = cast(dict[Any, Any], current_user)
        params = util.get_query_params(request)
        patients = view.patient_list_view(current_user, **params)
        return serialize.serialize_patient_list(patients)

    @staticmethod
    @swag_from(
        "../../specifications/patients-post.yml",
        methods=["POST"],
        endpoint="patients",
    )
    def post():
        json = request.get_json(force=True)

        if "gestational_timestamp" in json:
            # Changing the key that comes from the android app to work with validation
            json["pregnancy_start_date"] = json.pop("gestational_timestamp")

        error_message = patients.validate(json)
        if error_message is not None:
            abort(400, message=error_message)

        patient = marshal.unmarshal(PatientOrm, json)
        patient_id = patient.id
        if crud.read(PatientOrm, patient_id=patient_id):
            abort(409, message=f"A patient already exists with id: {patient_id}")

        # Resolve invariants and set the creation timestamp for the patient ensuring
        # that both the created and last_edited fields have the exact same value.
        invariant.resolve_reading_invariants(patient)
        creation_time = get_current_time()
        patient.date_created = creation_time
        patient.last_edited = creation_time
        patient.is_archived = False

        crud.create(patient, refresh=True)

        # Associate the patient with the user who created them
        user = util.current_user()
        assoc.associate_by_user_role(patient, user)

        # If the patient has any referrals, associate the patient with the facilities they were referred to
        for referral in patient.referrals:
            if not assoc.has_association(patient, referral.health_facility_name):
                assoc.associate(patient, facility=referral.health_facility_name)
                # The associate function performs a database commit, since this will
                # wipe out the patient we want to return we must refresh it.
                data.db_session.refresh(patient)

        patient = crud.read_patients(patient_id)
        if patient is None:
            abort(404, message=patient_not_found_message.format(patient_id))
            return None
        referrals = crud.read_referrals_or_assessments(ReferralOrm, patient_id)
        assessments = crud.read_referrals_or_assessments(FollowUpOrm, patient_id)

        return (
            serialize.serialize_patient(patient, readings, referrals, assessments),
            201,
        )


# /api/patients/<string:patient_id>
class SinglePatient(Resource):
    @staticmethod
    @patient_association_required()
    @swag_from(
        "../../specifications/single-patient-get.yml",
        methods=["GET"],
        endpoint="single_patient",
    )
    def get(patient_id: str):
        patient = crud.read_patients(patient_id)
        if patient is None:
            abort(404, message=patient_not_found_message.format(patient_id))
            return None

        readings = crud.read_readings(patient_id)
        referrals = crud.read_referrals_or_assessments(ReferralOrm, patient_id)
        assessments = crud.read_referrals_or_assessments(FollowUpOrm, patient_id)

        return serialize.serialize_patient(patient, readings, referrals, assessments)


# /api/patients/<string:patient_id>/info
class PatientInfo(Resource):
    @staticmethod
    @patient_association_required()
    @swag_from(
        "../../specifications/patient-info-get.yml",
        methods=["GET"],
        endpoint="patient_info",
    )
    def get(patient_id: str):
        patient = crud.read(PatientOrm, patient_id=patient_id)
        if not patient:
            abort(404, message=f"No patient with id {patient_id}")
        return marshal.marshal(patient, shallow=True)

    @staticmethod
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
        # same as the `last_edited` field of the existing patient. If it is then that
        # means that the patient has not been edited on the server since this inbound
        # patient was last synced and we can apply the changes. If they are not equal,
        # then that means the patient has been edited on the server after it was last
        # synced with the client. In these cases, we reject the changes for the client.
        #
        # You can think of this like aborting a git merge due to conflicts.
        base = json.get("base")
        if base:
            patient = crud.read(PatientOrm, patient_id=patient_id)
            if patient is None:
                abort(404, message=patient_not_found_message.format(patient_id))
                return None
            last_edited = patient.last_edited
            if base != last_edited:
                abort(409, message="Unable to merge changes, conflict detected")
                return None

            # Delete the `base` field once we are done with it as to not confuse the
            # ORM as there is no "base" column in the database for patients.
            del json["base"]

        crud.update(PatientOrm, json, patient_id=patient_id)
        patient = crud.read(PatientOrm, patient_id=patient_id)
        if patient is None:
            abort(404, message=patient_not_found_message.format(patient_id))
            return None

        # Update the patient's last_edited timestamp only if there was no `base` field
        # in the request JSON. If there was then that means that this edit happened some
        # time in the past and is just being synced. In this case we want to keep the
        # `last_edited` value which is present in the request.
        if not base:
            patient.last_edited = get_current_time()
            data.db_session.commit()
            data.db_session.refresh(patient)  # Need to refresh the patient after commit

        return marshal.marshal(patient)


# /api/patients/<string:patient_id>/stats
class PatientStats(Resource):
    @staticmethod
    @patient_association_required()
    @swag_from(
        "../../specifications/patient-stats-get.yml",
        methods=["GET"],
        endpoint="patient_stats",
    )
    def get(patient_id: str):
        patient = crud.read(PatientOrm, patient_id=patient_id)
        if patient is None:
            abort(404, message=patient_not_found_message.format(patient_id))
            return None

        today = date.today()
        current_year = today.year
        current_month = today.month

        # getting all bpSystolic readings for each month
        bp_systolic = statsCalculation.get_stats_data(
            "bpSystolic",
            patient.readings,
            current_year,
            current_month,
        )

        # getting all bpDiastolic readings for each month
        bp_diastolic = statsCalculation.get_stats_data(
            "bpDiastolic",
            patient.readings,
            current_year,
            current_month,
        )

        # getting all heart rate readings for each month
        heart_rate = statsCalculation.get_stats_data(
            "heartRateBPM",
            patient.readings,
            current_year,
            current_month,
        )

        # getting all bpSystolic readings for each month dated from 12 months before the current month
        bp_systolic_last_twelve_months = statsCalculation.get_stats_data(
            "bpSystolicLastTwelveMonths",
            patient.readings,
            current_year,
            current_month,
            True,
        )

        # getting all bpDiastolic readings for each month dated from 12 months before the current month
        bp_diastolic_last_twelve_months = statsCalculation.get_stats_data(
            "bpDiastolicLastTwelveMonths",
            patient.readings,
            current_year,
            current_month,
            True,
        )

        # getting all heart rate readings for each month dated from 12 months before the current month
        heart_rate_last_twelve_months = statsCalculation.get_stats_data(
            "heartRateBPMLastTwelveMonths",
            patient.readings,
            current_year,
            current_month,
            True,
        )

        # getting all traffic lights from day 1 for this patient
        traffic_light_statuses = statsCalculation.get_stats_data(
            "trafficLightStatus",
            patient.readings,
            current_year,
            current_month,
        )

        # putting data into one object now
        data = {
            "bp_systolic_readings_monthly": bp_systolic,
            "bp_diastolic_readings_monthly": bp_diastolic,
            "heart_rate_readings_monthly": heart_rate,
            "bp_systolic_readings_last_twelve_months": bp_systolic_last_twelve_months,
            "bp_diastolic_readings_last_twelve_months": bp_diastolic_last_twelve_months,
            "heart_rate_readings_last_twelve_months": heart_rate_last_twelve_months,
            "traffic_light_counts_from_day_1": {
                "green": traffic_light_statuses[0],
                "yellow_up": traffic_light_statuses[1],
                "yellow_down": traffic_light_statuses[2],
                "red_up": traffic_light_statuses[3],
                "red_down": traffic_light_statuses[4],
            },
            "current_month": current_month,
        }
        return data


# /api/patients/<string:patient_id>/readings
class PatientReadings(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/patient-readings-get.yml",
        methods=["GET"],
        endpoint="patient_readings",
    )
    def get(patient_id: str):
        patient = crud.read(PatientOrm, patient_id=patient_id)
        if patient is None:
            abort(404, message=f"Patient with id ({patient_id}) not found.")
            return None
        return [marshal.marshal(r) for r in patient.readings]


# /api/patients/<string:patient_id>/most_recent_reading
class PatientMostRecentReading(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/patient-most-recent-reading-get.yml",
        methods=["GET"],
        endpoint="patient_most_recent_reading",
    )
    def get(patient_id: str):
        patient = crud.read(PatientOrm, patient_id=patient_id)
        if patient is None:
            abort(404, message=f"Patient with id ({patient_id}) not found.")
            return None
        readings = [marshal.marshal(r) for r in patient.readings]
        if not len(readings):
            return []

        sorted_readings = sorted(
            readings,
            key=lambda r: r["dateTimeTaken"],
            reverse=True,
        )
        return [sorted_readings[0]]


# /api/patients/<string:patient_id>/referrals
class PatientReferrals(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/patient-referrals-get.yml",
        methods=["GET"],
        endpoint="patient_referrals",
    )
    def get(patient_id: str):
        patient = crud.read(PatientOrm, patient_id=patient_id)
        if patient is None:
            abort(404, message=patient_not_found_message.format(patient_id))
            return None
        return [marshal.marshal(ref) for ref in patient.referrals]


# /api/patients/<string:patient_id>/forms
class PatientForms(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/patient-forms-get.yml",
        methods=["GET"],
        endpoint="patient_forms",
    )
    def get(patient_id: str):
        patient = crud.read(PatientOrm, patient_id=patient_id)
        if patient is None:
            abort(404, message=patient_not_found_message.format(patient_id))
            return None
        return [marshal.marshal(form, True) for form in patient.forms]


# /api/patients/<string:patient_id>/pregnancy_summary
class PatientPregnancySummary(Resource):
    @staticmethod
    @patient_association_required()
    @swag_from(
        "../../specifications/patient-pregnancy-summary-get.yml",
        methods=["GET"],
        endpoint="patient_pregnancy_summary",
    )
    def get(patient_id: str):
        pregnancies = crud.read_medical_records(
            PregnancyOrm, patient_id, direction="DESC"
        )
        return marshal.marshal_patient_pregnancy_summary(pregnancies)


# /api/patients/<string:patient_id>/medical_history
class PatientMedicalHistory(Resource):
    @staticmethod
    @patient_association_required()
    @swag_from(
        "../../specifications/patient-medical-history-get.yml",
        methods=["GET"],
        endpoint="patient_medical_history",
    )
    def get(patient_id: str):
        medical = crud.read_patient_current_medical_record(patient_id, False)
        drug = crud.read_patient_current_medical_record(patient_id, True)
        return marshal.marshal_patient_medical_history(medical=medical, drug=drug)


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


# /api/patients/reading-assessment
class ReadingAssessment(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/reading-assessment-post.yml",
        methods=["POST"],
        endpoint="reading_assessment",
    )
    def post():
        json = request.get_json(force=True)
        reading_json = json["reading"]
        assessment_json = json["assessment"]

        error_message = readings.validate(reading_json)
        if error_message is not None:
            abort(400, message=error_message)
        error_message = assessments.validate(assessment_json)
        if error_message is not None:
            abort(400, message=error_message)

        userId = get_jwt_identity()["userId"]
        reading_json["userId"] = userId

        reading = marshal.unmarshal(ReadingOrm, reading_json)

        if crud.read(ReadingOrm, id=reading.id):
            abort(409, message=f"A reading already exists with id: {reading.id}")

        invariant.resolve_reading_invariants(reading)

        # Populate the dateAssessed and healthCareWorkerId fields of the followup
        assessment_json["dateAssessed"] = get_current_time()
        assessment_json["healthcareWorkerId"] = userId

        assessment = marshal.unmarshal(FollowUpOrm, assessment_json)

        crud.create(reading, refresh=True)
        crud.create(assessment)

        reading_json = marshal.marshal(reading)
        assessment_json = marshal.marshal(assessment)
        response_json = {"reading": reading_json, "assessment": assessment_json}

        return response_json, 201


# /api/patients/<string:patient_id>/get_all_records
class PatientAllRecords(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/patient-all-records-get.yml",
        methods=["GET"],
        endpoint="patient_get_all_records",
    )
    def get(patient_id: str):
        params = util.get_query_params(request)
        records = crud.read_patient_all_records(patient_id, **params)
        return [marshal.marshal_with_type(r) for r in records]


# /api/patients/admin
class PatientsAdmin(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/patients-admin-get.yml",
        methods=["GET"],
        endpoint="patients_admin",
    )
    # gets all patients, including archived, for admin use
    def get():
        user = get_jwt_identity()
        params = util.get_query_params(request)
        patients = view.admin_patient_view(user, **params)
        return serialize.serialize_patients_admin(patients)
