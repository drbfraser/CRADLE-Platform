import logging
import operator
import re
from typing import Any, List, NamedTuple, Optional, Tuple, Type, TypeVar, Union

from sqlalchemy import func, or_
from sqlalchemy.orm import Query, aliased
from sqlalchemy.sql.expression import and_, asc, desc, literal, null, text

from data import db_session
from enums import RoleEnum, TrafficLightEnum
from models import (
    FollowUp,
    Form,
    FormTemplate,
    MedicalRecord,
    Patient,
    PatientAssociations,
    Pregnancy,
    Question,
    Reading,
    Referral,
    UrineTest,
    User,
    UserPhoneNumber,
    supervises,
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
    if isinstance(model, Reading):
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
                   query (e.g., ``patientId="abc"``)
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
                   query (e.g., ``patientId="abc"``)
    :except sqlalchemy.orm.exc.MultipleResultsFound: If multiple models are found
    :return: The updated model
    """
    model = read(m, **kwargs)

    for k, v in changes.items():
        setattr(model, k, v)

    # Ensures that any reading that is entered into the DB is correctly formatted
    if isinstance(model, Reading):
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
                   query (e.g., ``patientId="abc"``)
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
                   query (e.g., ``patientId="abc"``)
    """
    db_session.query(m).filter_by(**kwargs).delete()
    db_session.commit()


def find(m: Type[M], *args) -> List[M]:
    """
    Queries for all models which match some given criteria.

    Criteria are provided as a series of comparison expressions performed on the static
    attributes of the model class. For example::

        crud.find(Reading, Reading.dateTimeTaken >= 1595131500)

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
                   query (e.g., ``patientId="abc"``)
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
    rd = aliased(Reading)
    query = (
        db_session.query(
            Patient.patientId,
            Patient.patientName,
            Patient.villageNumber,
            Reading.trafficLightStatus,
            Reading.dateTimeTaken,
        )
        .outerjoin(Reading, Patient.readings)
        .outerjoin(
            rd,
            and_(
                Patient.patientId == rd.patientId,
                Reading.dateTimeTaken < rd.dateTimeTaken,
            ),
        )
        .filter(
            rd.dateTimeTaken.is_(None),
            or_(Patient.isArchived == False, Patient.isArchived.is_(None)),
        )
    )

    query = __filter_by_patient_association(query, Patient, user_id, is_cho)
    query = __filter_by_patient_search(query, **kwargs)
    query = __order_by_column(query, [Patient, Reading], **kwargs)

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
        Patient.patientId,
        Patient.patientName,
        Patient.isArchived,
    )
    include_archived = kwargs.get("include_archived")

    if include_archived == "false":
        query = query.filter(
            or_(Patient.isArchived == False, Patient.isArchived.is_(None)),
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
        db_session.query(Reading.readingId)
        .filter(
            Referral.patientId == Reading.patientId,
            Referral.dateReferred >= Reading.dateTimeTaken,
            Referral.dateReferred <= Reading.dateTimeTaken + four_hours_in_sec,
        )
        .order_by(Reading.dateTimeTaken.desc())
        .limit(1)
        .correlate(Referral)
    )
    vital_sign_field = func.coalesce(
        Reading.trafficLightStatus,
        TrafficLightEnum.NONE.value,
    ).label("vitalSign")
    query = (
        db_session.query(
            Referral.id,
            Referral.dateReferred,
            Referral.isAssessed,
            Patient.patientId,
            Patient.patientName,
            Patient.villageNumber,
            vital_sign_field,
        )
        .outerjoin(Referral, and_(Referral.patientId == Patient.patientId))
        .outerjoin(Reading, and_(Reading.readingId == reading_subquery))
        .filter(
            or_(Patient.isArchived == False, Patient.isArchived.is_(None)),
        )
    )

    query = __filter_by_patient_association(query, Patient, user_id, is_cho)
    query = __filter_by_patient_search(query, **kwargs)
    query = __order_by_column(query, [Referral, Patient, Reading], **kwargs)

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
    if health_facilities:
        query = query.filter(Referral.referralHealthFacilityName.in_(health_facilities))

    # Filter by referrers
    if referrers:
        query = query.filter(Referral.userId.in_(referrers))

    # Filter by date range
    if date_range:
        start_date, end_date = date_range.split(":")
        query = query.filter(
            Referral.dateReferred >= start_date,
            Referral.dateReferred <= end_date,
        )

    # Filter by assessment status
    if is_assessed in ["1", "0"]:
        query = query.filter(Referral.isAssessed == (is_assessed == "1"))

    # Filter by pregnancy status
    if is_pregnant in ["1", "0"]:
        eq_op = operator.ne if is_pregnant == "1" else operator.eq
        pr = aliased(Pregnancy)
        query = (
            query.outerjoin(
                Pregnancy,
                and_(
                    Patient.patientId == Pregnancy.patientId,
                    Pregnancy.endDate.is_(None),
                ),
            )
            .outerjoin(
                pr,
                and_(
                    Patient.patientId == pr.patientId,
                    Pregnancy.startDate < pr.startDate,
                ),
            )
            .filter(eq_op(Pregnancy.startDate, None), pr.startDate.is_(None))
        )

    # Filter by vital signs
    if vital_signs:
        query = query.filter(vital_sign_field.in_(vital_signs))

    if limit:
        return query.slice(*__get_slice_indexes(page, limit)).all()
    return query.all()


def read_medical_records(m: Type[M], patient_id: str, **kwargs) -> List[M]:
    """
    Queries the database for medical records of a patient

    :param m: Type of model to query for
    :param kwargs: Query params including search_text, direction, limit, page

    :return: A list of models
    """
    query = db_session.query(m).filter_by(patientId=patient_id)

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

    if m.schema() == Pregnancy.schema():
        if search_text:
            safe_search_text = f"%{search_text}%"
            query = query.filter(m.outcome.like(safe_search_text))

        query = query.order_by(order_by_direction(m.startDate))

    elif m.schema() == MedicalRecord.schema():
        if search_text:
            safe_search_text = f"%{search_text}%"
            query = query.filter(m.information.like(safe_search_text))

        query = query.filter_by(isDrugRecord=is_drug_record).order_by(
            order_by_direction(m.dateCreated),
        )

    if limit:
        start_idx, stop_idx = __get_slice_indexes(page, limit)
        return query.slice(start_idx, stop_idx).all()
    return query.all()


def read_patient_current_medical_record(
    patient_id: str,
    is_drug_record: bool,
) -> MedicalRecord:
    """
    Queries the database for a patient's current medical or drug record.

    :return: A medical or drug record
    """
    query = (
        db_session.query(MedicalRecord)
        .filter_by(patientId=patient_id, isDrugRecord=is_drug_record)
        .order_by(MedicalRecord.dateCreated.desc())
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
        Pregnancy.endDate.label("date"),
        Pregnancy.outcome.label("information"),
    ).filter(Pregnancy.patientId == patient_id, Pregnancy.endDate.isnot(None))

    pregnancy_start = db_session.query(
        literal(TITLE.pregnancy_start),
        Pregnancy.startDate,
        null(),
    ).filter(Pregnancy.patientId == patient_id)

    medical_history = db_session.query(
        literal(TITLE.medical_history),
        MedicalRecord.dateCreated,
        MedicalRecord.information,
    ).filter(MedicalRecord.patientId == patient_id, MedicalRecord.isDrugRecord == False)

    drug_history = db_session.query(
        literal(TITLE.drug_history),
        MedicalRecord.dateCreated,
        MedicalRecord.information,
    ).filter(MedicalRecord.patientId == patient_id, MedicalRecord.isDrugRecord == True)

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
    if reading_required == "1":
        reading_list = (
            db_session.query(Reading)
            .filter_by(patientId=patient_id)
            .order_by(Reading.dateTimeTaken.desc())
            .all()
        )

    referral_required = kwargs.get("referrals")
    if referral_required == "1":
        referral_list = (
            db_session.query(Referral)
            .filter_by(patientId=patient_id)
            .order_by(Referral.dateReferred.desc())
            .all()
        )

    assessment_required = kwargs.get("assessments")
    if assessment_required == "1":
        assessment_list = (
            db_session.query(FollowUp)
            .filter_by(patientId=patient_id)
            .order_by(FollowUp.dateAssessed.desc())
            .all()
        )

    form_required = kwargs.get("forms")
    if form_required == "1":
        form_list = (
            db_session.query(Form)
            .filter_by(patientId=patient_id)
            .order_by(Form.dateCreated.desc())
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
            reading_list[reading_pos].dateTimeTaken
            if reading_pos < len(reading_list)
            else -1
        )
        cur_referral_t = (
            referral_list[referral_pos].dateReferred
            if referral_pos < len(referral_list)
            else -1
        )
        cur_assessment_t = (
            assessment_list[assessment_pos].dateAssessed
            if assessment_pos < len(assessment_list)
            else -1
        )
        cur_form_t = (
            form_list[form_pos].dateCreated if form_pos < len(form_list) else -1
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
    Queries the database for patient(s) each with the latest pregnancy, medical and durg
    records.

    :param patient_id: ID of patient to filter patients; by default this filter is not
    applied
    :param user_id: ID of user to filter patients wrt patient associations; by default
    this filter is not applied
    :param last_edited: Timestamp to filter patients by last-edited time greater than the
    timestamp; by default this filter is not applied

    :return: A patient if patient ID is specified; a list of patients otherwise
    """
    # Aliased classes to be used in join clauses for geting the latest pregnancy, medical
    # and drug records.
    pr = aliased(Pregnancy)
    MedicalHistory = aliased(MedicalRecord)
    md = aliased(MedicalRecord)
    DrugHistory = aliased(MedicalRecord)
    dr = aliased(MedicalRecord)

    query = (
        db_session.query(
            Patient.patientId,
            Patient.patientName,
            Patient.patientSex,
            Patient.dob,
            Patient.isExactDob,
            Patient.zone,
            Patient.villageNumber,
            Patient.householdNumber,
            Patient.allergy,
            Patient.lastEdited,
            Pregnancy.id.label("pregnancyId"),
            Pregnancy.startDate.label("pregnancyStartDate"),
            Pregnancy.defaultTimeUnit.label("gestationalAgeUnit"),
            MedicalHistory.id.label("medicalHistoryId"),
            MedicalHistory.information.label("medicalHistory"),
            DrugHistory.id.label("drugHistoryId"),
            DrugHistory.information.label("drugHistory"),
            Patient.isArchived,
        )
        .outerjoin(
            Pregnancy,
            and_(Patient.patientId == Pregnancy.patientId, Pregnancy.endDate.is_(None)),
        )
        .outerjoin(
            pr,
            and_(
                Pregnancy.patientId == pr.patientId,
                Pregnancy.startDate < pr.startDate,
            ),
        )
        .outerjoin(
            MedicalHistory,
            and_(
                Patient.patientId == MedicalHistory.patientId,
                MedicalHistory.isDrugRecord == False,
            ),
        )
        .outerjoin(
            md,
            and_(
                MedicalHistory.patientId == md.patientId,
                MedicalHistory.dateCreated < md.dateCreated,
                md.isDrugRecord == False,
            ),
        )
        .outerjoin(
            DrugHistory,
            and_(
                Patient.patientId == DrugHistory.patientId,
                DrugHistory.isDrugRecord == True,
            ),
        )
        .outerjoin(
            dr,
            and_(
                DrugHistory.patientId == dr.patientId,
                DrugHistory.dateCreated < dr.dateCreated,
                dr.isDrugRecord == True,
            ),
        )
        .filter(
            pr.startDate.is_(None),
            md.dateCreated.is_(None),
            dr.dateCreated.is_(None),
        )
    )

    query = __filter_by_patient_association(query, Patient, user_id, is_cho)

    if last_edited:
        # Aliased class for getting patients with recently closed pregnancy and no new pregnancy
        pr2 = aliased(Pregnancy)
        query = query.outerjoin(
            pr2,
            and_(
                Patient.patientId == pr2.patientId,
                pr2.endDate.isnot(None),
                pr2.lastEdited > last_edited,
            ),
        ).filter(
            or_(
                Patient.lastEdited > last_edited,
                Pregnancy.lastEdited > last_edited,
                MedicalHistory.lastEdited > last_edited,
                DrugHistory.lastEdited > last_edited,
                pr2.id.isnot(None),
            ),
        )

    if patient_id:
        return query.filter(Patient.patientId == patient_id).first()
    return query.distinct().all()


def read_readings(
    patient_id: Optional[str] = None,
    user_id: Optional[int] = None,
    is_cho: bool = False,
    last_edited: Optional[int] = None,
) -> List[Tuple[Reading, UrineTest]]:
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
    query = db_session.query(Reading, UrineTest).outerjoin(
        UrineTest,
        Reading.urineTests,
    )

    query = __filter_by_patient_association(query, Reading, user_id, is_cho)

    if last_edited:
        query = query.filter(Reading.lastEdited > last_edited)

    if patient_id:
        query = query.filter(Reading.patientId == patient_id)

    return query.all()


def read_referrals_or_assessments(
    model: Union[Referral, FollowUp],
    patient_id: Optional[str] = None,
    user_id: Optional[int] = None,
    is_cho: bool = False,
    last_edited: Optional[int] = None,
) -> Union[List[Referral], List[FollowUp]]:
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
        model.lastEdited if model.schema() == Referral.schema() else model.dateAssessed
    )
    query = db_session.query(model)

    query = __filter_by_patient_association(query, model, user_id, is_cho)

    if last_edited:
        query = query.filter(model_last_edited > last_edited)

    if patient_id:
        query = query.filter(model.patientId == patient_id)

    return query.all()


