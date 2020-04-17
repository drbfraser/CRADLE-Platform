from flask_restful import Resource
from Manager.StatsManager import StatsManager
from flask_jwt_extended import jwt_required
from flasgger import swag_from

statsManager = StatsManager()
class AllStats(Resource):
    """ 
        Description: returns a json object with the following:
            total number of readings per month
            total number of referrals per month
            total number of assesments done (patients that were followed up) per month
            total number of referrals made for pregnant patients per month
            total number of referrals made for pregnant patients that were followed up per month
            each quantity is of an array, each index in the array refers to that index-1 month
    """

    # TO DO: NEED TO ADD ERROR CHECKING
    # TO DO: NEED TO RETURN JSON IN NICER FORMAT
    # GET api/stats
    @jwt_required
    @swag_from('../specifications/stats-all.yml', methods=['GET'])
    def get(self):
        stats = statsManager.put_data_together()
        return stats

