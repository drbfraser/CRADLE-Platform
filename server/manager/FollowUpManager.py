from config import db
from database.FollowUpRepo import FollowUpRepo
from manager.Manager import Manager
from manager import referralManager
from manager import patientManager
from models import FollowUp
from utils import get_current_time


class FollowUpManager(Manager):
    def __init__(self):
        Manager.__init__(self, FollowUpRepo)

    # include patient schema in response
    def mobile_read(self, key, value):
        follow_up = super(FollowUpManager, self).read(key, value)
        if not follow_up:
            return follow_up
        follow_up = self.include_patient(follow_up)
        follow_up = self.include_referral(follow_up)
        return follow_up

    def mobile_search(self, search_dict):
        follow_ups = super(FollowUpManager, self).search(search_dict)
        if not follow_ups:
            return None
        for i in range(len(follow_ups)):
            follow_up = self.include_patient(follow_ups[i])
            follow_up = self.include_patient(follow_up)
            follow_up = self.include_referral(follow_up)
            follow_ups[i] = follow_up
        return follow_ups

    def mobile_read_all(self):
        follow_ups = super(FollowUpManager, self).read_all()
        if not follow_ups:
            return None
        for i in range(len(follow_ups)):
            follow_up = self.include_patient(follow_ups[i])
            follow_up = self.include_patient(follow_up)
            follow_up = self.include_referral(follow_up)
            follow_ups[i] = follow_up
        return follow_ups

    def mobile_read_summarized(self, key, value):
        follow_up = self.mobile_read(key, value)
        return self.mobile_summarize(follow_up)

    def mobile_search_summarized(self, search_dict):
        follow_ups = self.mobile_search(search_dict)
        if not follow_ups:
            return None
        for i in range(len(follow_ups)):
            follow_ups[i] = self.mobile_summarize(follow_ups[i])
        return follow_ups

    def mobile_read_all_summarized(self):
        follow_ups = self.mobile_read_all()
        if not follow_ups:
            return None
        for i in range(len(follow_ups)):
            follow_ups[i] = self.mobile_summarize(follow_ups[i])
        return follow_ups

    # attaches patient info to a follow_up dict if the follow_up is attached to a valid referral
    def include_patient(self, follow_up):
        if not follow_up["referral"]:
            return follow_up

        referral = referralManager.read("id", follow_up["referral"])
        patient = patientManager.read("patientId", referral["patientId"])
        follow_up["patient"] = patient
        return follow_up

    def include_referral(self, follow_up):
        if not follow_up["referral"]:
            return follow_up

        referral = referralManager.read("id", follow_up["referral"])
        follow_up["referral"] = referral
        return follow_up

    def mobile_summarize(self, follow_up):
        if not follow_up:
            return None

        res = {
            "id": follow_up["id"],
            "diagnosis": follow_up["diagnosis"],
            "followUpAction": follow_up["followupInstructions"],
            "treatment": follow_up["treatment"],
            "dateAssessed": follow_up["dateAssessed"],
            "followupNeeded": follow_up["followupNeeded"],
            "medicationPrescribed": follow_up["medicationPrescribed"],
            "specialInvestigations": follow_up["specialInvestigations"],
            "followUpNeededTill": follow_up["dateFollowupNeededTill"],
            "followupFrequencyUnit": follow_up["followupFrequencyUnit"],
            "followupFrequencyValue": follow_up["followupFrequencyValue"],
        }

        if "patient" in follow_up and follow_up["patient"]:
            res["patient"] = {}
            res["patient"]["drugHistory"] = follow_up["patient"]["drugHistory"]
            res["patient"]["medicalHistory"] = follow_up["patient"]["medicalHistory"]
            res["patient"]["patientId"] = follow_up["patient"]["patientId"]
        else:
            res["patient"] = None

        if "referral" in follow_up and follow_up["referral"]:
            res["readingId"] = follow_up["referral"]["readingId"]
            res["referredBy"] = follow_up["referral"]["userId"]
        else:
            res["readingId"] = None
            res["referredBy"] = None

        if "healthcareWorker" in follow_up and follow_up["healthcareWorker"]:
            res["healthFacility"] = {}
            res["healthFacility"]["healthcareWorker"] = {
                "id": follow_up["healthcareWorker"]["id"],
                "email": follow_up["healthcareWorker"]["email"],
            }
            res["healthFacility"]["name"] = follow_up["healthcareWorker"][
                "healthFacility"
            ]
        else:
            res["healthFacility"] = None

        return res

    def create_for_user(self, data: dict, user: dict) -> dict:
        """
        Creates a new follow up by inserting a row into the database and marking the
        associated referral (if any) as `assessed`.

        :param data: A dictionary containing followup information
        :param user: A dictionary containing information about the user that created
                     this followup
        :return: The new follow up that was inserted into the database
        """
        data["dateAssessed"] = get_current_time()
        data["healthcareWorkerId"] = user["userId"]
        repo: FollowUpRepo = self.database
        followup: FollowUp = repo.create_model(data)

        # If the followup's reading has an associated referral, mark that as assessed
        reading = followup.reading
        referral = reading.referral
        if referral:
            referral.isAssessed = True
            db.session.commit()

        return repo.model_to_dict(followup)

    def create(self, data, user):

        current_time = get_current_time()
        data["dateAssessed"] = current_time
        data["healthcareWorkerId"] = user["userId"]

        if "referral" in data:
            referral_id = data["referral"]
            data.pop("referral", None)
            res = super(FollowUpManager, self).create(data)
            referralManager.update("id", referral_id, {"followUpId": res["id"]})
            res["referral"] = int(referral_id)
            return res
        else:
            return super(FollowUpManager, self).create(data)

    def update(self, key, value, new_data, user):

        current_time = get_current_time()
        new_data["dateAssessed"] = current_time
        new_data["healthcareWorkerId"] = user["userId"]

        if "referral" in new_data:
            referral_id = new_data["referral"]
            new_data.pop("referral", None)
            res = super(FollowUpManager, self).update(key, value, new_data)
            referralManager.update("id", referral_id, {"followUpId": res["id"]})
            res["referral"] = int(referral_id)
            return res
        else:
            return super(FollowUpManager, self).update(key, value, new_data)
