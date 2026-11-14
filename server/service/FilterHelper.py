from typing import Callable

from sqlalchemy import func, or_

from common.user_utils import UserDict
from models import PatientOrm, UserOrm
from service.assoc import has_association
from service.patient_authorization import scope_query_to_accessible_patients


def annotated_global_patient_list(
    user: UserOrm,
    search: str,
    current_user: UserDict,
    *,
    scope_query: Callable = scope_query_to_accessible_patients,
) -> list[tuple[PatientOrm, bool]]:
    """
    Returns the patients that the current user can access and that match the search,
    where each patient is paired with a boolean that is True if the patient is a member
    of the user's health facility and False if not.

    :param user: A user model
    :param search: A search query
    :param current_user: JWT ID used to scope the patients
    :param scope_query: Function that limits the query to accessible patients
    :return: A list of tuples
    """
    search = search.upper()
    query = PatientOrm.query.filter(
        or_(
            func.upper(PatientOrm.id).contains(search, autoescape=True),
            func.upper(PatientOrm.patient_number).contains(search, autoescape=True),
            func.upper(PatientOrm.name).contains(search, autoescape=True),
        )
    )
    query = scope_query(query, PatientOrm.id, current_user)

    facility = user.health_facility
    return [
        (patient, has_association(patient=patient, facility=facility))
        for patient in query.all()
    ]
