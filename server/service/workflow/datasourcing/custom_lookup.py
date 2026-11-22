from __future__ import annotations

import math
import time
from datetime import datetime

from dateutil.relativedelta import relativedelta


def patient_age(instance: dict) -> int:
    """Return the patient's current age in years from their date of birth."""
    dob = instance.get("date_of_birth")

    if isinstance(dob, str):
        dob = datetime.strptime(dob, "%Y-%m-%d")

    delta = relativedelta(datetime.now(), dob)
    return delta.years


SECONDS_PER_DAY = 24 * 60 * 60
SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY


def pregnancy_gestational_age_weeks(
    pregnancy: dict, now: float | None = None
) -> int | None:
    """
    ``start_date`` is a Unix timestamp (seconds)
    Return completed weeks of gestation for an ongoing pregnancy.
    Returns None if the pregnancy has ended or has no start date.

    Uses the same calculation as the frontend ``getNumOfWeeksDaysNumeric`` (client/src/shared/
    utils/date.ts): round elapsed time to the nearest day, then convert to whole weeks.
    """
    start_date = pregnancy.get("start_date")
    if start_date is None or pregnancy.get("end_date") is not None:
        return None

    if now is None:
        now = time.time()

    total_days = math.floor((now - float(start_date)) / SECONDS_PER_DAY + 0.5)
    return max(0, total_days // 7)
