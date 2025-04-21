import logging
import operator
import re
from typing import Any, List, NamedTuple, Optional, Tuple, Type, TypeVar, Union

from sqlalchemy import or_, cast, Integer
from sqlalchemy.orm import Query, aliased
from sqlalchemy.sql.expression import and_, asc, desc, literal, null, text
from sqlalchemy.sql.functions import coalesce

from common.form_utils import filter_template_questions_orm
from data import db_session
from enums import RoleEnum, TrafficLightEnum
from models import (
    AssessmentOrm,
    FormOrm,
    FormTemplateOrm,
    MedicalRecordOrm,
    PatientAssociationsOrm,
    PatientOrm,
    PregnancyOrm,
    QuestionOrm,
    ReadingOrm,
    ReferralOrm,
    SupervisesTable,
    UrineTestOrm,
    UserOrm,
    UserPhoneNumberOrm,
)
from service import invariant

M = TypeVar("M")
S = TypeVar("S")

LOGGER = logging.getLogger(__name__)


def create(model: M, refresh=False):
    """
    Inserts a new model into the database.

    All the actual SQL is handled under the hood by SQLAlchemy. However, it's important
    to note that many tables may be modified by this operation: for example, in the case
    of a model which contains relationships to other models.

    Any exceptions thrown by database system are propagated back through this function.

    :param model: The model to insert
    :param refresh: If true, immediately refresh ``model`` populating it with data from
                    the database; this involves an additional query so only use it if
                    necessary
    """
    # Ensures that any reading that is entered into the DB is correctly formatted
    if isinstance(model, ReadingOrm):
        invariant.resolve_reading_invariants(model)

    db_session.add(model)
    db_session.commit()
    if refresh:
        db_session.refresh(model)


def create_model(new_data: dict, schema: S) -> Any:
    """
    Constructs a model from a dictionary associating column names to values, inserts
    said model into the database, and then returns the model.

    This method differs from ``create`` in that it returns the actual model instance,
    as well as it takes in a dict rather than a model.
    This allows callers to take advantage of the various
    relations provided by the ORM instead of having to query those object manually.

    :param new_data: A dictionary mapping column names to values
    :return: A model instance
    """
    new_model = schema().load(new_data, session=db_session)
    create(new_model)
    return new_model


def create_all(models: List[M], autocommit: bool = True):
    """
    add_all list of model into the database.

    All the actual SQL is handled under the hood by SQLAlchemy. However, it's important
    to note that many tables may be modified by this operation: for example, in the case
    of a model which contains relationships to other models.

    Any exceptions thrown by database system are propagated back through this function.

    :param models: The models to insert
    :param autocommit: If true, the current transaction is committed before return; the
    default is true
    """
    db_session.add_all(models)
    if autocommit:
        db_session.commit()


def read(m: Type[M], **kwargs) -> Optional[M]:
    """
    Queries the database for a single object which matches some query parameters defined
    as keyword arguments. If no such object is found which matches the criteria, then
    ``None`` is returned. If many objects match the criteria, an exception is thrown.

    :param m: Type of the model to query for
    :param kwargs: Keyword arguments mapping column names to values to parameterize the
                   query (e.g., ``patient_id="abc"``)
    :except sqlalchemy.orm.exc.MultipleResultsFound: If multiple models are found
    :return: A model from the database or ``None`` if no model was found
    """
    return m.query.filter_by(**kwargs).one_or_none()


