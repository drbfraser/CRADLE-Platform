from datetime import datetime

from dateutil.relativedelta import relativedelta


def patient_age(instance: dict) -> int:
    """Return the patient's current age in years from their date of birth."""
    dob = instance.get("date_of_birth")

    if isinstance(dob, str):
        dob = datetime.strptime(dob, "%Y-%m-%d")

    delta = relativedelta(datetime.now(), dob)
    return delta.years
