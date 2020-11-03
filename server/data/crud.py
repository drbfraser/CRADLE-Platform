from typing import List, Optional, Type, TypeVar

from data import db_session
from models import Patient, Referral
from sqlalchemy.orm import joinedload

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

    if m.schema() == Patient.schema():
        if not kwargs:
            patients = read_all_patients()
            readings = read_all_reading()

            for p in patients:
                for r in readings:
                    if r.get("patientId") == p.get("patientId"):
                        p.get("readings").append(r)

            return patients

        return m.query.filter_by(**kwargs).all()

    if m.schema() == Referral.schema():
        if not kwargs:
            return m.query.options(joinedload(m.patient)).all()
        return m.query.filter_by(**kwargs).options(joinedload(m.patient)).all()


# https://stackoverflow.com/questions/20743806/sqlalchemy-execute-return-resultproxy-as-tuple-not-dict


def create_dict(d: any, row: any, pat_or_reading: bool) -> dict:
    referral = {}
    followup = {}
    for column, value in row.items():
        if column == "dob":
            d = {**d, **{column: str(value)}}
        else:
            if "rf_" in column:
                referral = {**referral, **{column.replace("rf_", ""): value}}
            if "followup_" in column:
                followup = {**followup, **{column.replace("followup_", ""): value}}
            else:
                d = {**d, **{column.replace("r_", ""): value}}

    if not pat_or_reading:
        d = {**d, **{"referral": referral}}

    if pat_or_reading:
        d = {**d, **{"readings": []}}
    return d


def read_all_patients() -> List[M]:
    patients = db_session.execute("SELECT * FROM patient ORDER BY patientId ASC")

    creat_dict, arr = {}, []

    for pat_row in patients:
        creat_dict = create_dict(creat_dict, pat_row, True)
        arr.append(creat_dict)

    return arr


def read_all_reading() -> List[M]:
    reading_referral = db_session.execute(
        "SELECT rf.id as rf_id, "
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
        "r.isFlaggedForFollowup as r_isFlaggedForFollowup, "
        "f.id as followup_id, "
        "f.followupInstructions as followup_followupInstructions, "
        "f.specialInvestigations as followup_specialInvestigations, "
        "f.diagnosis as followup_diagnosis, "
        "f.treatment as followup_treatment, "
        "f.medicationPrescribed as followup_medicationPrescribed, "
        "f.dateAssessed as followup_dateAssessed, "
        "f.followupNeeded as followup_followupNeeded"
        " FROM reading r LEFT JOIN referral rf on r.readingId=rf.readingId"
        " LEFT JOIN followup f on r.readingId=f.readingId"
        " ORDER BY r.patientId ASC"
    )

    creat_dict, creat_dict_refrral, arr = {}, {}, []

    for reading_row in reading_referral:
        creat_dict = create_dict(creat_dict, reading_row, False)
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

    limit = kwargs.get("limit", None)
    page = kwargs.get("page", None)
    sortBy = kwargs.get("sortBy", None)
    sortDir = kwargs.get("sortDir", None)
    search_param = (
        None if kwargs.get("search", None) == "" else kwargs.get("search", None)
    )

    if m.schema() == Patient.schema():
        if search_param is not None:
            return db_session.execute(
                "SELECT p.patientName, "
                "p.patientId, "
                "p.villageNumber, "
                "r.trafficLightStatus, "
                "r.dateTimeTaken"
                " FROM patient p LEFT JOIN reading r ON r.readingId = "
                "(SELECT r2.readingId FROM reading r2 WHERE r2.patientId=p.patientId"
                " ORDER BY r2.dateTimeTaken DESC LIMIT 1) "
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

        else:
            return db_session.execute(
                "SELECT p.patientName, "
                "p.patientId, "
                "p.villageNumber, "
                "r.trafficLightStatus, "
                "r.dateTimeTaken"
                " FROM patient p LEFT JOIN reading r ON r.readingId = "
                "(SELECT r2.readingId FROM reading r2 WHERE r2.patientId=p.patientId"
                " ORDER BY r2.dateTimeTaken DESC LIMIT 1) "
                " ORDER BY "
                + sortBy
                + " "
                + sortDir
                + " LIMIT "
                + str((page - 1) * limit)
                + ", "
                + str(limit)
            )

    if m.schema() == Referral.schema():
        if search_param is not None:
            return db_session.execute(
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
        else:
            return db_session.execute(
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
                " ORDER BY "
                + sortBy
                + " "
                + sortDir
                + " LIMIT "
                + str((page - 1) * limit)
                + ", "
                + str(limit)
            )


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
