from Database.ReadingRepoNew import ReadingRepo
from Manager.Manager import Manager

class ReadingManager(Manager):
    def __init__(self):
        Manager.__init__(self, ReadingRepo)