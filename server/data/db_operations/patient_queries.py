"""
patient_queries.py

This module contains query functions focused on retrieving patient-related data
from the database. It provides utilities to list and filter patients, access
their medical and drug records, construct patient timelines, and gather related
entities such as readings, referrals, and assessments.

Functions included:
- read_patient_list / read_admin_patient: return patient lists with filters.
- read_medical_records / read_patient_current_medical_record: fetch medical or drug records.
- read_patient_timeline: combine pregnancy, medical, and drug history in order.
- read_patient_all_records: merge readings, referrals, assessments, and forms.
- read_patients: retrieve patients with their latest related records.
- read_readings: return readings with associated urine tests.

These functions encapsulate patient-centric database access, keeping query
logic organized and reusable across the application.
"""

from typing import Any, List, NamedTuple, Optional, Tuple, Type, Union

from sqlalchemy import or_
from sqlalchemy.orm import aliased
from sqlalchemy.sql.expression import and_, asc, desc, literal, null, text

from data.db_operations import M, db_session
from data.db_operations.helper_utils import (
    __filter_by_patient_association,
    __filter_by_patient_search,
    __get_slice_indexes,
    __order_by_column,
)
from models import (
    AssessmentOrm,
    FormOrm,
    MedicalRecordOrm,
    PatientOrm,
    PregnancyOrm,
    ReadingOrm,
    ReferralOrm,
    UrineTestOrm,
)


def read_patient_list(
    user_id: Optional[int] = None,
    is_cho: bool = False,
    **kwargs,
) -> List[Any]:
    """
    Queries the database for patients filtered by query criteria in keyword arguments.

    :param user_id: ID of user to filter patients wrt patient associations; None to get
    patients associated with all users
    :param kwargs: Query params including search_text, order_by, direction, limit, page

    :return: A list of patients
    """
    rd = aliased(ReadingOrm)
    query = (
        db_session.query(
            PatientOrm.id,
            PatientOrm.name,
            PatientOrm.village_number,
            ReadingOrm.traffic_light_status,
            ReadingOrm.date_taken,
        )
        .outerjoin(ReadingOrm, PatientOrm.readings)
        .outerjoin(
            rd,
            and_(
                PatientOrm.id == rd.patient_id,
                ReadingOrm.date_taken < rd.date_taken,
            ),
        )
        .filter(
            rd.date_taken.is_(None),
            or_(PatientOrm.is_archived == False, PatientOrm.is_archived.is_(None)),
        )
    )

    query = __filter_by_patient_association(query, PatientOrm, user_id, is_cho)
    query = __filter_by_patient_search(query, **kwargs)
    query = __order_by_column(query, [PatientOrm, ReadingOrm], **kwargs)

    limit = kwargs.get("limit")
    if limit:
        page = kwargs.get("page", 1)
        return query.slice(*__get_slice_indexes(page, limit))
    return query.all()


def read_admin_patient(
    user_id: Optional[int] = None,
    is_cho: bool = False,
    **kwargs,
) -> List[Any]:
    """
    Queries the database for patients filtered by query criteria in keyword arguments.

    :param user_id: ID of user to filter patients wrt patient associations; None to get
        patients associated with all users
    :param kwargs: Query params including search_text, order_by, direction, limit, page

    :return: A list of patients
    """
    query = db_session.query(
        PatientOrm.id,
        PatientOrm.name,
        PatientOrm.is_archived,
    )
    include_archived = kwargs.get("include_archived")

    if not include_archived:
        query = query.filter(
            or_(PatientOrm.is_archived == False, PatientOrm.is_archived.is_(None)),
        )

    limit = kwargs.get("limit")
    if limit:
        page = kwargs.get("page", 1)
        return query.slice(*__get_slice_indexes(page, limit))
    return query.all()


