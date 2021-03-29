from models import Patient, PatientSchema

from .Database import Database


class PatientRepo(Database):
    def __init__(self):
        super(PatientRepo, self).__init__(table=Patient, schema=PatientSchema)
