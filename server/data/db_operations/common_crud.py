"""
common_crud.py
--------------

This module provides generic, reusable CRUD (Create, Read, Update, Delete)
operations for all SQLAlchemy ORM models in the system. It centralizes
common database interactions to ensure consistency across the codebase.

Functions included here cover:
- Creating single or multiple model instances (`create`, `create_model`, `create_all`)
- Reading single or multiple records (`read`, `read_all`, `find`)
- Updating model fields (`update`)
- Deleting records in several ways (`delete`, `delete_by`, `delete_all`)
"""

from typing import Any, List, Optional, Type

from data.db_operations import M, S, db_session
from models import (
    ReadingOrm,
)
from service import invariant


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
    #FIXME This function doesn't return anything?
    """
    model = read(m, **kwargs)

    for k, v in changes.items():
        setattr(model, k, v)

    # Ensures that any reading that is entered into the DB is correctly formatted
    if isinstance(model, ReadingOrm):
        invariant.resolve_reading_invariants(model)

    if autocommit:
        db_session.commit()


def merge(model: M, autocommit: bool = True):
    """
    Merge a model into the current database session.

    If the object is not already in the session, it will be added.
    If it exists, its state will be updated.

    :param model: The model to merge
    :param autocommit: If true, the current transaction is committed before return; the
                       default is true
    """
    db_session.merge(model)

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

def read_by_filter(m: Type[M], filter_condition) -> Optional[M]:
    """
    Queries the database for a single object using a SQLAlchemy filter condition.
    
    :param m: Type of the model to query for
    :param filter_condition: SQLAlchemy filter expression (e.g., Model.field == value)
    :return: A model from the database or None if no model was found
    """
    return m.query.filter(filter_condition).one_or_none()