# TODO: Why is there not a separate function for getting pregnancy records?
def read_medical_records(m: Type[M], patient_id: str, **kwargs) -> List[M]:
    """
    Queries the database for medical records of a patient

    :param m: Type of model to query for
    :param kwargs: Query params including search_text, direction, limit, page

    :return: A list of models
    """
    query = db_session.query(m).filter_by(patient_id=patient_id)

    # Get kwargs values into variables
    search_text = kwargs.get("search_text")
    direction = kwargs.get("direction", "ASC").upper()
    limit = kwargs.get("limit")
    page = kwargs.get("page", 1)
    is_drug_record = kwargs.get("is_drug_record", False)

    # Ensure that the direction is valid
    if direction not in ["ASC", "DESC"]:
        raise ValueError("Invalid direction, must be 'ASC' or 'DESC'")
    order_by_direction = asc if direction == "ASC" else desc

    if m.schema() == PregnancyOrm.schema():
        if search_text:
            safe_search_text = f"%{search_text}%"
            query = query.filter(m.outcome.like(safe_search_text))

        query = query.order_by(order_by_direction(m.start_date))

    elif m.schema() == MedicalRecordOrm.schema():
        if search_text:
            safe_search_text = f"%{search_text}%"
            query = query.filter(m.information.like(safe_search_text))

        query = query.filter_by(is_drug_record=is_drug_record).order_by(
            order_by_direction(m.date_created),
        )

    if limit:
        start_idx, stop_idx = __get_slice_indexes(page, limit)
        return query.slice(start_idx, stop_idx).all()
    return query.all()


def read_patient_current_medical_record(
    patient_id: str,
    is_drug_record: bool,
) -> MedicalRecordOrm:
    """
    Queries the database for a patient's current medical or drug record.

    :return: A medical or drug record
    """
    query = (
        db_session.query(MedicalRecordOrm)
        .filter_by(patient_id=patient_id, is_drug_record=is_drug_record)
        .order_by(MedicalRecordOrm.date_created.desc())
    )

    return query.first()


def read_patient_timeline(patient_id: str, **kwargs) -> List[Any]:
    """
    Queries the database for a patient's pregnancy, medical and drug records in reverse
    chronological order.

    :param kwargs: Query params including limit, page

    :return: A list of models with the fields: title, date, information
    """

    class Title(NamedTuple):
        pregnancy_start: str
        pregnancy_end: str
        medical_history: str
        drug_history: str

    TITLE = Title(
        pregnancy_start="Started pregnancy",
        pregnancy_end="Ended pregnancy",
        medical_history="Updated medical history",
        drug_history="Updated drug history",
    )

    limit = kwargs.get("limit", 5)
    page = kwargs.get("page", 1)

    pregnancy_end = db_session.query(
        literal(TITLE.pregnancy_end).label("title"),
        PregnancyOrm.end_date.label("date"),
        PregnancyOrm.outcome.label("information"),
    ).filter(PregnancyOrm.patient_id == patient_id, PregnancyOrm.end_date.isnot(None))

    pregnancy_start = db_session.query(
        literal(TITLE.pregnancy_start),
        PregnancyOrm.start_date,
        null(),
    ).filter(PregnancyOrm.patient_id == patient_id)

    medical_history = db_session.query(
        literal(TITLE.medical_history),
        MedicalRecordOrm.date_created,
        MedicalRecordOrm.information,
    ).filter(
        MedicalRecordOrm.patient_id == patient_id,
        MedicalRecordOrm.is_drug_record == False,
    )

    drug_history = db_session.query(
        literal(TITLE.drug_history),
        MedicalRecordOrm.date_created,
        MedicalRecordOrm.information,
    ).filter(
        MedicalRecordOrm.patient_id == patient_id,
        MedicalRecordOrm.is_drug_record == True,
    )

    query = pregnancy_end.union(
        pregnancy_start,
        medical_history,
        drug_history,
    ).order_by(text("date desc"))

    start_idx, stop_idx = __get_slice_indexes(page, limit)
    return query.slice(start_idx, stop_idx).all()