def update(m: Type[M], changes: dict, autocommit: bool = True, **kwargs):
    """
    Applies a series of changes to a model in the database.

    The process for updating a model is as follows:

    * Retrieve the model by querying the database using the supplied ``kwargs`` as
      query parameters
    * Iterate through ``changes`` and update the fields of the model
    * Commit the changes to the database
    * Return the model

    :param m: Type of model to update
    :param changes: A dictionary mapping columns to new values
    :param autocommit: If true, the current transaction is committed before return; the
    default is true
    :param kwargs: Keyword arguments mapping column names to values to parameterize the
                   query (e.g., ``patient_id="abc"``)
    :except sqlalchemy.orm.exc.MultipleResultsFound: If multiple models are found
    :return: The updated model
    """
    model = read(m, **kwargs)

    for k, v in changes.items():
        setattr(model, k, v)

    # Ensures that any reading that is entered into the DB is correctly formatted
    if isinstance(model, ReadingOrm):
        invariant.resolve_reading_invariants(model)

    if autocommit:
        db_session.commit()


def delete(model: M):
    """
    Deletes a model from the database.

    :param model: The model to delete
    """
    db_session.delete(model)
    db_session.commit()


def delete_by(m: Type[M], **kwargs):
    """
    Queries for a model using some given keyword arguments and, if one is found,
    deletes it.

    If no model is found, this function does nothing. If more than one model is found,
    then an exception is thrown.

    :param m: Type of the model to delete
    :param kwargs: Keyword arguments mapping column names to values to parameterize the
                   query (e.g., ``patient_id="abc"``)
    :except sqlalchemy.orm.exc.MultipleResultsFound: If multiple models are found
    """
    model = read(m, **kwargs)
    if model:
        delete(model)


def delete_all(m: Type[M], **kwargs):
    """
    Deletes all models satisfying criteria specified by the keyword arguments.

    :param m: Type of the models to delete
    :param kwargs: Keyword arguments mapping column names to values to parameterize the
                   query (e.g., ``patient_id="abc"``)
    """
    db_session.query(m).filter_by(**kwargs).delete()
    db_session.commit()


def find(m: Type[M], *args) -> List[M]:
    """
    Queries for all models which match some given criteria.

    Criteria are provided as a series of comparison expressions performed on the static
    attributes of the model class. For example::

        crud.find(Reading, Reading.date_taken >= 1595131500)

    See the SQLAlchemy documentation for more info:
    https://docs.sqlalchemy.org/en/13/orm/query.html#sqlalchemy.orm.query.Query.filter

    :param m: Type of model to find
    :param args: Query arguments forwarded to ``filter``
    :return: A list of models which satisfy the criteria
    """
    return m.query.filter(*args).all()


def read_all(m: Type[M], **kwargs) -> List[M]:
    """
    Queries the database for all models satisfying criteria specified by the keyword arguments.

    :param m: Type of the model to query for
    :param kwargs: Keyword arguments mapping column names to values to parameterize the
                   query (e.g., ``patient_id="abc"``)
    :return: A list of models from the database
    """
    if not kwargs:
        return m.query.all()
    return m.query.filter_by(**kwargs).all()


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
    if date_range is not None:
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


def read_questions(
    model: QuestionOrm,
    form_template_id: Optional[int] = None,
) -> List[QuestionOrm]:
    """
    Queries the database for questions

    :param form_template_id: ID of form templates; by default this filter is not applied

    :return: A list of questions
    """
    query = db_session.query(model)

    if form_template_id:
        query = query.filter(model.form_template_id == form_template_id)

    return query.all()


def read_form_template_language_versions(
    model: FormTemplateOrm, refresh=False
) -> List[str]:
    """
    Queries the template for current language versions

    :param model: formTemplate model (here we assume the template is valid)
    :param refresh: refresh the model in case it is invalid for later use

    :return: A list of lang version texts
    """
    model = filter_template_questions_orm(model)
    lang_versions = model.questions[0].lang_versions
    if refresh:
        db_session.refresh(model)
    return [v.lang for v in lang_versions]


# ~~~~~~~~~~~~~~~~~~~~~~~ DB Calls ~~~~~~~~~~~~~~~~~~~~~~~~~~ #


