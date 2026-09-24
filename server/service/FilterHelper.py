from models import PatientOrm, UserOrm
from service.assoc import has_association


def annotated_global_patient_list(
    user: UserOrm,
    search: str,
) -> list[tuple[PatientOrm, bool]]:
    """
    Returns the global list of patients where each patient is paired with a boolean that
    is True if the patient is a member of the user's health facility and False if not.

    :param user: A user model
    :param search: A search query
    :return: A list of tuples
    """

    def __normalized_search(query: str, value: str) -> bool:
        """Return True if query appears in value, case-insensitively."""
        return query.upper() in value.upper()

    facility = user.health_facility
    all_patients = PatientOrm.query.all()
    return [
        (patient, has_association(patient=patient, facility=facility))
        for patient in all_patients
        if __normalized_search(search, patient.id)
        or __normalized_search(search, patient.name)
    ]
