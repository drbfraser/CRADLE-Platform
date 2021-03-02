from flasgger import swag_from
from flask import request, jsonify
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort
from manager.StatsManager import StatsManager
from flask import Response

from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    jwt_refresh_token_required,
    get_jwt_identity,
)

from models import TrafficLightEnum, RoleEnum
import data.crud as crud
from validation import stats

statsManager = StatsManager()


# *Required Stats
#   * Brian's initial idea for statistics:
#     * Display number of unique patients on which they have done one or more readings ✔
#     * Display number of readings completed (total) ✔
#     * Display number of green, yellow up, yellow down, red up, and red down readings. ✔
#     * Display total number of referrals sent; ✔
#     * Display total number of patients referred you YOUR facility ✔
#     * Display number of days during the time frame on which they completed one or more readings.



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
    @swag_from("../../specifications/stats-all.yml", methods=["GET"])

    ## Get all statistics for patients
    def get():
        stats = statsManager.put_data_together()
        return stats


class FacilityReadings(Resource):

    @staticmethod
    @jwt_required
    def get(facility_id: str):

        current_user = get_jwt_identity()
        user_roles = current_user.get("roles")

        print (user_roles)

        # Big int date range
        args = {"from": "0", "to": "2147483647"}

        if request.args.get("from") is not None:
            args["from"] = str(request.args.get("from"))
        if request.args.get("to") is not None:
            args["to"] = str(request.args.get("to"))

        # Query all stats data
        patients = crud.get_unique_patients_with_readings(
            facility=facility_id, filter=args
        )
        total_readings = crud.get_total_readings_completed(
            facility=facility_id, filter=args
        )
        color_readings_q = crud.get_total_color_readings(
            facility=facility_id, filter=args
        )
        total_referrals = crud.get_sent_referrals(facility=facility_id, filter=args)
        referred_patients = crud.get_referred_patients(
            facility=facility_id, filter=args
        )
        days_with_readings = crud.get_days_with_readings(
            facility=facility_id, filter=args
        )
        
        color_readings = create_color_readings(color_readings_q)


        response = {
            "patients_referred": referred_patients[0][0],
            "sent_referrals": total_referrals[0][0],
            "days_with_readings": days_with_readings[0][0],
            "unique_patient_readings": patients[0][0],
            "total_readings": total_readings[0][0],
            "color_readings": color_readings,
        }
        return response, 200


class UserReadings(Resource):

    @staticmethod
    @jwt_required
    def get(user_id: int):
        
        current_user = get_jwt_identity()
        user_roles = current_user.get("roles")

        #Date ranges from 0 to max big int value
        args = {"from": "0", "to": "2147483647"}


        if request.args.get("from") is not None:
            args["from"] = str(request.args.get("from"))
        if request.args.get("to") is not None:
            args["to"] = str(request.args.get("to"))

        # Query all stats data
        patients = crud.get_unique_patients_with_readings(
            user=user_id, filter=args
        )
        total_readings = crud.get_total_readings_completed(
            user=user_id, filter=args
        )
        color_readings_q = crud.get_total_color_readings(
            user=user_id, filter=args
        )
        total_referrals = crud.get_sent_referrals(user=user_id, filter=args)

        days_with_readings = crud.get_days_with_readings(
            user=user_id, filter=args
        )

        color_readings = create_color_readings(color_readings_q)

        response = {
            "patients_referred": None,
            "sent_referrals": total_referrals[0][0],
            "days_with_readings": days_with_readings[0][0],
            "unique_patient_readings": patients[0][0],
            "total_readings": total_readings[0][0],
            "color_readings": color_readings,
        }

        return response, 200


class UniqueReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-unique-patients-get.yml", methods=["GET"])

    ## Get unique patients with >= 1 readings
    def get(vht_id: int):
        query_res = crud.get_unique_patients_with_readings(vht_id)
        res = 0
        for row in query_res:
            res = row[0]
        return Response(jsonify({"unique_patients": res}), status=200)


class TotalReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-total-readings-get.yml", methods=["GET"])

    ## Get total number of readings completed
    def get(vht_id: int):
        query_res = crud.get_total_readings_completed(vht_id)
        res = 0
        for row in query_res:
            res = row[0]
        return {"total_readings": res}, 200


class ColorReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-color-readings-get.yml", methods=["GET"])

    ## Get number of varying coloured readings (red up, yellow down, etc.)
    def get(vht_id: int):
        query_res = crud.get_total_color_readings(vht_id)
        res = {}
        for row in query_res:
            res[row[0]] = row[1]
        return jsonify({"color_readings": res})


class SentReferrals(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-sent-referrals-get.yml", methods=["GET"])

    ## Get total number of sent referrals
    def get(vht_id: int):
        res = 0
        query_res = crud.get_sent_referrals(vht_id)
        for row in query_res:
            res = row[0]
        return jsonify({"sent_referrals": res})


class ReferredPatients(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-referred-patients-get.yml", methods=["GET"])

    ## Get number of referred patients
    def get(referral_facility: str):
        query_res = crud.get_referred_patients(referral_facility)
        if query_res is not None:
            for row in query_res:
                res = row[0]
            return jsonify({"patients_referered": res})
        else:
            return jsonify({"error": "invalid query"})


class TimeFrameReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/stats-time-framed-readings-post.yml", methods=["POST"]
    )

    ## Get number of days during specified time frame in which there was >= 1 reading completed
    def post():
        json = request.get_json(force=True)
        error_message = stats.validate_time_frame_readings(json)
        if error_message is not None:
            return jsonify({"error": error_message})

        timeframe = json["timeframe"]
        days = [timeframe["from"], timeframe["to"]]
        query_res = crud.get_days_with_readings(days)
        if query_res is not None:
            for row in query_res:
                res = row[0]
            return jsonify({"days_with_readings": res})
        else:
            return jsonify({"error": "invalid query"})
