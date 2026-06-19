import datetime


def is_date_passed(date) -> bool:
    """Return True if the given date is in the past."""
    if date >= datetime.datetime.now():
        return False
    return True


def get_future_date(days_after=1):
    """Return a datetime N days in the future."""
    return datetime.datetime.today() + datetime.timedelta(days=days_after)
