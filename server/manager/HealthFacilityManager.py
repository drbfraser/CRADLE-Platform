from database.HealthFacilityRepoNew import HealthFacilityRepo
from manager.Manager import Manager


class HealthFacilityManager(Manager):
    def __init__(self):
        Manager.__init__(self, HealthFacilityRepo)
