from models import PatientFacility, PatientFacilitySchema

from .Database import Database

class PatientFacilityRepo(Database):
    def __init__(self):
        super(PatientFacilityRepo, self).__init__(
            table=PatientFacility,
            schema=PatientFacilitySchema
        )