from typing import List, Optional, Type, TypeVar

from data import db_session
from models import Patient, Referral
import service.serialize as serialize

M = TypeVar("M")


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
    db_session.add(model)
    db_session.commit()
    if refresh:
        db_session.refresh(model)


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


def read_all(m: Type[M], **kwargs) -> List[M]:
    """
    Queries the database for all models which match some query parameters defined as
    keyword arguments.

    :param m: Type of the model to query for
    :param kwargs: Keyword arguments mapping column names to values to parameterize the
                   query (e.g., ``patientId="abc"``)
    :return: A list of models from the database
    """
    # relates to api/android/patients
    if m.schema() == Patient.schema():
        if not kwargs:
            # get all the patients
            patient_list = read_all_patients()
            # get all reading + referral + followup
            reading_list = read_all_readings()

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

    # NOTE -> this if statement is just for testing
    elif m.schema() == Referral.schema():
        if not kwargs:
            # get all the patients
            patient_list = read_all_patients_assoc()
            # get all reading + referral + followup
            reading_list = read_all_readings()

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
    else:
        if not kwargs:
            return m.query.all()
        return m.query.filter_by(**kwargs).all()


def read_all_patients() -> List[M]:
    # make DB call
    patients = db_session.execute("SELECT * FROM patient ORDER BY patientId ASC")

    creat_dict, arr = {}, []
    # make list of patients
    for pat_row in patients:
        creat_dict = serialize.serialize_patient_sql_to_dict(creat_dict, pat_row)
        arr.append(creat_dict)

    return arr


def read_all_patients_assoc() -> List[M]:
    # make DB call
    patients = db_session.execute(
        "SELECT * FROM patient p JOIN patient_associations pa "
        "ON p.patientId = pa.patientId ORDER BY p.patientId ASC"
    )

    creat_dict, arr = {}, []
    # make list of patients
    for pat_row in patients:
        creat_dict = serialize.serialize_patient_sql_to_dict(creat_dict, pat_row)
        arr.append(creat_dict)

    return arr


def read_all_readings() -> List[M]:
    # make DB call
    sql_query_reading = get_sql_table_col_for_reading_query()
    reading_and_referral = db_session.execute(
        sql_query_reading + " LEFT OUTER JOIN referral rf on r.readingId=rf.readingId"
        " LEFT OUTER JOIN followup fu on r.readingId=fu.readingId"
        " LEFT OUTER JOIN urine_test ut on r.readingId=ut.readingId"
        " JOIN patient_associations pa ON r.patientId = pa.patientId"
        " ORDER BY r.patientId ASC"
    )

    creat_dict, arr = {}, []

    # make list of readings
    for reading_row in reading_and_referral:
        creat_dict = serialize.serialize_reading_sql_to_dict(creat_dict, reading_row)
        # make list of symptoms
        if creat_dict.get("symptoms"):
            creat_dict["symptoms"] = creat_dict["symptoms"].split(",")
        arr.append(creat_dict)

    return arr


def read_all_with_args(m: Type[M], **kwargs) -> List[M]:
    """
    Queries the database for all models which match some query parameters defined as
    keyword arguments.

    :param m: Type of the model to query for
    :param kwargs: Keyword arguments mapping column names to values to parameterize the
                   query (e.g., ``sortBy="abc"``)
    :return: A list of models from the database
    """

    search_param = (
        None if kwargs.get("search", None) == "" else kwargs.get("search", None)
    )
    sql_str = get_sql_string(search_param, **kwargs)
    sql_str_table = get_sql_table_operations(m)

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


def read_all_patients_for_user(**kwargs) -> List[M]:
    search_param = (
        None if kwargs.get("search", None) == "" else kwargs.get("search", None)
    )
    sql_str = get_sql_string(search_param, **kwargs)
    sql_str_table = get_sql_table_operation_assoc(True)

    if search_param is not None:
        return db_session.execute(sql_str_table + sql_str)
    else:
        return db_session.execute(sql_str_table + sql_str)


def read_all_referral_for_user(**kwargs) -> List[M]:

    search_param = (
        None if kwargs.get("search", None) == "" else kwargs.get("search", None)
    )
    sql_str = get_sql_string(search_param, **kwargs)
    sql_str_table = get_sql_table_operation_assoc(False)

    if search_param is not None:
        return db_session.execute(sql_str_table + sql_str)
    else:
        return db_session.execute(sql_str_table + sql_str)


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


