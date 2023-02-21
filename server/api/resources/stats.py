from flasgger import swag_from
from flask import request
from flask_restful import Resource

from flask_jwt_extended import get_jwt_identity

from datetime import date
from dateutil.relativedelta import relativedelta
from models import User

from api.decorator import roles_required
from enums import RoleEnum, TrafficLightEnum
import data.crud as crud


MYSQL_BIGINT_MAX = (2 ** 63) - 1


def query_stats_data(args, facility_id="%", user_id="%"):

    patients = crud.get_unique_patients_with_readings(
        facility=facility_id, user=user_id, filter=args
    )[0][0]
    total_readings = crud.get_total_readings_completed(
        facility=facility_id, user=user_id, filter=args
    )[0][0]
    color_readings_q = crud.get_total_color_readings(
        facility=facility_id, user=user_id, filter=args
    )
    total_referrals = crud.get_sent_referrals(
        facility=facility_id, user=user_id, filter=args
    )[0][0]

    days_with_readings = crud.get_days_with_readings(
        facility=facility_id, user=user_id, filter=args
    )[0][0]

    color_readings = create_color_readings(color_readings_q)

    response_json = {
        "sent_referrals": total_referrals,
        "days_with_readings": days_with_readings,
        "unique_patient_readings": patients,
        "total_readings": total_readings,
        "color_readings": color_readings,
    }

    if user_id == "%":
        referred_patients = crud.get_referred_patients(
            facility=facility_id, filter=args
        )[0][0]
        response_json["patients_referred"] = referred_patients

    return response_json


def create_color_readings(color_readings_q):
    color_readings = {
        TrafficLightEnum.GREEN.value: 0,
        TrafficLightEnum.YELLOW_UP.value: 0,
        TrafficLightEnum.YELLOW_DOWN.value: 0,
        TrafficLightEnum.RED_UP.value: 0,
        TrafficLightEnum.RED_DOWN.value: 0,
    }

    for reading in color_readings_q:
        if color_readings.get(reading[0]) is not None:
            color_readings[reading[0]] = reading[1]

    return color_readings


def get_filter_data(request):
    filter = {}
    filter["from"] = str(request.args.get("from", default="0", type=str))
    filter["to"] = str(request.args.get("to", default=str(MYSQL_BIGINT_MAX), type=str))
    return filter


# api/stats/all [GET]
class AllStats(Resource):
    @staticmethod
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/stats-all.yml", methods=["GET"])

    ## Get all statistics for patients
    def get():

        # Date filters default to max range
        filter = get_filter_data(request)

        response = query_stats_data(filter)

        return response, 200


# api/stats/facility/<string:facility_id> [GET]
class FacilityReadings(Resource):
    @staticmethod
    @roles_required([RoleEnum.ADMIN, RoleEnum.HCW])
    @swag_from("../../specifications/stats-facility.yml", methods=["GET"])
    def get(facility_id: str):

        jwt = get_jwt_identity()

        if (
            jwt["role"] == RoleEnum.HCW.value
            and jwt["healthFacilityName"] != facility_id
        ):
            return "Unauthorized to view this facility", 401

        filter = get_filter_data(request)

        response = query_stats_data(filter, facility_id=facility_id)
        return response, 200


def hasPermissionToViewUser(user_id):
    jwt = get_jwt_identity()
    role = jwt["role"]
    isCurrentUser = jwt["userId"] == user_id

    if isCurrentUser:
        return True

    if role == RoleEnum.VHT.value:
        return False

    if role == RoleEnum.CHO.value:
        supervised = crud.get_supervised_vhts(jwt["userId"])
        supervised = [(lambda user: user[0])(user) for user in supervised]
        if user_id not in supervised:
            return False

    if role == RoleEnum.HCW.value:
        user = crud.read(User, id=user_id)
        if jwt["healthFacilityName"] != user.healthFacilityName:
            return False

    return True


# api/stats/user/<int:user_id> [GET]
class UserReadings(Resource):
    @staticmethod
    @roles_required([RoleEnum.ADMIN, RoleEnum.CHO, RoleEnum.HCW, RoleEnum.VHT])
    @swag_from("../../specifications/stats-user.yml", methods=["GET"])
    def get(user_id: int):

        if not hasPermissionToViewUser(user_id):
            return "Unauthorized to view this endpoint", 401

        filter = get_filter_data(request)

        response = query_stats_data(filter, user_id=user_id)

        return response, 200


# api/stats/export/<int:user_id> [GET]
class ExportStats(Resource):
    @staticmethod
    @roles_required([RoleEnum.ADMIN, RoleEnum.CHO, RoleEnum.HCW, RoleEnum.VHT])
    @swag_from("../../specifications/stats-export.yml")
    def get(user_id: int):

        filter = get_filter_data(request)

        if crud.read(User, id=user_id) == None:
            return "User with this ID does not exist", 404

        if not hasPermissionToViewUser(user_id):
            return "Unauthorized to view this endpoint", 401

        query_response = crud.get_export_data(user_id, filter)
        response = []
        for entry in query_response:
            age = relativedelta(date.today(), entry["dob"]).years
            traffic_light = entry.get("trafficLightStatus")
            color = None
            if traffic_light:
                traffic_light = traffic_light.split("_")
                color = traffic_light[0]

            arrow = None
            if len(traffic_light) > 1:
                arrow = traffic_light[1]

            response.append(
                {
                    "referral_date": entry.get("dateReferred"),
                    "patientId": entry.get("patientId"),
                    "name": entry.get("patientName"),
                    "sex": entry.get("patientSex"),
                    "age": age,
                    "pregnant": bool(entry.get("isPregnant")),
                    "systolic_bp": entry.get("bpSystolic"),
                    "diastolic_bp": entry.get("bpDiastolic"),
                    "heart_rate": entry.get("heartRateBPM"),
                    "traffic_color": color,
                    "traffic_arrow": arrow,
                }
            )

        return response, 200
