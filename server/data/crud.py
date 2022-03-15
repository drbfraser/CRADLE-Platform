from typing import List, Optional, Tuple, Type, TypeVar, Any, Union
from sqlalchemy import func
from collections import namedtuple
from sqlalchemy.orm import Query, aliased
from sqlalchemy.sql.expression import text, asc, desc, null, literal, and_, or_
import operator

from data import db_session
from models import (
    TrafficLightEnum,
    FollowUp,
    Patient,
    Referral,
    UrineTest,
    User,
    PatientAssociations,
    Reading,
    Pregnancy,
    MedicalRecord,
    supervises,
    Question
)
import service.invariant as invariant

M = TypeVar("M")
S = TypeVar("S")


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
    user_id: Optional[int] = None, is_cho: bool = False, **kwargs
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
        .filter(rd.dateTimeTaken == None)
    )

    query = __filter_by_patient_association(query, Patient, user_id, is_cho)
    query = __filter_by_patient_search(query, **kwargs)
    query = __order_by_column(query, [Patient, Reading], **kwargs)

    limit = kwargs.get("limit")
    if limit:
        page = kwargs.get("page", 1)
        return query.slice(*__get_slice_indexes(page, limit))
    else:
        return query.all()


def read_referral_list(
    user_id: Optional[int] = None, is_cho: bool = False, **kwargs
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
    )

    query = __filter_by_patient_association(query, Patient, user_id, is_cho)
    query = __filter_by_patient_search(query, **kwargs)
    query = __order_by_column(query, [Referral, Patient, Reading], **kwargs)

    health_facilities = kwargs.get("health_facilities")
    if health_facilities:
        query = query.filter(Referral.referralHealthFacilityName.in_(health_facilities))

    referrers = kwargs.get("referrers")
    if referrers:
        query = query.filter(Referral.userId.in_(referrers))

    date_range = kwargs.get("date_range")
    if date_range:
        start_date, end_date = date_range.split(":")
        query = query.filter(
            Referral.dateReferred >= start_date,
            Referral.dateReferred <= end_date,
        )

    is_assessed = kwargs.get("is_assessed")
    if is_assessed == "1" or is_assessed == "0":
        is_assessed = is_assessed == "1"
        query = query.filter(Referral.isAssessed == is_assessed)

    is_pregnant = kwargs.get("is_pregnant")
    if is_pregnant == "1" or is_pregnant == "0":
        eq_op = operator.ne if is_pregnant == "1" else operator.eq
        pr = aliased(Pregnancy)
        query = (
            query.outerjoin(
                Pregnancy,
                and_(
                    Patient.patientId == Pregnancy.patientId,
                    Pregnancy.endDate == None,
                ),
            )
            .outerjoin(
                pr,
                and_(
                    Patient.patientId == pr.patientId,
                    Pregnancy.startDate < pr.startDate,
                ),
            )
            .filter(eq_op(Pregnancy.startDate, None), pr.startDate == None)
        )

    vital_signs = kwargs.get("vital_signs")
    if vital_signs:
        query = query.filter(vital_sign_field.in_(vital_signs))

    limit = kwargs.get("limit")
    if limit:
        page = kwargs.get("page", 1)
        return query.slice(*__get_slice_indexes(page, limit))
    else:
        return query.all()


def read_medical_records(m: Type[M], patient_id: str, **kwargs) -> List[M]:
    """
    Queries the database for medical records of a patient

    :param m: Type of model to query for
    :param kwargs: Query params including search_text, direction, limit, page

    :return: A list of models
    """
    query = db_session.query(m).filter_by(patientId=patient_id)

    search_text = kwargs.get("search_text")
    direction = asc if kwargs.get("direction") == "ASC" else desc

    if m.schema() == Pregnancy.schema():
        if search_text:
            query = query.filter(m.outcome.like(f"%{search_text}%"))

        query = query.order_by(direction(m.startDate))

    if m.schema() == MedicalRecord.schema():
        if search_text:
            query = query.filter(m.information.like(f"%{search_text}%"))

        query = query.filter_by(isDrugRecord=kwargs.get("is_drug_record")).order_by(
            direction(m.dateCreated)
        )

    limit = kwargs.get("limit")
    if limit:
        page = kwargs.get("page", 1)
        return query.slice(*__get_slice_indexes(page, limit))
    else:
        return query.all()


