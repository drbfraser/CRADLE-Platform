from database.urineTestRepo import urineTestRepo
from manager.Manager import Manager


class UrineTestManager(Manager):
    def __init__(self):
        Manager.__init__(self, urineTestRepo)