def read_questions(
    model: Question,
    form_template_id: Optional[int] = None,
) -> List[Question]:
    """
    Queries the database for questions

    :param form_template_id: ID of form templates; by default this filter is not applied

    :return: A list of questions
    """
    query = db_session.query(model)

    if form_template_id:
        query = query.filter(model.formTemplateId == form_template_id)

    return query.all()


def read_form_template_versions(model: FormTemplate, refresh=False) -> List[str]:
    """
    Quries the template for current lang versions

    :param model: formTemplate model (here we assume the template is valid)
    :param refresh: refresh the model in case it is invalid for later use

    :return: A list of lang version texts
    """
    lang_versions = model.questions[0].lang_versions
    if refresh:
        db_session.refresh(model)
    return [v.lang for v in lang_versions]


# ~~~~~~~~~~~~~~~~~~~~~~~ DB Calls ~~~~~~~~~~~~~~~~~~~~~~~~~~ #


def add_vht_to_supervise(cho_id: int, vht_ids: List):
    # find the cho
    cho = User.query.filter_by(id=cho_id).first()

    cho.vhtList = []
    db_session.commit()

    # Allows for removing all vhts from supervisee list
    if vht_ids is None:
        return

    # add vhts to CHO's vhtList
    for vht_id in vht_ids:
        vht = User.query.filter_by(id=vht_id).first()
        cho.vhtList.append(vht)
        db_session.add(cho)

    db_session.commit()


