from datetime import datetime
from typing import Dict

from dateutil.relativedelta import relativedelta


def patient_age(instance: Dict) -> int:
    dob: datetime = instance.get("date_of_birth")
    delta = relativedelta(datetime.now() - dob)
    return delta.years