def get_sql_string(search_param: str, **kwargs) -> str:
    limit = kwargs.get("limit", None)
    page = kwargs.get("page", None)
    sortBy = kwargs.get("sortBy", None)
    sortDir = kwargs.get("sortDir", None)

    if search_param is not None:
        return (
            " WHERE patientName LIKE '%"
            + search_param
            + "%' OR p.patientId LIKE '"
            + search_param
            + "%'"
            + " ORDER BY "
            + sortBy
            + " "
            + sortDir
            + " LIMIT "
            + str((page - 1) * limit)
            + ", "
            + str(limit)
        )

    elif search_param is None:
        return (
            " ORDER BY "
            + sortBy
            + " "
            + sortDir
            + " LIMIT "
            + str((page - 1) * limit)
            + ", "
            + str(limit)
        )
    else:
        return ""


def get_sql_table_operations(m: Type[M]) -> str:
    if m.schema() == Patient.schema():
        return (
            "SELECT p.patientName, "
            "p.patientId, "
            "p.villageNumber, "
            "r.trafficLightStatus, "
            "r.dateTimeTaken"
            " FROM patient p LEFT JOIN reading r ON r.readingId = "
            "(SELECT r2.readingId FROM reading r2 WHERE r2.patientId=p.patientId"
            " ORDER BY r2.dateTimeTaken DESC LIMIT 1) "
        )

    elif m.schema() == Referral.schema():
        return (
            "SELECT p.patientId,"
            " p.patientName,"
            " p.villageNumber,"
            " rd.trafficLightStatus,"
            " rf.dateReferred,"
            " rf.isAssessed,"
            " rf.id"
            " FROM referral rf"
            " JOIN patient p ON rf.patientId=p.patientId"
            " JOIN reading rd ON rd.readingId=rf.readingId"
        )


def get_sql_table_operation_assoc(patient: bool) -> str:
    if patient:
        return (
            "SELECT p.patientName, "
            "p.patientId, "
            "p.villageNumber, "
            "r.trafficLightStatus, "
            "r.dateTimeTaken"
            " FROM patient p JOIN patient_associations pa ON p.patientId = pa.patientId"
            " LEFT JOIN reading r ON r.readingId = "
            "(SELECT r2.readingId FROM reading r2 WHERE r2.patientId=p.patientId"
            " ORDER BY r2.dateTimeTaken DESC LIMIT 1) "
        )
    else:
        return (
            "SELECT p.patientId,"
            " p.patientName,"
            " p.villageNumber,"
            " rd.trafficLightStatus,"
            " rf.dateReferred,"
            " rf.isAssessed,"
            " rf.id"
            " FROM referral rf"
            " JOIN patient p ON rf.patientId=p.patientId"
            " JOIN reading rd ON rd.readingId=rf.readingId"
            " JOIN patient_associations pa ON rf.patientId=pa.patientId"
        )


def get_sql_table_col_for_reading_query() -> str:
    return (
        "SELECT rf.id as rf_id, "
        "ut.id as ut_id, "
        "ut.urineTestLeuc as ut_urineTestLeuc, "
        "ut.urineTestNit as ut_urineTestNit, "
        "ut.urineTestGlu as ut_urineTestGlu, "
        "ut.urineTestPro as ut_urineTestPro, "
        "ut.urineTestBlood as ut_urineTestBlood, "
        "fu.id as fu_id, "
        "fu.followupInstructions as fu_followupInstructions, "
        "fu.specialInvestigations as fu_specialInvestigations, "
        "fu.diagnosis as fu_diagnosis, "
        "fu.treatment as fu_treatment, "
        "fu.medicationPrescribed as fu_medicationPrescribed, "
        "fu.dateAssessed as fu_dateAssessed, "
        "fu.followupNeeded as fu_followupNeeded, "
        "fu.readingId as fu_readingId, "
        "fu.healthcareWorkerId as fu_healthcareWorkerId, "
        "rf.comment as rf_comment, "
        "rf.isAssessed as rf_isAssessed, "
        "rf.referralHealthFacilityName as rf_referralHealthFacilityName, "
        "rf.patientId as rf_patientId, "
        "rf.readingId as rf_readingId, "
        "rf.dateReferred as rf_dateReferred, "
        "r.readingId as r_readingId, "
        "r.bpSystolic as r_bpSystolic, "
        "r.bpDiastolic as r_bpDiastolic, "
        "r.heartRateBPM as r_heartRateBPM, "
        "r.respiratoryRate as r_respiratoryRate, "
        "r.oxygenSaturation as r_oxygenSaturation, "
        "r.temperature as r_temperature, "
        "r.symptoms as r_symptoms, "
        "r.trafficLightStatus as r_trafficLightStatus, "
        "r.dateTimeTaken as r_dateTimeTaken, "
        "r.dateRecheckVitalsNeeded as r_dateRecheckVitalsNeeded, "
        "r.retestOfPreviousReadingIds as r_retestOfPreviousReadingIds, "
        "r.patientId as r_patientId, "
        "r.isFlaggedForFollowup as r_isFlaggedForFollowup"
        " FROM reading r"
    )
