from typing import Dict

from datetime import datetime
from dateutil.relativedelta import relativedelta


def patient_age(instance: Dict):
    dob: datetime = instance.get("date_of_birth")
    delta = relativedelta(datetime.now() - dob)
    return delta.years