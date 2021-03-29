from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from manager.StatsManager import StatsManager

from flask_jwt_extended import jwt_required

from api.decorator import roles_required
from models import TrafficLightEnum, RoleEnum
import data.crud as crud

statsManager = StatsManager()


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
    total_referrals = crud.get_sent_referrals(facility=facility_id, filter=args)[0][0]

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


class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats.yml", methods=["GET"])

    ## Get all statistics for patients
    def get():

        stats = statsManager.put_data_together()
        return stats, 200


class AllStats(Resource):
    @staticmethod
    @jwt_required
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/stats-all.yml", methods=["GET"])

    ## Get all statistics for patients
    def get():

        # Date filters default to max range
        args = {"from": "0", "to": "2147483647"}

        if request.args.get("from") is not None:
            args["from"] = str(request.args.get("from"))
        if request.args.get("to") is not None:
            args["to"] = str(request.args.get("to"))

        response = query_stats_data(args)

        return response, 200


class FacilityReadings(Resource):
    @staticmethod
    @jwt_required
    @roles_required([RoleEnum.ADMIN, RoleEnum.CHO, RoleEnum.HCW])
    @swag_from("../../specifications/stats-facility.yml", methods=["GET"])
    def get(facility_id: str):

        args = {"from": "0", "to": "2147483647"}

        if request.args.get("from") is not None:
            args["from"] = str(request.args.get("from"))
        if request.args.get("to") is not None:
            args["to"] = str(request.args.get("to"))

        response = query_stats_data(args, facility_id=facility_id)
        return response, 200


class UserReadings(Resource):
    @staticmethod
    @jwt_required
    @roles_required([RoleEnum.ADMIN, RoleEnum.CHO, RoleEnum.HCW, RoleEnum.VHT])
    @swag_from("../../specifications/stats-user.yml", methods=["GET"])
    def get(user_id: int):

        args = {"from": "0", "to": "2147483647"}

        if request.args.get("from") is not None:
            args["from"] = str(request.args.get("from"))
        if request.args.get("to") is not None:
            args["to"] = str(request.args.get("to"))

        response = query_stats_data(args, user_id=user_id)

        return response, 200
