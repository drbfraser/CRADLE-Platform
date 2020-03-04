from Database.PatientFacilityRepo import PatientFacilityRepo
from Manager.Manager import Manager


class PatientFacilityManager(Manager):
    def __init__(self):
        Manager.__init__(self, PatientFacilityRepo)