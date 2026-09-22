from flask import abort

from common import user_utils
from service.patient_authorization import can_access_patient


def require_patient_access(patient_id: str) -> None:
    current_user = user_utils.get_current_user_from_jwt()
    if not can_access_patient(current_user, patient_id):
        abort(403, description="Not authorized to access this patient.")
