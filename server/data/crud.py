from typing import List, Optional, Type, TypeVar, Any
from collections import namedtuple
from sqlalchemy.orm import aliased
from sqlalchemy.sql.expression import text, asc, desc, null, literal, and_, or_
import operator

from data import db_session
from models import (
    Patient,
    Referral,
    User,
    PatientAssociations,
    Reading,
    Pregnancy,
    MedicalRecord,
)
import service.serialize as serialize
import service.sqlStrings as SQL
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


def create_all_patients(model: List[Patient]):
    """
    add_all list of model into the database.

    All the actual SQL is handled under the hood by SQLAlchemy. However, it's important
    to note that many tables may be modified by this operation: for example, in the case
    of a model which contains relationships to other models.

    Any exceptions thrown by database system are propagated back through this function.

    :param model: The model to insert
    :param refresh: If true, immediately refresh ``model`` populating it with data from
                    the database; this involves an additional query so only use it if
                    necessary
    """
    db_session.add_all(model)
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


def update(m: Type[M], changes: dict, **kwargs):
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
    Queries the database for all Patients and Reaedings

    :param m: Type of the model to query for
    :param kwargs: Keyword arguments mapping column names to values to parameterize the
                   query (e.g., ``patientId="abc"``)
    :return: A list of models from the database
    """
    # relates to api/android/patients
    if m.schema() == Patient.schema():
        if not kwargs:
            # get all the patients
            patient_list = read_all_patients_db()
            # get all reading + referral + followup
            reading_list = read_all_readings_db(True, None)

            # O(n+m) loop. *Requires* patients and readings to be sorted by patientId
            readingIdx = 0
            for p in patient_list:
                while (
                    readingIdx < len(reading_list)
                    and reading_list[readingIdx]["patientId"] == p["patientId"]
                ):
                    p["readings"].append(reading_list[readingIdx])
                    readingIdx += 1

            return patient_list

        return m.query.filter_by(**kwargs).all()

    else:
        if not kwargs:
            return m.query.all()
        return m.query.filter_by(**kwargs).all()


def read_all_assoc_patients(m: Type[M], user: User, is_cho: bool) -> List[M]:
    """
    Queries the database for all Patients and Readings data

    :param m: Type of the model to query for
    :param user: Current User
    :return: A list patient_list
    """
    if m.schema() == PatientAssociations.schema():

        user_ids = get_user_ids_list(user.id, is_cho)

        # get all the patients
        patient_list = read_all_assoc_patients_db(user_ids)
        # get all reading + referral + followup
        reading_list = read_all_readings_db(False, user_ids)

        # O(n+m) loop. *Requires* patients and readings to be sorted by patientId
        readingIdx = 0
        for p in patient_list:
            while (
                readingIdx < len(reading_list)
                and reading_list[readingIdx]["patientId"] == p["patientId"]
            ):
                p["readings"].append(reading_list[readingIdx])
                readingIdx += 1

            del p["id"]
        return patient_list


def read_all_admin_view(m: Type[M], **kwargs) -> List[M]:
    """
    Queries the database for all Patients or Referrals

    :param m: Type of the model to query for
    :param kwargs: limit, page, search, sortBy, sortDir

    :return: A list of models from the database
    """
    search_param = (
        None if kwargs.get("search", None) == "" else kwargs.get("search", None)
    )
    sql_str = SQL.get_sql_string(search_param, **kwargs)
    sql_str_table = SQL.get_sql_table_operations(m)

    if m.schema() == Patient.schema():
        if search_param is not None:
            return db_session.execute(sql_str_table + sql_str)
        else:
            return db_session.execute(sql_str_table + sql_str)

    if m.schema() == Referral.schema():
        if search_param is not None:
            return db_session.execute(sql_str_table + sql_str)
        else:
            return db_session.execute(sql_str_table + sql_str)


def read_referrals(user_ids: Optional[List[int]] = None, **kwargs) -> List[Referral]:
    """
    Queries the database for referrals filtered by query criteria in keyword arguments.

    :param user_id: List of user IDs to filter patients wrt patient associations; None
    to get all patients
    :param kwargs: Query params including search_text, order_by, direction, limit, page,
    health_facilities, referrers, date_range, is_assessed, is_pregnant

    :return: A list of referrals
    """
    order_by = kwargs.get("order_by", "dateReferred")
    direction = asc if kwargs.get("direction") == "ASC" else desc

    query = (
        db_session.query(
            Referral.id,
            Referral.dateReferred,
            Referral.isAssessed,
            Patient.patientId,
            Patient.patientName,
            Patient.villageNumber,
            Reading.trafficLightStatus,
        )
        .join(Patient, Referral.patient)
        .join(Reading, Referral.reading)
        .order_by(direction(order_by))
    )

    if user_ids:
        query = query.join(PatientAssociations, Patient.associations).filter(
            PatientAssociations.userId.in_(user_ids)
        )

    search_text = kwargs.get("search_text")
    if search_text:
        query = query.filter(
            or_(
                Patient.patientId.like(f"%{search_text}%"),
                Patient.patientName.like(f"%{search_text}%"),
            )
        )

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
        query = query.filter(Reading.trafficLightStatus == vital_signs)

    limit = kwargs.get("limit")
    if limit:
        page = kwargs.get("page", 1)
        return query.slice(*__get_slice_indexes(page, limit))
    else:
        return query.all()


def read_patient_records(m: Type[M], patient_id: str, **kwargs) -> List[M]:
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


def read_mobile_patients(user_id: Optional[str] = None) -> List[Any]:
    """
    Queries the database for all patients associated with the user including the latest
    pregnancy, medical and durg records for each patient.

    :param user_id: The user ID to filter patients wrt patient associations; None to get
    all patients

    :return: A list of patients
    """
    # Aliased classes to be used in join clauses for geting the latest pregnancy, medical
    # and drug records.
    p1 = aliased(Pregnancy)
    p2 = aliased(Pregnancy)
    m1 = aliased(MedicalRecord)
    m2 = aliased(MedicalRecord)
    m3 = aliased(MedicalRecord)
    m4 = aliased(MedicalRecord)

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
            p1.id.label("pregnancyId"),
            p1.startDate.label("gestationalTimestamp"),
            p1.defaultTimeUnit.label("gestationalAgeUnit"),
            m1.id.label("medicalHistoryId"),
            m1.information.label("medicalHistory"),
            m3.id.label("drugHistoryId"),
            m3.information.label("drugHistory"),
        )
        .outerjoin(p1, and_(Patient.patientId == p1.patientId, p1.endDate == None))
        .outerjoin(p2, and_(p1.patientId == p2.patientId, p1.startDate < p2.startDate))
        .outerjoin(
            m1, and_(Patient.patientId == m1.patientId, m1.isDrugRecord == False)
        )
        .outerjoin(
            m2,
            and_(
                m1.patientId == m2.patientId,
                m1.dateCreated < m2.dateCreated,
                m2.isDrugRecord == False,
            ),
        )
        .outerjoin(m3, and_(Patient.patientId == m3.patientId, m3.isDrugRecord == True))
        .outerjoin(
            m4,
            and_(
                m3.patientId == m4.patientId,
                m3.dateCreated < m4.dateCreated,
                m4.isDrugRecord == True,
            ),
        )
        .filter(p2.startDate == None, m2.dateCreated == None, m4.dateCreated == None)
    )

    if user_id:
        query = query.join(PatientAssociations, Patient.associations).filter(
            PatientAssociations.userId == user_id
        )

    return query.all()


def read_all_patients_for_user(user: User, **kwargs) -> List[M]:
    """
    Queries the database for all associated Patients

    :param user: Current User
    :param kwargs: limit, page, search, sortBy, sortDir

    :return: A list patient_list
    """
    search_param = (
        None if kwargs.get("search", None) == "" else kwargs.get("search", None)
    )
    sql_str = SQL.get_sql_string(search_param, **kwargs)
    sql_str_table = SQL.get_sql_table_operation_assoc(True, user)

    if search_param is not None:
        return db_session.execute(sql_str_table + sql_str)
    else:
        return db_session.execute(sql_str_table + sql_str)


def read_all_patients_for_assoc_vht(user: User, **kwargs) -> List[M]:
    """
    Queries the database for all associated Patients

    :param user: Current User
    :param kwargs: limit, page, search, sortBy, sortDir

    :return: A list patient_list that are associated to the VHT
    """
    search_param = (
        None if kwargs.get("search", None) == "" else kwargs.get("search", None)
    )
    sql_str = SQL.get_sql_string(search_param, **kwargs)
    vht_list = [
        {column: value for column, value in row.items()}
        for row in get_sql_vhts_for_cho_db(user.id)
    ]
    vht_list_id = [str(user.id)]
    for vht in vht_list:
        vht_list_id.append(str(vht["id"]))

    sql_str_vht_ids = ",".join(vht_list_id)
    sql_str_table = SQL.get_sql_table_operation_assoc_vht_list(True, sql_str_vht_ids)

    if search_param is not None:
        return db_session.execute(sql_str_table + sql_str)
    else:
        return db_session.execute(sql_str_table + sql_str)


def read_all_referral_for_user(user: User, **kwargs) -> List[M]:
    """
    Queries the database for all associated Patients

    :param user: Current User
    :param kwargs: limit, page, search, sortBy, sortDir

    :return: A list referrals that are associated to the current user
    """
    search_param = (
        None if kwargs.get("search", None) == "" else kwargs.get("search", None)
    )
    sql_str = SQL.get_sql_string(search_param, **kwargs)
    sql_str_table = SQL.get_sql_table_operation_assoc(False, user)

    if search_param is not None:
        return db_session.execute(sql_str_table + sql_str)
    else:
        return db_session.execute(sql_str_table + sql_str)


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


def read_all_patients_db() -> List[M]:
    """
    Queries the database for all Patients

    :return: A dictionary of Patients
    """

    # make DB call
    patients = db_session.execute("SELECT * FROM patient ORDER BY patientId ASC")

    arr = []
    # make list of patients
    for pat_row in patients:
        creat_dict = {}
        creat_dict = serialize.serialize_patient_sql_to_dict(creat_dict, pat_row)
        arr.append(creat_dict)

    return arr


def read_all_assoc_patients_db(user_ids: str) -> List[M]:
    """
    Queries the database for all Patients

    :return: A dictionary of Patients
    """
    # make DB call
    patients = db_session.execute(
        "SELECT * FROM patient p JOIN patient_associations pa "
        "ON p.patientId = pa.patientId             "
        " AND pa.userId IN (" + user_ids + ") ORDER BY p.patientId ASC"
    )

    arr = []
    # make list of patients
    for pat_row in patients:
        creat_dict = {}
        creat_dict = serialize.serialize_patient_sql_to_dict(creat_dict, pat_row)
        arr.append(creat_dict)

    return arr


def read_all_readings_db(is_admin: bool, user_ids: str) -> List[M]:
    """
    Queries the database for all Readings

    :return: A dictionary of Readings
    """
    # make DB call
    get_sql_for_readings = SQL.get_sql_for_readings(user_ids, is_admin)
    reading_and_referral = db_session.execute(get_sql_for_readings)

    arr = []

    # make list of readings
    for reading_row in reading_and_referral:
        creat_dict = {}
        creat_dict = serialize.serialize_reading_sql_to_dict(creat_dict, reading_row)
        # make list of symptoms
        if not creat_dict.get("symptoms"):
            creat_dict["symptoms"] = []
        else:
            creat_dict["symptoms"] = creat_dict["symptoms"].split(",")

        arr.append(creat_dict)

    return arr


def get_user_ids_list(user_id: int, is_cho: bool):
    if is_cho:
        vht_list = [
            {column: value for column, value in row.items()}
            for row in get_sql_vhts_for_cho_db(str(user_id))
        ]
        vht_list_id = [str(user_id)]
        for vht in vht_list:
            vht_list_id.append(str(vht["id"]))

        sql_str_vht_ids = ",".join(vht_list_id)
    else:
        sql_str_vht_ids = str(user_id)

    return sql_str_vht_ids


def get_sql_vhts_for_cho_db(cho_id: str) -> List[M]:
    return db_session.execute(
        "SELECT * from supervises s inner join "
        "user u on s.vhtId = u.id "
        "where choId = " + str(cho_id)
    )


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


def __get_slice_indexes(page, limit):
    start = (int(page) - 1) * int(limit)
    stop = start + int(limit)
    return start, stop
