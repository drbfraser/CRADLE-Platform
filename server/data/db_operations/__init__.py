import config
import logging
from typing import TypeVar

db_session = config.db.session

M = TypeVar("M")
S = TypeVar("S")

LOGGER = logging.getLogger(__name__)