def read_patient_current_medical_record(
    patient_id: str, is_drug_record: bool
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
    Title = namedtuple(
        "Title", "pregnancy_start pregnancy_end medical_history drug_history"
    )
    TITLE = Title(
        "Started pregnancy",
        "Ended pregnancy",
        "Updated medical history",
        "Updated drug history",
    )

    limit = kwargs.get("limit", 5)
    page = kwargs.get("page", 1)

    pregnancy_end = db_session.query(
        literal(TITLE.pregnancy_end).label("title"),
        Pregnancy.endDate.label("date"),
        Pregnancy.outcome.label("information"),
    ).filter(Pregnancy.patientId == patient_id, Pregnancy.endDate != None)

    pregnancy_start = db_session.query(
        literal(TITLE.pregnancy_start), Pregnancy.startDate, null()
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
        pregnancy_start, medical_history, drug_history
    ).order_by(text("date desc"))

    return query.slice(*__get_slice_indexes(page, limit))


def read_patient_readings_referrals_assessments(patient_id: str, **kwargs) -> List[Any]:
    """
    Queries the database for all readings, referrals, assessments associated to a patient
    satisfying criteria specified by the keyword arguments.

    :param kwargs: Query params including readings, referrals, assessments
    :return: A list of models (Union[readings, referrals, assessments]) from the database
             in the descending create time order
    """
    reading_list, referral_list, assessment_list = [], [], []

    reading_required = kwargs.get("readings")
    if reading_required == "1":
        query = (
            db_session.query(Reading)
            .filter_by(patientId=patient_id)
            .order_by(Reading.dateTimeTaken.desc())
        )
        reading_list += query.all()

    referral_required = kwargs.get("referrals")
    if referral_required == "1":
        query = (
            db_session.query(Referral)
            .filter_by(patientId=patient_id)
            .order_by(Referral.dateReferred.desc())
        )
        referral_list += query.all()

    assessment_required = kwargs.get("assessments")
    if assessment_required == "1":
        query = (
            db_session.query(FollowUp)
            .filter_by(patientId=patient_id)
            .order_by(FollowUp.dateAssessed.desc())
        )
        assessment_list += query.all()

    # three-way merge to get the final list
    reading_pos, referral_pos, assessment_pos = 0, 0, 0
    final_list = []
    while 1:
        reading_cond = reading_pos < len(reading_list)
        referral_cond = referral_pos < len(referral_list)
        assessment_cond = assessment_pos < len(assessment_list)
        if not (reading_cond or referral_cond or assessment_cond):
            break
        cur_reading_t = reading_list[reading_pos].dateTimeTaken if reading_cond else -1
        cur_referral_t = (
            referral_list[referral_pos].dateReferred if referral_cond else -1
        )
        cur_assessment_t = (
            assessment_list[assessment_pos].dateAssessed if assessment_cond else -1
        )
        max_t = max(cur_reading_t, cur_referral_t, cur_assessment_t)
        if cur_reading_t == max_t:
            final_list.append(reading_list[reading_pos])
            reading_pos += 1
        elif cur_referral_t == max_t:
            final_list.append(referral_list[referral_pos])
            referral_pos += 1
        elif cur_assessment_t == max_t:
            final_list.append(assessment_list[assessment_pos])
            assessment_pos += 1

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
        )
        .outerjoin(
            Pregnancy,
            and_(Patient.patientId == Pregnancy.patientId, Pregnancy.endDate == None),
        )
        .outerjoin(
            pr,
            and_(
                Pregnancy.patientId == pr.patientId, Pregnancy.startDate < pr.startDate
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
        .filter(pr.startDate == None, md.dateCreated == None, dr.dateCreated == None)
    )

    query = __filter_by_patient_association(query, Patient, user_id, is_cho)

    if last_edited:
        # Aliased class for getting patients with recently closed pregnancy and no new pregnancy
        pr2 = aliased(Pregnancy)
        query = query.outerjoin(
            pr2,
            and_(
                Patient.patientId == pr2.patientId,
                pr2.endDate != None,
                pr2.lastEdited > last_edited,
            ),
        ).filter(
            or_(
                Patient.lastEdited > last_edited,
                Pregnancy.lastEdited > last_edited,
                MedicalHistory.lastEdited > last_edited,
                DrugHistory.lastEdited > last_edited,
                pr2.id != None,
            )
        )

    if patient_id:
        return query.filter(Patient.patientId == patient_id).first()
    else:
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
        UrineTest, Reading.urineTests
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
    form_template_id: Optional[int] = None
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
            or_(Pregnancy.endDate >= start_date, Pregnancy.endDate == None),
        )
    else:
        query = query.filter(
            or_(
                and_(
                    Pregnancy.startDate <= start_date, Pregnancy.endDate >= start_date
                ),
                and_(Pregnancy.startDate >= start_date, Pregnancy.endDate <= end_date),
                and_(Pregnancy.startDate <= end_date, Pregnancy.endDate >= end_date),
                and_(Pregnancy.startDate <= start_date, Pregnancy.endDate == None),
                and_(
                    Pregnancy.startDate >= start_date,
                    Pregnancy.startDate <= end_date,
                    Pregnancy.endDate == None,
                ),
            ),
        )

    return db_session.query(query.exists()).scalar()