def read_patient_all_records(patient_id: str, **kwargs) -> List[Any]:
    """
    Queries the database for all readings, referrals, assessments, forms associated to a patient
    satisfying criteria specified by the keyword arguments.

    :param kwargs: Query params including readings, referrals, assessments
    :return: A list of models (Union[readings, referrals, assessments]) from the database
             in the descending create time order
    """
    reading_list, referral_list, assessment_list, form_list = [], [], [], []

    reading_required = kwargs.get("readings")
    if reading_required:
        reading_list = (
            db_session.query(ReadingOrm)
            .filter_by(patient_id=patient_id)
            .order_by(ReadingOrm.date_taken.desc())
            .all()
        )

    referral_required = kwargs.get("referrals")
    if referral_required:
        referral_list = (
            db_session.query(ReferralOrm)
            .filter_by(patient_id=patient_id)
            .order_by(ReferralOrm.date_referred.desc())
            .all()
        )

    assessment_required = kwargs.get("assessments")
    if assessment_required:
        assessment_list = (
            db_session.query(AssessmentOrm)
            .filter_by(patient_id=patient_id)
            .order_by(AssessmentOrm.date_assessed.desc())
            .all()
        )

    form_required = kwargs.get("forms")
    if form_required:
        form_list = (
            db_session.query(FormOrm)
            .filter_by(patient_id=patient_id)
            .order_by(FormOrm.date_created.desc())
            .all()
        )

    # four-way merge to get the final list based on most recent timestamps
    reading_pos, referral_pos, assessment_pos, form_pos = 0, 0, 0, 0
    final_list = []

    while any(
        [
            reading_pos < len(reading_list),
            referral_pos < len(referral_list),
            assessment_pos < len(assessment_list),
            form_pos < len(form_list),
        ],
    ):
        # get current timestamps for each list
        cur_reading_t = (
            reading_list[reading_pos].date_taken
            if reading_pos < len(reading_list)
            else -1
        )
        cur_referral_t = (
            referral_list[referral_pos].date_referred
            if referral_pos < len(referral_list)
            else -1
        )
        cur_assessment_t = (
            assessment_list[assessment_pos].date_assessed
            if assessment_pos < len(assessment_list)
            else -1
        )
        cur_form_t = (
            form_list[form_pos].date_created if form_pos < len(form_list) else -1
        )

        # get most recent record across the lists and append to final list
        max_t = max(cur_reading_t, cur_referral_t, cur_assessment_t, cur_form_t)

        if cur_reading_t == max_t:
            final_list.append(reading_list[reading_pos])
            reading_pos += 1
        elif cur_referral_t == max_t:
            final_list.append(referral_list[referral_pos])
            referral_pos += 1
        elif cur_assessment_t == max_t:
            final_list.append(assessment_list[assessment_pos])
            assessment_pos += 1
        elif cur_form_t == max_t:
            final_list.append(form_list[form_pos])
            form_pos += 1

    return final_list


