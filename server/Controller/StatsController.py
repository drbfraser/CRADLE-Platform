from flask_restful import Resource
from Manager.StatsManager import StatsManager
from Manager.PatientStatsManager import PatientStatsManager
from flask_jwt_extended import jwt_required
from flasgger import swag_from

statsManager = StatsManager()
patientStatsManager = PatientStatsManager()


class AllStats(Resource):
    # Get global stats
    # GET api/stats
    @jwt_required
    @swag_from("../specifications/stats-all.yml", methods=["GET"])
    def get(self):
        stats = statsManager.put_data_together()
        return stats


class PatientStats(Resource):
    # Get stats for a specific patient
    # GET /api/patient/stats/<string:patient_id>
    @jwt_required
    @swag_from("../specifications/stats-patient.yml", methods=["GET"])
    def get(self, patient_id):
        stats = patientStatsManager.put_data_together(patient_id)
        return stats
