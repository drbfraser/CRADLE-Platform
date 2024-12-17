from typing import Union

from config import db
from models import PatientOrm, ReadingOrm


def resolve_reading_invariants(obj: Union[PatientOrm, ReadingOrm]):
    """
    Resolves various invariants which must be held by reading objects.

    This function should be called on any newly created reading (or patient) object in
    order to ensure that said object is sound before inserting it into the database.

    :param obj:
    :return:
    """
    if isinstance(obj, PatientOrm):
        for r in obj.readings:
            resolve_reading_invariants(r)
        return

    # Ensure that the reading's traffic light status is present and valid
    obj.traffic_light_status = obj.get_traffic_light()

    # Commit any changes to the database
    db.session.commit()


def resolve_reading_invariants_mobile(obj: Union[PatientOrm, ReadingOrm]):
    """
    Resolves various invariants which must be held by reading objects.

    This function should be called on any newly created reading (or patient) object in
    order to ensure that said object is sound before inserting it into the database.

    :param obj:
    :return:
    """
    if isinstance(obj, PatientOrm):
        for r in obj.readings:
            resolve_reading_invariants_mobile(r)
        return

    # Ensure that the reading's traffic light status is present and valid
    obj.traffic_light_status = obj.get_traffic_light()

    # Ensure that if a obj has both a referral and assessment, then it's referral
    # is marked as assessed.
    if obj.referral and obj.followup:
        obj.referral.is_assessed = True
    db.session.commit()