def read_patients(
    patient_id: Optional[str] = None,
    user_id: Optional[int] = None,
    is_cho: bool = False,
    last_edited: Optional[int] = None,
) -> Union[Any, List[Any]]:
    """
    Queries the database for patient(s) each with the latest pregnancy, medical and drug
    records.

    :param patient_id: ID of patient to filter patients; by default this filter is not
    applied
    :param user_id: ID of user to filter patients wrt patient associations; by default
    this filter is not applied
    :param last_edited: Timestamp to filter patients by last-edited time greater than the
    timestamp; by default this filter is not applied

    :return: A patient if patient ID is specified; a list of patients otherwise
    """
    # TODO: Why does this function return either a single object or a list of objects?
    #  This should really be split into two different functions.

    # Aliased classes to be used in join clauses for getting the latest pregnancy, medical
    # and drug records.
    pregnancy = aliased(PregnancyOrm)
    MedicalHistory = aliased(MedicalRecordOrm)
    md = aliased(MedicalRecordOrm)
    DrugHistory = aliased(MedicalRecordOrm)
    dr = aliased(MedicalRecordOrm)

    query = (
        db_session.query(
            PatientOrm.id.label("patient_id"),
            PatientOrm.name,
            PatientOrm.sex,
            PatientOrm.date_of_birth,
            PatientOrm.is_exact_date_of_birth,
            PatientOrm.zone,
            PatientOrm.village_number,
            PatientOrm.household_number,
            PatientOrm.allergy,
            PatientOrm.last_edited,
            PregnancyOrm.id.label("pregnancy_id"),
            PregnancyOrm.start_date.label("pregnancy_start_date"),
            MedicalHistory.id.label("medical_history_id"),
            MedicalHistory.information.label("medical_history"),
            DrugHistory.id.label("drug_history_id"),
            DrugHistory.information.label("drug_history"),
            PatientOrm.is_archived,
        )
        .outerjoin(
            PregnancyOrm,
            and_(
                PatientOrm.id == PregnancyOrm.patient_id,
                PregnancyOrm.end_date.is_(None),
            ),
        )
        .outerjoin(
            pregnancy,
            and_(
                PregnancyOrm.patient_id == pregnancy.patient_id,
                PregnancyOrm.start_date < pregnancy.start_date,
            ),
        )
        .outerjoin(
            MedicalHistory,
            and_(
                PatientOrm.id == MedicalHistory.patient_id,
                MedicalHistory.is_drug_record == False,
            ),
        )
        .outerjoin(
            md,
            and_(
                MedicalHistory.patient_id == md.patient_id,
                MedicalHistory.date_created < md.date_created,
                md.is_drug_record == False,
            ),
        )
        .outerjoin(
            DrugHistory,
            and_(
                PatientOrm.id == DrugHistory.patient_id,
                DrugHistory.is_drug_record == True,
            ),
        )
        .outerjoin(
            dr,
            and_(
                DrugHistory.patient_id == dr.patient_id,
                DrugHistory.date_created < dr.date_created,
                dr.is_drug_record == True,
            ),
        )
        .filter(
            pregnancy.start_date.is_(None),
            md.date_created.is_(None),
            dr.date_created.is_(None),
        )
    )

    query = __filter_by_patient_association(query, PatientOrm, user_id, is_cho)

    if last_edited:
        # Aliased class for getting patients with recently closed pregnancy and no new pregnancy
        pr2 = aliased(PregnancyOrm)
        query = query.outerjoin(
            pr2,
            and_(
                PatientOrm.id == pr2.patient_id,
                pr2.end_date.isnot(None),
                pr2.last_edited > last_edited,
            ),
        ).filter(
            or_(
                PatientOrm.last_edited > last_edited,
                PregnancyOrm.last_edited > last_edited,
                MedicalHistory.last_edited > last_edited,
                DrugHistory.last_edited > last_edited,
                pr2.id.isnot(None),
            ),
        )

    if patient_id:
        return query.filter(PatientOrm.id == patient_id).first()
    return query.distinct().all()


def read_readings(
    patient_id: Optional[str] = None,
    user_id: Optional[int] = None,
    is_cho: bool = False,
    last_edited: Optional[int] = None,
) -> List[Tuple[ReadingOrm, UrineTestOrm]]:
    """
    Queries the database for readings each with corresponding referral, assessment, and
    urine test.

    :param patient_id: ID of patient to filter readings; by default this filter is not
    applied
    :param user_id: ID of user to filter patients wrt patient associations; by default
    this filter is not applied
    :param last_edited: Timestamp to filter readings by last-edited time greater than the
    timestamp; by default this filter is not applied

    :return: A list of tuples of reading, referral, assessment, urine test
    """
    query = db_session.query(ReadingOrm, UrineTestOrm).outerjoin(
        UrineTestOrm,
        ReadingOrm.urine_tests,
    )

    query = __filter_by_patient_association(query, ReadingOrm, user_id, is_cho)

    if last_edited:
        query = query.filter(ReadingOrm.last_edited > last_edited)

    if patient_id:
        query = query.filter(ReadingOrm.patient_id == patient_id)

    return query.all()