def add_vht_to_supervise(cho_id: int, vht_ids: List):
    # find the cho
    cho = UserOrm.query.filter_by(id=cho_id).first()

    cho.vht_list = []
    db_session.commit()

    # Allows for removing all vhts from supervisee list
    if vht_ids is None:
        return

    # add vhts to CHO's vhtList
    for vht_id in vht_ids:
        vht = UserOrm.query.filter_by(id=vht_id).first()
        cho.vht_list.append(vht)
        db_session.add(cho)

    db_session.commit()


def has_conflicting_pregnancy_record(
    patient_id: str,
    start_date: int,
    end_date: Optional[int] = None,
    pregnancy_id: Optional[int] = None,
) -> bool:
    query = db_session.query(PregnancyOrm).filter(PregnancyOrm.patient_id == patient_id)

    if pregnancy_id:
        query = query.filter(PregnancyOrm.id != pregnancy_id)

    if not end_date:
        query = query.filter(
            or_(PregnancyOrm.end_date >= start_date, PregnancyOrm.end_date.is_(None)),
        )
    else:
        query = query.filter(
            or_(
                and_(
                    PregnancyOrm.start_date <= start_date,
                    PregnancyOrm.end_date >= start_date,
                ),
                and_(
                    PregnancyOrm.start_date >= start_date,
                    PregnancyOrm.end_date <= end_date,
                ),
                and_(
                    PregnancyOrm.start_date <= end_date,
                    PregnancyOrm.end_date >= end_date,
                ),
                and_(
                    PregnancyOrm.start_date <= start_date,
                    PregnancyOrm.end_date.is_(None),
                ),
                and_(
                    PregnancyOrm.start_date >= start_date,
                    PregnancyOrm.start_date <= end_date,
                    PregnancyOrm.end_date.is_(None),
                ),
            ),
        )

    return db_session.query(query.exists()).scalar()


# ~~~~~~~~~~~~~~~~~~~~~~~ Stats DB Calls ~~~~~~~~~~~~~~~~~~~~~~~~~~ #


