from Database.FollowUpRepo import FollowUpRepo
from Manager.Manager import Manager
from Manager import referralManager

class FollowUpManager(Manager):
    def __init__(self):
        Manager.__init__(self, FollowUpRepo)

    def create(self, data):
        if "referral" in data: 
            referral_id = data["referral"]
            data.pop("referral", None)
            res = super(FollowUpManager, self).create(data)        
            referralManager.update("id", referral_id, {
                "followUpId": res["id"]
            })
            res["referral"] = int(referral_id)
            return res
        else:
            return super(FollowUpManager, self).create(data)

    def update(self, key, value, new_data):
        if "referral" in new_data: 
            referral_id = new_data["referral"]
            new_data.pop("referral", None)
            res = super(FollowUpManager, self).update(key, value, new_data)        
            referralManager.update("id", referral_id, {
                "followUpId": res["id"]
            })
            res["referral"] = int(referral_id)
            return res
        else:
            return super(FollowUpManager, self).update(key, value, new_data)        


        