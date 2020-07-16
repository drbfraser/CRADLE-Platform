from models import PatientAssociations, PatientAssociationsSchema
from .Database import Database


class PatientAssociationsRepo(Database):
    def __init__(self):
        super(PatientAssociationsRepo, self).__init__(
            table=PatientAssociations, schema=PatientAssociationsSchema
        )
