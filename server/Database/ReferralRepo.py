from models import Referral, ReferralSchema

from .Database import Database

class ReferralRepo(Database):
    def __init__(self):
        super(ReferralRepo, self).__init__(
            table=Referral,
            schema=ReferralSchema
        )