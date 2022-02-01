from typing import Union

import data
from models import Patient, Reading


def resolve_reading_invariants(obj: Union[Patient, Reading]):
    """
    Resolves various invariants which must be held by reading objects.

    This function should be called on any newly created reading (or patient) object in
    order to ensure that said object is sound before inserting it into the database.

    :param obj:
    :return:
    """
    if isinstance(obj, Patient):
        for r in obj.readings:
            resolve_reading_invariants(r)
        return

    # Ensure that the reading's traffic light status is present and valid
    obj.trafficLightStatus = obj.get_traffic_light()

    # Commit any changes to the database
    data.db_session.commit()


def resolve_reading_invariants_mobile(obj: Union[Patient, Reading]):
    """
    Resolves various invariants which must be held by reading objects.

    This function should be called on any newly created reading (or patient) object in
    order to ensure that said object is sound before inserting it into the database.

    :param obj:
    :return:
    """
    if isinstance(obj, Patient):
        for r in obj.readings:
            resolve_reading_invariants_mobile(r)
        return

    # Ensure that the reading's traffic light status is present and valid
    obj.trafficLightStatus = obj.get_traffic_light()

    # Ensure that if a obj has both a referral and assessment, then it's referral
    # is marked as assessed.
    if obj.referral and obj.followup:
        obj.referral.isAssessed = True
