import datetime


def is_date_passed(date) -> bool:
    if date >= datetime.datetime.now():
        return False
    return True


def get_future_date(days_after=1):
    return datetime.datetime.today() + datetime.timedelta(days=days_after)
