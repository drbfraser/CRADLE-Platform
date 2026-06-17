"""
pregnancy_medical_utils.py

This module provides utility functions for working with pregnancy records
in the database. These utilities help enforce data integrity and prevent
inconsistent or overlapping entries when creating or updating pregnancy data.

Functions:
    has_conflicting_pregnancy_record(patient_id, start_date, end_date=None, pregnancy_id=None):
Usage:
    Use these functions in services or APIs that manage pregnancy data
    to ensure no overlapping pregnancies are stored in the system.
"""

from typing import Optional

from sqlalchemy import or_
from sqlalchemy.sql.expression import and_

from data.db_operations import db_session
from models import (
    PregnancyOrm,
)


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
