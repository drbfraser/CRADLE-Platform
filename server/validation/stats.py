# Stats post requests validation
from typing import Optional

from pydantic import Field

from validation import CradleBaseModel

MYSQL_BIGINT_MAX = (2**63) - 1


class TimeframeValidator(CradleBaseModel):
    """
    {
        "from": 1546702448,
        "to": 1547212259
    }
    """

    from_: Optional[int] = Field(
        default=0,
        alias="from",
    )  # Use from_ to avoid conflict with Python's reserved keyword 'from'
    to: Optional[int] = Field(
        default=str(MYSQL_BIGINT_MAX),
    )
