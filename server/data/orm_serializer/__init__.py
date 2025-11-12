import logging

from data import db_session, orm_serializer
from models import get_schema_for_model
from service import invariant

from .api import marshal, marshal_with_type, unmarshal
from .forms import unmarshal_question_list
from .patients import (
    make_medical_record_from_patient,
    makePregnancyFromPatient,
    marshal_patient_medical_history,
    marshal_patient_pregnancy_summary,
)
from .questions import marshal_question_to_single_version

logging = logging.getLogger(__name__)


try:
    from . import utils

    def _utils_proxy(*args, **kwargs):
        """
        Proxies the internal schema lookup from the utils module to the ORM_serializer module.

        This is a private function and should not be used directly.
        """
        return orm_serializer.get_schema_for_model(*args, **kwargs)

    utils.get_schema_for_model = _utils_proxy

except Exception:
    logging.debug("Failed to wire orm_serializer.utils", exc_info=True)


__all__ = [
    "db_session",
    "get_schema_for_model",
    "invariant",
    "makePregnancyFromPatient",
    "make_medical_record_from_patient",
    "marshal",
    "marshal_patient_medical_history",
    "marshal_patient_pregnancy_summary",
    "marshal_question_to_single_version",
    "marshal_with_type",
    "unmarshal",
    "unmarshal_question_list",
]
