from typing import Tuple

import manager.FilterHelper as filter
from database.PatientRepoNew import PatientRepo
from database.ReadingRepoNew import ReadingRepo
from database.UserRepo import UserRepo
from manager.GlobalSearchHelper import to_global_search_patient
from manager.Manager import Manager
from models import Patient, Reading


class PatientManager(Manager):
    def __init__(self):
        Manager.__init__(self, PatientRepo)

    def get_global_search_patients(self, current_user, search):
        def __make_gs_patient_dict(p: Patient, is_added: bool) -> dict:
            patient_dict = PatientRepo().model_to_dict(p)
            patient_dict["state"] = "Added" if is_added else "Add"
            return patient_dict

        user = UserRepo().select_one(id=current_user["userId"])
        pairs = filter.annotated_global_patient_list(user, search)
        patients_query = [__make_gs_patient_dict(p, state) for (p, state) in pairs]
        return [to_global_search_patient(p) for p in patients_query]

    def get_patient_with_referral_and_reading(self, current_user):
        user = UserRepo().select_one(id=current_user["userId"])
        roles = current_user["roles"]
        if "ADMIN" in roles:
            patients = Patient.query.all()
        elif "HCW" in roles:
            patients = filter.patients_for_hcw(user)
        elif "CHO" in roles:
            patients = filter.patients_for_cho(user)
        elif "VHT" in roles:
            patients = filter.patients_for_vht(user)
        else:
            raise PermissionError(
                "You do not have the necessary role(s) to view patients. Contact an admin for assistance."
            )

        return [self.__make_patient_readings_and_referrals(p) for p in patients]

    @staticmethod
    def __make_patient_readings_and_referrals(patient: Patient) -> dict:
        tuples = [
            PatientManager.__make_reading_and_referral(r) for r in patient.readings
        ]
        reading_dicts = [t[0] for t in tuples]
        needs_assessment = any([t[1] for t in tuples])
        patient_dict = PatientRepo().model_to_dict(patient)
        patient_dict["readings"] = reading_dicts
        patient_dict["needsAssessment"] = needs_assessment
        return patient_dict

    @staticmethod
    def __make_reading_and_referral(reading: Reading) -> Tuple[dict, bool]:
        reading_dict = ReadingRepo().model_to_dict(reading)
        referral = reading.referral
        needs_assessment = False
        if referral:
            reading_dict["comment"] = referral.comment
            reading_dict["dateReferred"] = referral.dateReferred
            reading_dict["healthFacilityName"] = referral.referralHealthFacilityName
            needs_assessment = not referral.isAssessed
        return reading_dict, needs_assessment
