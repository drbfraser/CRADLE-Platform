import abc


class PatientRepository(object, metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def add_new_patient(self, info):
        raise NotImplementedError('Must define an implementation for the PatientRepository interface.')

    @abc.abstractmethod
    def get(self, patient_id):
        raise NotImplementedError('Must define an implementation for the PatientRepository interface.')

    @abc.abstractmethod
    def get_all(self):
        raise NotImplementedError('Must define an implementation for the PatientRepository interface.')