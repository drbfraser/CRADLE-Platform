import copy
import uuid

from Database.PatientRepository import PatientRepository


class PatientRepositoryLocal(PatientRepository):
    patientList = {}  # Global to all

    @staticmethod
    def model_to_dict(model):
        """Conversion method to a dict. Not used in this implementation.

        :param model:
        :return: Same parameter
        """
        return model

    @staticmethod
    def add_new_patient(info):
        patient_id = str(uuid.uuid4())
        PatientRepositoryLocal.patientList[patient_id] = copy.deepcopy(info)

        return {'id': patient_id}

    @staticmethod
    def get(patient_id):
        return PatientRepositoryLocal.patientList.get(patient_id)

    @staticmethod
    def get_all():
        if not PatientRepositoryLocal.patientList:
            return None
        return PatientRepositoryLocal.patientList

    @staticmethod
    def delete_all():
        PatientRepositoryLocal.patientList = {}