# ~~~~~~~~~~~~~~~~~~~~~~~ Stats DB Calls ~~~~~~~~~~~~~~~~~~~~~~~~~~ #


def get_unique_patients_with_readings(facility="%", user="%", filter={}) -> List[M]:
    """Queries the database for unique patients with more than one reading

    :return: A number of unique patients"""

    query = """ SELECT COUNT(pat.patientId) as patients
                FROM (
                    SELECT DISTINCT(P.patientId)
                    FROM (SELECT R.patientId FROM reading R 
                        JOIN user U ON R.userId = U.id
                        WHERE R.dateTimeTaken BETWEEN %s and %s
                        AND (
                            (userId LIKE "%s" OR userId is NULL) 
                            AND (U.healthFacilityName LIKE "%s" or U.healthFacilityName is NULL)
                        )
                    ) as P 
                JOIN reading R ON P.patientID = R.patientId
                GROUP BY P.patientId
                HAVING COUNT(R.readingId) > 0) as pat
    """ % (
        filter.get("from"),
        filter.get("to"),
        str(user),
        str(facility),
    )

    try:
        result = db_session.execute(query)
        return list(result)
    except Exception as e:
        print(e)
        return None


def get_total_readings_completed(facility="%", user="%", filter={}) -> List[M]:
    """Queries the database for total number of readings completed

    filter: filter date range, otherwise uses max range

    :return: Number of total readings"""

    query = """
        SELECT COUNT(R.readingId)
        FROM reading R
        JOIN user U on U.id = R.userId
        WHERE R.dateTimeTaken BETWEEN %s AND %s
        AND (
            (R.userId LIKE "%s" OR R.userId is NULL) 
            AND (U.healthFacilityName LIKE "%s" OR U.healthFacilityName is NULL)
        )
    """ % (
        filter.get("from"),
        filter.get("to"),
        str(user),
        str(facility),
    )

    try:
        result = db_session.execute(query)
        return list(result)
    except Exception as e:
        print(e)
        return None


def get_total_color_readings(facility="%", user="%", filter={}) -> List[M]:
    """Queries the database for total number different coloured readings (red up, yellow down, etc)
    filter: filter date range, otherwise uses max range

    :return: Total number of respective coloured readings"""

    query = """
        SELECT R.trafficLightStatus, COUNT(R.trafficLightStatus) 
        FROM reading R
        JOIN user U on U.id = R.userId
        WHERE R.dateTimeTaken BETWEEN %s AND %s
        AND (
            (R.userId LIKE "%s" OR R.userId is NULL) 
            AND (U.healthFacilityName LIKE "%s" OR U.healthFacilityName is NULL)
        )
        GROUP BY R.trafficLightStatus
    """ % (
        filter.get("from"),
        filter.get("to"),
        str(user),
        str(facility),
    )

    try:
        result = db_session.execute(query)
        return list(result)
    except Exception as e:
        print(e)
        return None


