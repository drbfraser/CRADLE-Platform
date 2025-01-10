from validation import CradleBaseModel


class SmsKeyModel(CradleBaseModel):
    key: str
    message: str
    expiry_date: str
    stale_date: str
