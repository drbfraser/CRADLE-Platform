"""
helper_utils.py

purpose:
    This module contains common database query helpers used across modules.

Functions included:
- __filter_by_patient_association: Restricts queries based on user-patient associations,
  including CHO-VHT supervision relationships.
- __filter_by_patient_search: Applies free-text search filters on patient identifiers,
  names, or village numbers.
- __order_by_column: Dynamically orders query results by a specified column in ascending
  or descending order.
- __get_slice_indexes: Computes pagination slice indexes (start, stop) given page and
  limit parameters.

These helpers reduce code duplication across CRUD modules such as patient, referral,
and workflow queries.
"""

from typing import Any, Optional, Tuple

from sqlalchemy import or_
from sqlalchemy.orm import Query
from sqlalchemy.sql.expression import asc, desc

from data.db_operations import db_session
from models import (
    PatientAssociationsOrm,
    PatientOrm,
    SupervisesTable,
)


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
