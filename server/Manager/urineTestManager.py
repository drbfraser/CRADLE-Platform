from Database.urineTestRepo import urineTestRepo
from Manager.Manager import Manager


class urineTestManager(Manager):
    def __init__(self):
        Manager.__init__(self, urineTestRepo)