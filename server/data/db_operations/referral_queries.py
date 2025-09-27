"""
referral_queries.py

This module provides query utilities for retrieving referral-related data from the
database.

Functions included:
- read_referral_list: Returns referrals with patient info and optional filters
  (health facilities, referrers, date range, pregnancy status, etc.).
- read_referrals_or_assessments: Generic query to fetch either referrals or
  assessments linked to patients, supporting filters for user association,
  patient ID, and last-edited timestamps.

This file separates referral and assessment query logic from the broader CRUD
operations (previously bundled in `crud.py`) to improve modularity and maintainability.
"""

import operator
from typing import Any, List, Optional, Union

from sqlalchemy import or_
from sqlalchemy.orm import aliased
from sqlalchemy.sql.expression import and_
from sqlalchemy.sql.functions import coalesce

from data import db_session
from data.db_operations import db_session
from data.db_operations.helper_utils import (
    __filter_by_patient_association,
    __filter_by_patient_search,
    __get_slice_indexes,
    __order_by_column,
)
from enums import TrafficLightEnum
from models import (
    AssessmentOrm,
    PatientOrm,
    PregnancyOrm,
    ReadingOrm,
    ReferralOrm,
)


def read_referral_list(
    user_id: Optional[int] = None,
    is_cho: bool = False,
    **kwargs,
) -> List[Any]:
    """
    Queries the database for referrals filtered by query criteria in keyword arguments.

    :param user_id: ID of user to filter patients wrt patient associations; None to get
    referrals associated with all users
    :param kwargs: Query params including search_text, order_by, direction, limit, page,
    health_facilities, referrers, date_range, is_assessed, is_pregnant, vital_signs

    :return: A list of referrals
    """
    # Fetch vital sign from reading prior to the referral within 4 hours
    four_hours_in_sec = 14400
    reading_subquery = (
        db_session.query(ReadingOrm.id)
        .filter(
            ReferralOrm.patient_id == ReadingOrm.patient_id,
            ReferralOrm.date_referred >= ReadingOrm.date_taken,
            ReferralOrm.date_referred <= ReadingOrm.date_taken + four_hours_in_sec,
        )
        .order_by(ReadingOrm.date_taken.desc())
        .limit(1)
        .correlate(ReferralOrm)
    )
    vital_sign_field = coalesce(
        ReadingOrm.traffic_light_status,
        TrafficLightEnum.NONE.value,
    ).label("vital_sign")

    query = (
        db_session.query(
            ReferralOrm.id.label("referral_id"),
            ReferralOrm.date_referred,
            ReferralOrm.is_assessed,
            PatientOrm.id.label("patient_id"),
            PatientOrm.name.label("patient_name"),
            PatientOrm.village_number,
            vital_sign_field,
        )
        .outerjoin(ReferralOrm, and_(ReferralOrm.patient_id == PatientOrm.id))
        .outerjoin(ReadingOrm, and_(ReadingOrm.id == reading_subquery))
        .filter(
            or_(PatientOrm.is_archived == False, PatientOrm.is_archived.is_(None)),
        )
    )

    query = __filter_by_patient_association(query, PatientOrm, user_id, is_cho)
    query = __filter_by_patient_search(query, **kwargs)
    query = __order_by_column(query, [ReferralOrm, PatientOrm, ReadingOrm], **kwargs)

    # Get kwargs values into variables
    health_facilities = kwargs.get("health_facilities")
    referrers = kwargs.get("referrers")
    date_range = kwargs.get("date_range")
    is_assessed = kwargs.get("is_assessed")
    is_pregnant = kwargs.get("is_pregnant")
    vital_signs = kwargs.get("vital_signs")
    limit = kwargs.get("limit")
    page = kwargs.get("page", 1)

    # Filter by health facilities
    if health_facilities is not None and len(health_facilities) > 0:
        query = query.filter(ReferralOrm.health_facility_name.in_(health_facilities))

    # Filter by referrers
    if referrers is not None and len(referrers) > 0:
        query = query.filter(ReferralOrm.user_id.in_(referrers))

    # Filter by date range
    if date_range is not None and date_range != "":
        start_date, end_date = date_range.split(":")
        query = query.filter(
            ReferralOrm.date_referred >= start_date,
            ReferralOrm.date_referred <= end_date,
        )

    # Filter by assessment status
    if is_assessed in ["1", "0"]:
        query = query.filter(ReferralOrm.is_assessed == (is_assessed == "1"))

    # Filter by pregnancy status
    if is_pregnant in ["1", "0"]:
        eq_op = operator.ne if is_pregnant == "1" else operator.eq
        pr = aliased(PregnancyOrm)
        query = (
            query.outerjoin(
                PregnancyOrm,
                and_(
                    PatientOrm.id == PregnancyOrm.patient_id,
                    PregnancyOrm.end_date.is_(None),
                ),
            )
            .outerjoin(
                pr,
                and_(
                    PatientOrm.id == pr.patient_id,
                    PregnancyOrm.start_date < pr.start_date,
                ),
            )
            .filter(eq_op(PregnancyOrm.start_date, None), pr.start_date.is_(None))
        )

    # Filter by vital signs
    if vital_signs is not None and len(vital_signs) > 0:
        query = query.filter(vital_sign_field.in_(vital_signs))

    if limit:
        return query.slice(*__get_slice_indexes(page, limit)).all()
    return query.all()


# Why is this one function?
# TODO: Split this into two different functions.
def read_referrals_or_assessments(
    model: Union[ReferralOrm, AssessmentOrm],
    patient_id: Optional[str] = None,
    user_id: Optional[int] = None,
    is_cho: bool = False,
    last_edited: Optional[int] = None,
) -> Union[List[ReferralOrm], List[AssessmentOrm]]:
    """
    Queries the database for referrals or assessments

    :param patient_id: ID of patient to filter referrals or assessments; by default this
    filter is not applied
    :param user_id: ID of user to filter patients wrt patient associations; by default
    this filter is not applied
    :param last_edited: Timestamp to filter referrals or assessments by last-edited time
    greater than the timestamp; by default this filter is not applied

    :return: A list of referrals or assessments
    """
    model_last_edited = (
        model.last_edited
        if model.schema() == ReferralOrm.schema()
        else model.date_assessed
    )
    query = db_session.query(model)

    query = __filter_by_patient_association(query, model, user_id, is_cho)

    if last_edited:
        query = query.filter(model_last_edited > last_edited)

    if patient_id:
        query = query.filter(model.patient_id == patient_id)

    return query.all()
