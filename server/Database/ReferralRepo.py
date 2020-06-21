from models import Referral, ReferralSchema
from config import db

from .Database import Database


class ReferralRepo(Database):
    def __init__(self):
        super(ReferralRepo, self).__init__(table=Referral, schema=ReferralSchema)

    """
    description:
        removes association with previous FollowUp,
        then creates association with new FollowUp
    """

    def update(self, key, value, new_data):
        if "followUpId" in new_data:
            search_dict = {}
            found_entry = self.table.query.filter_by(**search_dict).first()
            if found_entry:
                # remove association with previous FollowUp
                db.session.add(found_entry)
                found_entry.followUp = None
                found_entry.followUpId = None
                db.session.commit()
                return super(ReferralRepo, self).update(key, value, new_data)

        else:
            return super(ReferralRepo, self).update(key, value, new_data)
