
# This module provides functions to validate the request data for a Referral.

from Manager import PatientManager
from models import User, Patient, HealthFacility, Reading, FollowUp
import json

class ReferralValidator(object):
    def validate(self, new_ref):
        """
            description:
                validates a referral dict as contain valid fields
            rules:
                userId belongs to a valid User, required
                patientId belongs to a valid Patient, required
                referralHealthFacilityId belongs to a valid HealthFacility, required
                readingId belongs to a valid Reading, required
                followUpId belongs to a valid FollowUp
        """ 
        print("validating referral")

        string_fields = {'dateReferred', 'comment', 'actionTaken'}

        for key in new_ref:
            if key == "userId":
                self.exists(User, "id", new_ref[key])
            elif key == "patientId":
                self.exists(Patient, "patientId", new_ref[key])
            elif key == "referralHealthFacilityName":
                self.exists(HealthFacility, "healthFacilityName", new_ref[key])
            elif key == "readingId":
                self.exists(Reading, "readingId", new_ref[key])
            elif key == "followUpId":
                self.exists(FollowUp, "id", new_ref[key])
            elif key in string_fields:
                self.isString(key, new_ref)
            elif key == "id":
                self.isString(key, new_ref)
            else:
                raise Exception(f'{key} is not a valid referral field')

    def isString(self, key, new_ref):
        if not isinstance(new_ref[key], str):
            raise Exception(f'{key}: {new_ref[key]} must be a string')

    def isInt(self, key, new_ref):
        if not isinstance(new_ref[key], int):
            raise Exception(f'{key}: {new_ref[key]} must be an int')


    def exists(self, table, key, val):
        filter = {
            key: val
        }
        res = table.query.filter_by(**filter).one_or_none()
        # res = table.query.filter_by(key=val).one_or_none()
        if not res:
            raise Exception(f'{key}: {val} does not belong to an existing {table.__tablename__}')
    
    def enforce_required(self, new_ref):
        required = {
            "dateReferred",
            # "userId",
            "patientId",
            "referralHealthFacilityName",
            "readingId"
        }
        for key in new_ref:
            if key in required:
                required.remove(key)
            
        if len(required) > 0:
            raise Exception(f'Required keys: {required}, missing')
            