def has_conflicting_pregnancy_record(
    patient_id: str,
    start_date: int,
    end_date: Optional[int] = None,
    pregnancy_id: Optional[int] = None,
) -> bool:
    query = db_session.query(Pregnancy).filter(Pregnancy.patientId == patient_id)

    if pregnancy_id:
        query = query.filter(Pregnancy.id != pregnancy_id)

    if not end_date:
        query = query.filter(
            or_(Pregnancy.endDate >= start_date, Pregnancy.endDate.is_(None)),
        )
    else:
        query = query.filter(
            or_(
                and_(
                    Pregnancy.startDate <= start_date,
                    Pregnancy.endDate >= start_date,
                ),
                and_(Pregnancy.startDate >= start_date, Pregnancy.endDate <= end_date),
                and_(Pregnancy.startDate <= end_date, Pregnancy.endDate >= end_date),
                and_(Pregnancy.startDate <= start_date, Pregnancy.endDate.is_(None)),
                and_(
                    Pregnancy.startDate >= start_date,
                    Pregnancy.startDate <= end_date,
                    Pregnancy.endDate.is_(None),
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
        SELECT COUNT(pat.patientId) as patients
                FROM (
                    SELECT DISTINCT(P.patientId)
                    FROM (SELECT R.patientId FROM reading R
                        JOIN user U ON R.userId = U.id
                        WHERE R.dateTimeTaken BETWEEN :from and :to
                        AND (
                            (userId LIKE :user OR userId is NULL)
                            AND (U.healthFacilityName LIKE :facility or U.healthFacilityName is NULL)
                        )
                    ) as P
                JOIN reading R ON P.patientID = R.patientId
                GROUP BY P.patientId
                HAVING COUNT(R.readingId) > 0) as pat
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
        SELECT COUNT(R.readingId) AS total_readings
        FROM reading R
        JOIN user U ON U.id = R.userId
        WHERE R.dateTimeTaken BETWEEN :from AND :to
        AND (
            (R.userId LIKE :user OR R.userId IS NULL)
            AND (U.healthFacilityName LIKE :facility OR U.healthFacilityName IS NULL)
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
        return None


def get_total_color_readings(facility="%", user="%", filter={}) -> List[M]:
    """
    Queries the database for total number different coloured readings (red up, yellow down, etc)
    filter: filter date range, otherwise uses max range

    :return: Total number of respective coloured readings
    """
    query = """
        SELECT R.trafficLightStatus, COUNT(R.trafficLightStatus) AS total_readings
        FROM reading R
        JOIN user U ON U.id = R.userId
        WHERE R.dateTimeTaken BETWEEN :from AND :to
        AND (
            (R.userId LIKE :user OR R.userId IS NULL)
            AND (U.healthFacilityName LIKE :facility OR U.healthFacilityName IS NULL)
        )
        GROUP BY R.trafficLightStatus
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
        return None


def get_sent_referrals(facility="%", user="%", filter={}) -> List[M]:
    """
    Queries the database for total number of sent referrals

    :return: Total number of sent referrals
    """
    query = """
        SELECT COUNT(R.id) AS total_referrals
        FROM referral R
        JOIN user U ON U.id = R.userId
        WHERE R.dateReferred BETWEEN :from AND :to
        AND (
            (R.userId LIKE :user OR R.userId IS NULL)
            AND (U.healthFacilityName LIKE :facility OR U.healthFacilityName IS NULL)
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
        SELECT COUNT(DISTINCT R.patientId) AS referred_patients
        FROM referral R
        WHERE R.dateReferred BETWEEN :from AND :to
        AND (R.referralHealthFacilityName LIKE :facility OR R.referralHealthFacilityName IS NULL)
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
        return None


def get_days_with_readings(facility="%", user="%", filter={}):
    """
    Queries the database for number of days within specified timeframe
    which have more than one reading

    :return: number of days
    """
    query = """
        SELECT COUNT(DISTINCT FLOOR(R.dateTimeTaken / 86400)) AS days_with_readings
        FROM reading R
        JOIN user U ON U.id = R.userId
        WHERE R.dateTimeTaken BETWEEN :from AND :to
        AND (
            (R.userId LIKE :user OR R.userId IS NULL)
            AND (U.healthFacilityName LIKE :facility OR U.healthFacilityName IS NULL)
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


def get_export_data(user_id, filter):
    """
    Queries the database for statistics data for exporting

    :return: list of data for a VHT
    """
    query = (
        (
            db_session.query(
                Referral.dateReferred,
                Referral.patientId,
                Patient.patientName,
                Patient.patientSex,
                Patient.dob,
                Patient.isPregnant,
                Reading.bpSystolic,
                Reading.bpDiastolic,
                Reading.heartRateBPM,
                Reading.trafficLightStatus,
            )
        )
        .outerjoin(
            Patient,
            and_(Patient.patientId == Reading.patientId),
        )
        .outerjoin(
            Referral,
            and_(Referral.patientId == Patient.patientId),
        )
        .filter(
            Reading.userId == user_id,
            Referral.dateReferred.between(
                filter.get("from", "1900-01-01"),
                filter.get("to", "2100-12-31"),
            ),
        )
        .order_by(Referral.patientId.desc())
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
            db_session.query(supervises.c.vhtId)
            .join(User, User.id == supervises.c.choId)
            .filter(User.id == user_id)
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
            for admin_phone_number in UserPhoneNumber.query.join(UserPhoneNumber.user)
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
            for admin_phone_number in UserPhoneNumber.query.join(UserPhoneNumber.user)
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
        join_column = model.patientId
        query = query.join(
            PatientAssociations,
            join_column == PatientAssociations.patientId,
        )
        if is_cho:
            sub = (
                db_session.query(supervises.c.vhtId)
                .filter(supervises.c.choId == user_id)
                .subquery()
            )
            query = query.filter(PatientAssociations.userId.in_(sub))
        else:
            query = query.filter(PatientAssociations.userId == user_id)

    return query


def __filter_by_patient_search(query: Query, **kwargs) -> Query:
    search_text = kwargs.get("search_text")
    if search_text:
        search_text = f"%{search_text}%"
        query = query.filter(
            or_(
                Patient.patientId.like(search_text),
                Patient.patientName.like(search_text),
                Patient.villageNumber.like(search_text),
            ),
        )
    return query


def __order_by_column(query: Query, models: list, **kwargs) -> Query:
    def __get_column(models):
        for model in models:
            if hasattr(model, order_by):
                return getattr(model, order_by)

    order_by = kwargs.get("order_by")
    if order_by:
        direction = asc if kwargs.get("direction") == "ASC" else desc
        column = __get_column(models)
        query = query.order_by(direction(column))

    return query


def __get_slice_indexes(page: str, limit: str) -> Tuple[int, int]:
    start = (int(page) - 1) * int(limit)
    stop = start + int(limit)
    return start, stop
