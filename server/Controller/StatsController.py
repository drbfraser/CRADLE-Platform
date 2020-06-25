from flask_restful import Resource
from Manager.StatsManager import StatsManager
from Manager.PatientStatsManager import PatientStatsManager
from flask_jwt_extended import jwt_required
from flasgger import swag_from

statsManager = StatsManager()
patientStatsManager = PatientStatsManager()


class AllStats(Resource):
    # GET api/stats
    # Get global stats
    @jwt_required
    @swag_from("../specifications/stats-all.yml", methods=["GET"])
    def get(self):
        stats = statsManager.put_data_together()
        return stats


class PatientStats(Resource):

    # GET /api/patient/stats/<string:patient_id>
    # Get stats for a specific patient
    @jwt_required
    @swag_from("../specifications/stats-patient.yml", methods=["GET"])
    def get(self, patient_id):
        stats = patientStatsManager.put_data_together(patient_id)
        return stats
