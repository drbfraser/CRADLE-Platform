import importlib
import logging
import sys

from data import db_session, orm_serializer
from models import get_schema_for_model
from service import invariant

from .api import marshal, marshal_with_type, unmarshal
from .patients import (
    make_medical_record_from_patient,
    makePregnancyFromPatient,
    marshal_patient_pregnancy_summary,
)
from .questions import marshal_question_to_single_version

logging = logging.getLogger(__name__)

# Make api.unmarshal's internal schema lookup use the package-level hook
_api = importlib.import_module("data.orm_serializer.api")


def _api_proxy(*args, **kwargs):
    """
    Proxies the internal schema lookup from the API module to the ORM_serializer module.

    This is a private function and should not be used directly.
    """
    return orm_serializer.get_schema_for_model(*args, **kwargs)


_api.get_schema_for_model = _api_proxy


for _mod in ("patients", "records", "forms", "phone", "questions", "workflows"):
    importlib.import_module(f"{__name__}.{_mod}")

try:
    from . import utils

    def _utils_proxy(*args, **kwargs):
        """
        Proxies the internal schema lookup from the utils module to the ORM_serializer module.

        This is a private function and should not be used directly.
        """
        return orm_serializer.get_schema_for_model(*args, **kwargs)

    utils.get_schema_for_model = _utils_proxy

    class _UtilsDbSessionProxy:
        def __getattr__(self, name):
            return getattr(orm_serializer.db_session, name)

    utils.db_session = _UtilsDbSessionProxy()
except Exception:
    logging.debug("Failed to wire orm_serializer.utils", exc_info=True)

del importlib, sys, _mod, _api


__all__ = [
    "db_session",
    "get_schema_for_model",
    "invariant",
    "makeMedicalRecordsFromPatient",
    "makePregnancyFromPatient",
    "make_medical_record_from_patient",
    "make_medical_records_from_patient",
    "make_pregnancy_from_patient",
    "marshal",
    "marshal_form_to_single_version",
    "marshal_patient_medical_history",
    "marshal_patient_pregnancy_summary",
    "marshal_question_to_single_version",
    "marshal_with_type",
    "unmarshal",
    "unmarshal_question_list",
]
