from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from manager.StatsManager import StatsManager

from flask_jwt_extended import jwt_required

from datetime import date
from dateutil.relativedelta import relativedelta
from models import User

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


# api/stats/all [GET]
class AllStats(Resource):
    @staticmethod
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


# api/stats/facility/<string:facility_id> [GET]
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


# api/stats/user/<int:user_id> [GET]
class UserReadings(Resource):
    @staticmethod
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


# api/stats/export/<int:user_id> [GET]
class ExportStats(Resource):
    @staticmethod
    @roles_required([RoleEnum.ADMIN, RoleEnum.CHO, RoleEnum.HCW])
    @swag_from("../../specifications/stats-export.yml")
    def get(user_id: int):

        if crud.read(User, id=user_id) == None:
            return "User with this ID does not exist", 404

        query_response = crud.get_export_data(user_id)
        response = []
        for entry in query_response:
            age = relativedelta(date.today(), entry["dob"]).years
            traffic_light = entry["trafficLightStatus"].split("_")

            color = traffic_light[0]

            arrow = None
            if len(traffic_light) > 1:
                arrow = traffic_light[1]

            response.append(
                {
                    "referral_date": entry["dateReferred"],
                    "patientId": entry["patientId"],
                    "name": entry["patientName"],
                    "sex": entry["patientSex"],
                    "age": age,
                    "pregnant": bool(entry["isPregnant"]),
                    "systolic_bp": entry["bpSystolic"],
                    "diastolic_bp": entry["bpDiastolic"],
                    "heart_rate": entry["heartRateBPM"],
                    "traffic_color": color,
                    "traffic_arrow": arrow,
                }
            )

        return response, 200
