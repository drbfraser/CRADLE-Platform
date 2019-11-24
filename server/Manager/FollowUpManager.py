from Database.FollowUpRepo import FollowUpRepo
from Manager.Manager import Manager
from Manager import referralManager
from Manager import patientManager
from utils import get_current_time, pprint

class FollowUpManager(Manager):
    def __init__(self):
        Manager.__init__(self, FollowUpRepo)

    # include patient schema in response
    def mobile_read(self, key, value):
        follow_up = super(FollowUpManager, self).read(key, value)
        pprint(follow_up)
        return self.include_patient(follow_up)
    
    def mobile_search(self, search_dict):
        follow_ups = super(FollowUpManager, self).search(search_dict)
        for i in range(len(follow_ups)):
            follow_ups[i] = self.include_patient(follow_ups[i])
        return follow_ups

    def mobile_read_all(self):
        follow_ups = super(FollowUpManager, self).read_all()
        for i in range(len(follow_ups)):
            follow_ups[i] = self.include_patient(follow_ups[i])
        return follow_ups

    # attaches patient info to a follow_up dict if the follow_up is attached to a valid referral
    def include_patient(self, follow_up):
        if not follow_up['referral']:
            return follow_up
        
        referral = referralManager.read("id", follow_up['referral'])

        print("referral: ")
        pprint(referral)

        patient = patientManager.read("patientId", referral['patientId'])

        follow_up['patient'] = patient

        return follow_up

    def create(self, data, user):

        current_time = get_current_time()
        data['dateAssessed'] = current_time
        data['healthcareWorkerId'] = user['userId']

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

    def update(self, key, value, new_data, user):

        current_time = get_current_time()
        new_data['dateAssessed'] = current_time
        new_data['healthcareWorkerId'] = user['userId']

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


        