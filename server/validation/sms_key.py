from validation import CradleBaseModel


class SmsKeyExamples:
    key = "717c82dcc3814541b9ec502f4f753198261c6191457c0cb2626c33effaf2d520"
    message = "NORMAL"
    expiry_date = "2025-02-18 23:20:17"
    stale_date = "2025-02-08 23:20:17"

    example = {
        "key": key,
        "message": message,
        "expiry_date": expiry_date,
        "stale_date": stale_date,
    }


class SmsKeyModel(CradleBaseModel):
    key: str
    message: str
    expiry_date: str
    stale_date: str
