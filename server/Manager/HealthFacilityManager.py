# This module contains all Patient-related processing.
# import sys
# print("sys.path: " + str(sys.path))

from Database.HealthFacilityRepoNew import HealthFacilityRepo
from Manager.Manager import Manager


class HealthFacilityManager(Manager):
    def __init__(self):
        Manager.__init__(self, HealthFacilityRepo)