def get_unique_patients_with_readings(facility="%", user="%", filter={}) -> List[M]:
    """
    Queries the database for unique patients with more than one reading

    :return: A number of unique patients
    """
    query = """
        SELECT COUNT(pat.patient_id) as patients
                FROM (
                    SELECT DISTINCT(P.patient_id)
                    FROM (SELECT R.patient_id FROM reading R
                        JOIN user U ON R.user_id = U.id
                        WHERE R.date_taken BETWEEN :from and :to
                        AND (
                            (user_id LIKE :user OR user_id is NULL)
                            AND (U.health_facility_name LIKE :facility or U.health_facility_name is NULL)
                        )
                    ) as P
                JOIN reading R ON P.patient_id = R.patient_id
                GROUP BY P.patient_id
                HAVING COUNT(R.id) > 0) as pat
    """

    # params used to prevent direct string interpolation inside query
    params = {
        "from": filter.get(
            "from",
            "1900-01-01",
        ),  # default date if 'from' is not provided
        "to": filter.get("to", "2100-12-31"),  # default date if 'to' is not provided
        "user": str(user),
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        LOGGER.error(e)
        return None


def get_total_readings_completed(facility="%", user="%", filter={}) -> List[M]:
    """
    Queries the database for total number of readings completed

    filter: filter date range, otherwise uses max range

    :return: Number of total readings
    """
    query = """
        SELECT COUNT(R.id) AS total_readings
        FROM reading R
        JOIN user U ON U.id = R.user_id
        WHERE R.date_taken BETWEEN :from AND :to
        AND (
            (R.user_id LIKE :user OR R.user_id IS NULL)
            AND (U.health_facility_name LIKE :facility OR U.health_facility_name IS NULL)
        )
    """

    # params used to prevent direct string interpolation inside query
    params = {
        "from": filter.get("from", "1900-01-01"),
        "to": filter.get("to", "2100-12-31"),
        "user": str(user),
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        LOGGER.error(e)
        print(e)
        return None


def get_total_color_readings(facility="%", user="%", filter={}) -> List[M]:
    """
    Queries the database for total number different coloured readings (red up, yellow down, etc)
    filter: filter date range, otherwise uses max range

    :return: Total number of respective coloured readings
    """
    query = """
        SELECT R.traffic_light_status, COUNT(R.traffic_light_status) AS total_readings
        FROM reading R
        JOIN user U ON U.id = R.user_id
        WHERE R.date_taken BETWEEN :from AND :to
        AND (
            (R.user_id LIKE :user OR R.user_id IS NULL)
            AND (U.health_facility_name LIKE :facility OR U.health_facility_name IS NULL)
        )
        GROUP BY R.traffic_light_status
    """

    # params used to prevent direct string interpolation inside query
    params = {
        "from": filter.get("from", "1900-01-01"),
        "to": filter.get("to", "2100-12-31"),
        "user": str(user),
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        LOGGER.error(e)
        print(e)
        return None


def get_sent_referrals(facility="%", user="%", filter={}) -> List[M]:
    """
    Queries the database for total number of sent referrals

    :return: Total number of sent referrals
    """
    query = """
        SELECT COUNT(R.id) AS total_referrals
        FROM referral R
        JOIN user U ON U.id = R.user_id
        WHERE R.date_referred BETWEEN :from AND :to
        AND (
            (R.user_id LIKE :user OR R.user_id IS NULL)
            AND (U.health_facility_name LIKE :facility OR U.health_facility_name IS NULL)
        )
    """

    params = {
        "from": filter.get("from", "1900-01-01"),
        "to": filter.get("to", "2100-12-31"),
        "user": str(user),
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        LOGGER.error(e)
        return None


def get_referred_patients(facility="%", filter={}) -> List[M]:
    """
    Queries the database for total number of patients that have referrals to specified facility

    :return: Total number of referred patients
    """
    query = """
        SELECT COUNT(DISTINCT R.patient_id) AS referred_patients
        FROM referral R
        WHERE R.date_referred BETWEEN :from AND :to
        AND (R.health_facility_name LIKE :facility OR R.health_facility_name IS NULL)
    """

    params = {
        "from": filter.get("from", "1900-01-01"),  # Default start date if not provided
        "to": filter.get("to", "2100-12-31"),  # Default end date if not provided
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        LOGGER.error(e)
        print(e)
        return None


def get_days_with_readings(facility="%", user="%", filter={}):
    """
    Queries the database for number of days within specified timeframe
    which have more than one reading

    :return: number of days
    """
    query = """
        SELECT COUNT(DISTINCT FLOOR(R.date_taken / 86400)) AS days_with_readings
        FROM reading R
        JOIN user U ON U.id = R.user_id
        WHERE R.date_taken BETWEEN :from AND :to
        AND (
            (R.user_id LIKE :user OR R.user_id IS NULL)
            AND (U.health_facility_name LIKE :facility OR U.health_facility_name IS NULL)
        )
    """

    params = {
        "from": filter.get("from", "1900-01-01"),
        "to": filter.get("to", "2100-12-31"),
        "user": str(user),
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        print(e)
        LOGGER.error(e)
        return None


def get_export_data(user_id, filter):
    """
    Queries the database for statistics data for exporting

    :return: list of data for a VHT
    """
    query = (
        (
            db_session.query(
                ReferralOrm.date_referred,
                ReferralOrm.patient_id,
                PatientOrm.name,
                PatientOrm.sex,
                PatientOrm.date_of_birth,
                PatientOrm.is_pregnant,
                ReadingOrm.systolic_blood_pressure,
                ReadingOrm.diastolic_blood_pressure,
                ReadingOrm.heart_rate,
                ReadingOrm.traffic_light_status,
            )
        )
        .outerjoin(
            PatientOrm,
            and_(PatientOrm.id == ReadingOrm.patient_id),
        )
        .outerjoin(
            ReferralOrm,
            and_(ReferralOrm.patient_id == PatientOrm.id),
        )
        .filter(
            ReadingOrm.user_id == user_id,
            ReferralOrm.date_referred.between(
                filter.get("from", "1900-01-01"),
                filter.get("to", "2100-12-31"),
            ),
        )
        .order_by(ReferralOrm.patient_id.desc())
    )

    try:
        resultproxy = query.all()
        result = []
        # Transform ResultProxy into a dict of items
        for rowproxy in resultproxy:
            row = dict(zip(rowproxy.keys(), rowproxy))
            result.append(row)
        return result
    except Exception as e:
        LOGGER.error(e)
        return None


def get_supervised_vhts(user_id):
    """Queries db for the list of VHTs supervised by this CHO"""
    try:
        query = (
            db_session.query(SupervisesTable.c.vht_id)
            .join(UserOrm, UserOrm.id == SupervisesTable.c.cho_id)
            .filter(UserOrm.id == user_id)
        )

        result = query.all()
        return [row[0] for row in result]  # Extract VHT IDs from tuples
    except Exception as e:
        LOGGER.error(e)
        return None


def is_phone_number_relay(phone_number):
    # iterate through all admin phone numbers and remove dashes before comparision
    try:
        admin_phone_numbers = [
            re.sub(r"[-]", "", admin_phone_number.number)
            for admin_phone_number in UserPhoneNumberOrm.query.join(
                UserPhoneNumberOrm.user
            )
            .filter_by(role=RoleEnum.ADMIN.value)
            .all()
        ]

        if phone_number in admin_phone_numbers:
            return 1
        return 0
    except Exception as e:
        LOGGER.error(e)
        return -1


def get_all_relay_phone_numbers():
    try:
        admin_phone_numbers = [
            re.sub(r"[-]", "", admin_phone_number.number)
            for admin_phone_number in UserPhoneNumberOrm.query.join(
                UserPhoneNumberOrm.user
            )
            .filter_by(role=RoleEnum.ADMIN.value)
            .all()
        ]
        return admin_phone_numbers
    except Exception as e:
        LOGGER.error(e)
        return None


# ~~~~~~~~~~~~~~~~~~~~~~~ Helper Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~ #


def __filter_by_patient_association(
    query: Query,
    model: Any,
    user_id: Optional[int],
    is_cho,
) -> Query:
    if user_id is not None:
        if hasattr(model, model.patient_id):
            join_column = model.patient_id
        else:
            join_column = model.id
        query = query.join(
            PatientAssociationsOrm,
            join_column == PatientAssociationsOrm.patient_id,
        )
        if is_cho:
            sub = (
                db_session.query(SupervisesTable.c.vht_id)
                .filter(SupervisesTable.c.cho_id == user_id)
                .subquery()
            )
            query = query.filter(PatientAssociationsOrm.user_id.in_(sub))
        else:
            query = query.filter(PatientAssociationsOrm.user_id == user_id)

    return query


def __filter_by_patient_search(query: Query, **kwargs) -> Query:
    search_text = kwargs.get("search")
    if search_text:
        search_text = f"%{search_text}%"
        query = query.filter(
            or_(
                PatientOrm.id.like(search_text),
                PatientOrm.name.like(search_text),
                PatientOrm.village_number.like(search_text),
            ),
        )
    return query


def __order_by_column(query: Query, models: list, **kwargs) -> Query:
    order_by = kwargs.get("order_by")

    def __get_column(models):
        for model in models:
            if hasattr(model, order_by):
                return getattr(model, order_by)

    if order_by:
        direction = asc if kwargs.get("direction") == "ASC" else desc

        if order_by in ["patient_id", "village_number"]:
            model_column = __get_column(models)
            column = cast(model_column, Integer)
        else:
            column = __get_column(models)

        query = query.order_by(direction(column))

    return query



def __get_slice_indexes(page: str, limit: str) -> Tuple[int, int]:
    start = (int(page) - 1) * int(limit)
    stop = start + int(limit)
    return start, stop
