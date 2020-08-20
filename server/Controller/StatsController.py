from flask_restful import Resource
from Manager.StatsManager import StatsManager
from Manager.PatientStatsManager import PatientStatsManager
from flask_jwt_extended import jwt_required
from flasgger import swag_from

statsManager = StatsManager()


class AllStats(Resource):
    # GET api/stats
    # Get global stats
    @jwt_required
    @swag_from("../specifications/stats-all.yml", methods=["GET"])
    def get(self):
        stats = statsManager.put_data_together()
        return stats
