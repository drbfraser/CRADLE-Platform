from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort



## Building boilerplate for the future stats functions.
class AllStats(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../specifications/stats-all.yml", methods=["GET"])

    ## Get all statistics for patients
    def get(self):
        stats = statsManager.put_data_together()
        return stats


class UniqueReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-unique-patients-get.yml", 
                methods = ["GET"], 
                endpoint = 'unique_patients')
    
    ## Get unique patients with >= 1 readings
    def get(self):
        pass 


class TotalReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-total-readings-get.yml")
    
    ## Get total number of readings completed
    def get(self):
        pass


class ColorReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-color-readings-get.yml")

    ## Get number of varying coloured readings (red up, yellow down, etc.)
    def get(self):
        pass


class SentReferrals(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-sent-referrals-get.yml")

    ## Get total number of sent referrals 
    def get(self):
        pass


class ReferredPatients(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-referred-patients.yml")

    ## Get number of referred patients
    def get(self):
        pass


class TimeFrameReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from("../../specifications/stats-time-framed-readings.yml")

    ## Get number of days during specified time frame in which there was >= 1 reading completed
    def get(self):
        pass