def get_sent_referrals(facility="%", user="%", filter={}) -> List[M]:
    """Queries the database for total number of sent referrals

    :return: Total number of sent referrals"""

    query = """
        SELECT COUNT(R.id) FROM referral R
        JOIN user U ON U.id = R.userId
        WHERE R.dateReferred BETWEEN %s and %s
        AND (
            (R.userId LIKE "%s" OR R.userId IS NULL)
            AND (U.healthFacilityName LIKE "%s" OR U.healthFacilityName IS NULL)
        )
    """ % (
        filter.get("from"),
        filter.get("to"),
        str(user),
        str(facility),
    )

    try:
        result = db_session.execute(query)
        return list(result)
    except Exception as e:
        print(e)
        return None


def get_referred_patients(facility="%", filter={}) -> List[M]:
    """Queries the database for total number of patients that have referrals to specified facility

    :return: Total number of referred patients"""

    query = """
        SELECT COUNT(DISTINCT(R.patientId))
        FROM referral R
        WHERE R.dateReferred BETWEEN %s AND %s
        AND (R.referralHealthFacilityName LIKE "%s" OR R.referralHealthFacilityName IS NULL) 
        """ % (
        filter.get("from"),
        filter.get("to"),
        str(facility),
    )

    try:
        result = db_session.execute(query)
        return list(result)
    except Exception as e:
        print(e)
        return None


def get_days_with_readings(facility="%", user="%", filter={}):
    """Queries the database for number of days within specified timeframe
        which have more than one reading

    :return: number of days"""

    query = """
        SELECT COUNT(DISTINCT(FLOOR(R.dateTimeTaken / 86400)))
        FROM reading R
        JOIN user U ON U.id = R.userId
        WHERE dateTimeTaken BETWEEN %s AND %s
        AND (
         	(R.userId LIKE "%s" OR R.userId IS NULL)
			AND (U.healthFacilityName LIKE "%s" OR U.healthFacilityName is NULL)   
        )
        """ % (
        filter.get("from"),
        filter.get("to"),
        str(user),
        str(facility),
    )

    try:
        result = db_session.execute(query)
        return list(result)
    except Exception as e:
        print(e)
        return None


def get_export_data(user_id, filter):
    """Queries the database for statistics data for exporting

    :return: list of data for a VHT"""
    query = """
        SELECT R.dateReferred,R.patientId, P.patientName, P.patientSex, P.dob, P.isPregnant, RD.bpSystolic, RD.bpDiastolic, RD.heartRateBPM, RD.trafficLightStatus 
        FROM referral R
        JOIN reading RD on R.readingId = RD.readingId
        JOIN patient P on P.patientId = R.patientId
        WHERE R.userId = %s AND R.dateReferred BETWEEN %s AND %s
        ORDER BY R.patientId  DESC
    """ % (
        str(user_id),
        filter.get("from"),
        filter.get("to"),
    )

    try:
        resultproxy = db_session.execute(query)
        row = {}
        result = []
        # Transform ResultProxy into a dict of items
        for rowproxy in resultproxy:
            for col, val in rowproxy.items():
                row = {**row, **{col: val}}
            result.append(row)
        return result
    except Exception as e:
        print(e)
        return None


def get_supervised_vhts(user_id):
    """Queries db for the list of VHTs supervised by this CHO"""
    query = """
        SELECT vhtId 
        FROM user U
        JOIN supervises S on U.id = S.choId
        WHERE U.id = %s
    """ % str(
        user_id
    )

    try:
        result = db_session.execute(query)
        return list(result)
    except Exception as e:
        print(e)
        return None


# ~~~~~~~~~~~~~~~~~~~~~~~ Helper Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~ #


def __filter_by_patient_association(
    query: Query, model: Any, user_id: Optional[int], is_cho
) -> Query:
    if user_id is not None:
        join_column = model.patientId
        query = query.join(
            PatientAssociations, join_column == PatientAssociations.patientId
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
        query = query.filter(
            or_(
                Patient.patientId.like(f"%{search_text}%"),
                Patient.patientName.like(f"%{search_text}%"),
            )
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
