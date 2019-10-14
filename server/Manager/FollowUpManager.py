from Database.FollowUpRepo import FollowUpRepo
from Manager.Manager import Manager


class FollowUpManager(Manager):
    def __init__(self):
        Manager.__init__(self, FollowUpRepo)