from flasgger import swag_from
from flask import request, jsonify
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort
from manager.StatsManager import StatsManager

import data.crud as crud

statsManager = StatsManager()

 
#TODO 1
#   * Brian's initial idea for statistics:
#     * Display number of unique patients on which they have done one or more readings ✔
#     * Display number of readings completed (total) ✔ 
#     * Display number of green, yellow up, yellow down, red up, and red down readings. ✔
#     * Display total number of referrals sent; ✔
#     * Display total number of patients referred ✔
#     * Display number of days during the time frame on which they completed one or more readings.

#TODO 2
#     * error checks 

#TODO 3
#     * ask about query locations and maybe move the queries from CRUD

class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-all.yml", methods=["GET"])

    ## Get all statistics for patients
    def get():
        stats = statsManager.put_data_together()
        return stats


class UniqueReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-unique-patients-get.yml", 
                methods = ["GET"])
    
    ## Get unique patients with >= 1 readings
    def get():
        query_res = crud.get_unique_patients_with_readings()
        res = 0
        for row in query_res: 
            res = row[0]
        return jsonify ({'unique_patients': res})    

     


class TotalReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-total-readings-get.yml",
                methods = ["GET"])

    ## Get total number of readings completed
    def get():
        query_res = crud.get_total_readings_completed()
        res = 0
        for row in query_res: 
            res = row[0]
        return jsonify({'total_readings':res})


class ColorReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-color-readings-get.yml",
                methods = ["GET"])

    ## Get number of varying coloured readings (red up, yellow down, etc.)
    def get():
        query_res = crud.get_total_color_readings()
        res = {}
        for row in query_res: 
            res[row[0]] = row[1]
        return jsonify({'color_readings': res})


class SentReferrals(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-sent-referrals-get.yml", 
                methods = ["GET"])

    ## Get total number of sent referrals 
    def get():
        res = 0
        query_res = crud.get_sent_referrals()
        for row in query_res:
            res = row[0]
        return jsonify({'sent_referrals':res})
        

class ReferredPatients(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-referred-patients-get.yml",
                methods = ["GET"])

    ## Get number of referred patients
    def get():
        res = 0
        query_res = crud.get_referred_patients()
        for row in query_res:
            res = row[0]
        return jsonify({'patients_referered': res})


class TimeFrameReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-time-framed-readings-get.yml", 
                methods = ["POST"])

    ## Get number of days during specified time frame in which there was >= 1 reading completed
    def post():
        json = request.get_json(force = True) 
        # TODO validate the post request 
        print(json)
        res = 0 
        return jsonify({'days_with_readings': res})