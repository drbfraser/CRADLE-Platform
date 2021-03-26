from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from flask_restful import Resource

from manager.PatientManager import PatientManager

patientManager = PatientManager()

# URI: api/patient/global/<string:search>
# [GET]: Get a list of ALL patients and their basic information
#        (information necessary for the patient page)
#        if they match search criteria
#        For now search criteria could be:
#           a portion/full match of the patient's id
#           a portion/full match of the patient's initials
class PatientGlobalSearch(Resource):

    # get all patient information (patientinfo, readings, and referrals)
    @jwt_required
    def get(self, search):
        current_user = get_jwt_identity()
        patients_readings_referrals = patientManager.get_global_search_patients(
            current_user, search.upper()
        )

        if not patients_readings_referrals:
            return []
        else:
            return patients_readings_referrals
