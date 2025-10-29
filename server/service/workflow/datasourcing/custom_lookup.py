from datetime import datetime
from typing import Dict

from dateutil.relativedelta import relativedelta


def patient_age(instance: Dict) -> int:
    dob = instance.get("date_of_birth")
    
    if isinstance(dob, str):
        dob = datetime.strptime(dob, '%Y-%m-%d')
    
    delta = relativedelta(datetime.now(), dob)
    return delta.years