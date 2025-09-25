"""
supervision.py

This module provides functions for managing supervision relationships between
CHOs and VHTs. It includes functions to add VHTs to a CHO's supervision list
and retrieve the list of VHTs supervised by a CHO.

Functions:
- add_vht_to_supervise(cho_id, vht_ids): Adds VHTs to a CHO's supervision list.
- get_supervised_vhts(user_id): Retrieves the list of VHTs supervised by a CHO.
"""

from typing import List

from data.db_operations import db_session, LOGGER
from models import (
    SupervisesTable,
    UserOrm,
)

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