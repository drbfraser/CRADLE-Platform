from models import HealthFacility, HealthFacilitySchema

from .Database import Database


class HealthFacilityRepo(Database):
    def __init__(self):
        super(HealthFacilityRepo, self).__init__(
            table=HealthFacility, schema=HealthFacilitySchema
        )
