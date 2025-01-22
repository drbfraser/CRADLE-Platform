# Stats post requests validation
from typing import Optional

from pydantic import Field

from validation import CradleBaseModel

MYSQL_BIGINT_MAX = (2**63) - 1


class Timeframe(CradleBaseModel):
    from_: Optional[int] = Field(
        default=0,
        alias="from",
    )  # Use from_ to avoid conflict with Python's reserved keyword 'from'
    to: Optional[int] = Field(
        default=str(MYSQL_BIGINT_MAX),
    )

    model_config = dict(
        openapi_extra={
            "example": {
                "from": 1546702448,
                "to": 1547212259,
            },
        }
    )


class TrafficLightCounts(CradleBaseModel):
    green: int
    yellow_up: int
    yellow_down: int
    red_up: int
    red_down: int


class PatientStats(CradleBaseModel):
    bp_systolic_readings_monthly: list[int]
    bp_diastolic_readings_monthly: list[int]
    heart_rate_readings_monthly: list[int]

    bp_systolic_readings_last_twelve_months: list[int]
    bp_diastolic_readings_last_twelve_months: list[int]
    heart_rate_readings_last_twelve_months: list[int]

    traffic_light_counts_from_day_1: TrafficLightCounts

    current_month: int

    model_config = dict(
        openapi_extra={
            "example": {
                "bp_systolic_readings_monthly": [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                ],
                "bp_diastolic_readings_monthly": [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                ],
                "heart_rate_readings_monthly": [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                ],
                "bp_systolic_readings_last_twelve_months": [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                ],
                "bp_diastolic_readings_last_twelve_months": [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                ],
                "heart_rate_readings_last_twelve_months": [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                ],
                "traffic_light_counts_from_day_1": {
                    "green": 0,
                    "yellow_up": 0,
                    "yellow_down": 1,
                    "red_up": 0,
                    "red_down": 0,
                },
                "current_month": 1,
            }
        }
    )
