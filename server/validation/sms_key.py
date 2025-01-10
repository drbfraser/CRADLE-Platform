from validation import CradleBaseModel


class SmsKeyExamples:
    _key = "717c82dcc3814541b9ec502f4f753198261c6191457c0cb2626c33effaf2d520"
    _message = "NORMAL"
    _expiry_date = "2025-02-18 23:20:17"
    _stale_date = "2025-02-08 23:20:17"

    valid_example = {
        "key": _key,
        "message": _message,
        "expiry_date": _expiry_date,
        "stale_date": _stale_date,
    }


class SmsKeyModel(CradleBaseModel):
    key: str
    message: str
    expiry_date: str
    stale_date: str
