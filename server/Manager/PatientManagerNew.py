from Database.PatientRepoNew import PatientRepo
from Manager.Manager import Manager

class PatientManager(Manager):
    def __init__(self):
        Manager.__init__(self, PatientRepo)