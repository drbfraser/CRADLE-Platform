from flask_restful import Resource, abort
from flask_jwt_extended import jwt_required
from Manager.PatientStatsManager import PatientStatsManager
from Manager.PatientManagerNew import PatientManager as PatientManagerNew
from flasgger import swag_from

patientStatsManager = PatientStatsManager()

from Manager import patientManager


class PatientStats(Resource):
    """
    Description: Puts together a json object containing 
    the following monthly stats for a given patient:
        - bpSystolic 
        - bpDiastolic 
        - heartRate 
        - trafficLightStatus 
    """

    # TO DO: NEED TO RETURN JSON IN NICER FORMAT
    # TO DO: Add more error checking
    # GET /api/patient/stats/<string:patient_id>
    @jwt_required
    @swag_from("../specifications/stats-patient.yml", methods=["GET"])
    def get(self, patient_id):
        stats = patientStatsManager.put_data_together(patient_id)
        return stats
