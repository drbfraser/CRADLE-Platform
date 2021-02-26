from flasgger import swag_from
from flask import request, jsonify
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort
from manager.StatsManager import StatsManager
from flask import Response

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


# TODO Add role checks and 400 errors 


class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-all.yml", methods=["GET"])

    #TODO bunch up stats
    ## Get all statistics for patients
    def get():
        stats = statsManager.put_data_together()
        return stats


class FacilityReadings(Resource):
    @staticmethod
    @jwt_required
    
    def get(facility_id: str):
        args = {"to": request.args.get("to"), "from":request.args.get("from")}


        patients = crud.get_unique_patients_with_readings(args=args)    
        print(patients)
        #parse args
        




class UserReadings(Resource):
    @staticmethod
    @jwt_required

    def get(user_id: int):
        pass


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
        return Response(jsonify({"unique_patients": res}),status= 200)


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
        return {"total_readings": res},200


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
