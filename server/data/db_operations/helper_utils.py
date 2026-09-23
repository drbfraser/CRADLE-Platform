"""
helper_utils.py

purpose:
    This module contains common database query helpers used across modules.

Functions included:
- __filter_by_patient_search: Applies free-text search filters on patient identifiers,
  names, or village numbers.
- __order_by_column: Dynamically orders query results by a specified column in ascending
  or descending order.
- __get_slice_indexes: Computes pagination slice indexes (start, stop) given page and
  limit parameters.

These helpers reduce code duplication across CRUD modules such as patient, referral,
and workflow queries.
"""

from sqlalchemy import or_
from sqlalchemy.orm import Query
from sqlalchemy.sql.expression import asc, desc

from models import PatientOrm


def __filter_by_patient_search(query: Query, **kwargs) -> Query:
    """Filter a query by a search string matched against patient ID, name, and village number."""
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
    """Apply an ORDER BY clause to the query based on the order_by and direction kwargs."""

    def __get_column(models):
        """Return the column attribute matching order_by from the first model that has it."""
        for model in models:
            if hasattr(model, order_by):
                return getattr(model, order_by)

    order_by = kwargs.get("order_by")
    if order_by:
        direction = asc if kwargs.get("direction") == "ASC" else desc
        column = __get_column(models)
        query = query.order_by(direction(column))

    return query


def __get_slice_indexes(page: str, limit: str) -> tuple[int, int]:
    """Return the start and stop slice indexes for the given page and limit."""
    start = (int(page) - 1) * int(limit)
    stop = start + int(limit)
    return start, stop
