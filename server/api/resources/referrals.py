import time
from typing import Any, Optional, cast

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data
from common import user_utils
from common.api_utils import (
    ReferralIdPath,
    SearchFilterQueryParams,
)
from data import crud, marshal
from models import HealthFacilityOrm, PatientOrm, ReferralOrm
from service import assoc, serialize, view

from common.commonUtil import get_current_time
from validation.referrals import (
    CancelStatus,
    NotAttendReason,
    ReferralList,
    ReferralModel,
)

# /api/referrals
api_referrals = APIBlueprint(
    name="referrals",
    import_name=__name__,
    url_prefix="/referrals",
    abp_tags=[Tag(name="Referrals", description="")],
    abp_security=[{"jwt": []}],
)


class GetReferralsListQueryParams(SearchFilterQueryParams):
    health_facilities: list[str] = []
    referrers: list[str] = []
    vital_signs: list[str] = []
    is_pregnant: Optional[str] = None
    is_assessed: Optional[str] = None
    date_range: Optional[str] = None


# /api/referrals [GET]
@api_referrals.get("", responses={200: ReferralList})
def get_referrals_list(query: GetReferralsListQueryParams):
    """
    Get Referrals List
    Returns a list of Referrals that match the search criteria specified by the
    query parameters.
    """
    current_user = user_utils.get_current_user_from_jwt()

    if "default" in query.health_facilities:
        query.health_facilities.append(current_user["health_facility_name"])

    user = cast(dict[Any, Any], current_user)
    referrals = view.referral_list_view(user, **query.model_dump())

    return serialize.serialize_referral_list(referrals)


# /api/referrals [POST]
@api_referrals.post("", responses={201: ReferralModel})
def create_new_referral(body: ReferralModel):
    """Create New Referral"""
    health_facility = crud.read(
        HealthFacilityOrm,
        name=body.health_facility_name,
    )

    if health_facility is None:
        return abort(404, description="Health facility does not exist.")
    UTCTime = str(round(time.time() * 1000))
    crud.update(
        HealthFacilityOrm,
        {"new_referrals": UTCTime},
        True,
        name=body.health_facility_name,
    )

    if body.user_id is None:
        body.user_id = user_utils.get_current_user_from_jwt()["id"]

    patient = crud.read(PatientOrm, id=body.patient_id)
    if patient is None:
        return abort(404, description="Patient does not exist.")

    referral = marshal.unmarshal(ReferralOrm, body.model_dump())

    crud.create(referral, refresh=True)
    # Creating a referral also associates the corresponding patient to the health
    # facility they were referred to.
    patient = referral.patient
    facility = referral.health_facility
    if not assoc.has_association(patient, facility):
        assoc.associate(patient, facility=facility)
    return marshal.marshal(referral), 201


# /api/referrals/<string:referral_id> [GET]
@api_referrals.get("/<string:referral_id>", responses={200: ReferralModel})
def get_referral(path: ReferralIdPath):
    """Get Referral"""
    referral = crud.read(ReferralOrm, id=path.referral_id)
    if referral is None:
        return abort(404, description=f"No Referral with ID: {path.referral_id}")
    return marshal.marshal(referral)


# /api/referrals/assess/<string:referral_id> [PUT]
@api_referrals.put("/assess/<string:referral_id>", responses={200: ReferralModel})
def update_referral_assessed(path: ReferralIdPath):
    """
    Update Referral (Assessed)
    Marks the Referral as having been assessed.
    """
    referral = crud.read(ReferralOrm, id=path.referral_id)
    if referral is None:
        return abort(404, description=f"No Referral with ID: {path.referral_id}")

    if not referral.is_assessed:
        referral.is_assessed = True
        referral.date_assessed = get_current_time()
        data.db_session.commit()
        data.db_session.refresh(referral)

    return marshal.marshal(referral), 200


# /api/referrals/cancel-status-switch/<string:referral_id> [PUT]
@api_referrals.put(
    "/cancel-status-switch/<string:referral_id>", responses={200: ReferralModel}
)
def update_referral_cancel_status(path: ReferralIdPath, body: CancelStatus):
    """Update Referral (Cancel Status)"""
    if crud.read(ReferralOrm, id=path.referral_id) is None:
        return abort(404, description=f"No referral with ID: {path.referral_id}")

    cancel_status_model_dump = body.model_dump()

    if not body.is_cancelled:
        cancel_status_model_dump["cancel_reason"] = None
        cancel_status_model_dump["date_cancelled"] = None
    else:
        cancel_status_model_dump["date_cancelled"] = get_current_time()

    crud.update(ReferralOrm, cancel_status_model_dump, id=path.referral_id)

    referral = crud.read(ReferralOrm, id=path.referral_id)
    data.db_session.commit()
    data.db_session.refresh(referral)

    return marshal.marshal(referral)


# /api/referrals/not-attend/<string:referral_id> [PUT]
@api_referrals.put("/not-attend/<string:referral_id>", responses={200: ReferralModel})
def update_referral_not_attend(path: ReferralIdPath, body: NotAttendReason):
    """Update Referral (Not Attend)"""
    referral = crud.read(ReferralOrm, id=path.referral_id)
    if referral is None:
        return abort(404, description=f"No referral with id {path.referral_id}")

    not_attend_model_dump = body.model_dump()
    if not referral.not_attended:
        referral.not_attended = True
        referral.not_attend_reason = not_attend_model_dump["not_attend_reason"]
        referral.date_not_attended = get_current_time()
        data.db_session.commit()
        data.db_session.refresh(referral)

    return marshal.marshal(referral)
