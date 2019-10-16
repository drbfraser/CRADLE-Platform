from models import FollowUp, FollowUpSchema

from .Database import Database

class FollowUpRepo(Database):
    def __init__(self):
        super(FollowUpRepo, self).__init__(
            table=FollowUp,
            schema=FollowUpSchema
        )