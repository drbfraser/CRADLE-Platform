from typing import Tuple

import manager.FilterHelper as filter
from database.PatientRepo import PatientRepo
from database.ReadingRepo import ReadingRepo
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
