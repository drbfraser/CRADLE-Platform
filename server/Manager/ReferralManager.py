from Database.ReferralRepo import ReferralRepo
from Manager.Manager import Manager

class ReferralManager(Manager):
    def __init__(self):
        Manager.__init__(self, ReferralRepo)