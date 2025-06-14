import json
import re
from typing import Optional

from flask import Request, request
from pydantic import AliasChoices, Field, field_validator
from pydantic.alias_generators import to_snake

from common import user_utils
from config import app
from validation import CradleBaseModel


@app.after_request
def _log_request_details(response):
    """
    Middleware function for logging changes made by users
    """
    try:
        try:
            requestor_data = user_utils.get_current_user_from_jwt()
        except Exception:
            requestor_data = {}

        if len(request.data) == 0:
            req_data = request.args.to_dict()
        else:
            req_data = json.loads(request.data.decode("utf-8"))

        request_data = {}
        for key in req_data:
            if "password" in key.lower():
                continue
            request_data[key] = req_data[key]

        if response.status_code == 200:
            status_str = "Successful"
        else:
            status_str = "Unsuccessful"

        extra = {
            "Response Status": f"{response.status_code} ({status_str})",
            "Request Information": request_data,
            "Requestor Information": requestor_data,
        }

        message = f"Accessing Endpoint: {re.search(r'/api/.*', request.url).group(0)} Request Method: {request.method}"
        app.logger.info(message, extra=extra)
    except Exception as err:
        app.logger.info(
            "An unexpected error occurred while logging request and response data",
        )
        app.logger.error(err)
    return response


# Pydantic Models for API Path and Query parameters
class AssessmentIdPath(CradleBaseModel):
    assessment_id: str


class PatientIdPath(CradleBaseModel):
    patient_id: str


class PregnancyIdPath(CradleBaseModel):
    pregnancy_id: int


class UserIdPath(CradleBaseModel):
    user_id: int


class RecordIdPath(CradleBaseModel):
    record_id: int


class ReadingIdPath(CradleBaseModel):
    reading_id: str


class ReferralIdPath(CradleBaseModel):
    referral_id: str


class FormClassificationIdPath(CradleBaseModel):
    form_classification_id: str


class FormTemplateIdPath(CradleBaseModel):
    form_template_id: str


class FormIdPath(CradleBaseModel):
    form_id: str


class FacilityNamePath(CradleBaseModel):
    health_facility_name: str


class PageLimitFilterQueryParams(CradleBaseModel):
    limit: Optional[int] = Field(
        default=10, description="The maximum number of records per page."
    )
    page: Optional[int] = Field(default=1, description="The number of pages to return.")


class SearchFilterQueryParams(PageLimitFilterQueryParams):
    search: Optional[str] = Field(
        default=None,
        description="Search term for filtering returned Patients.",
        validation_alias=AliasChoices("search", "search_text", "searchText"),
        serialization_alias="search",
    )
    order_by: Optional[str] = Field(
        default=None,
        description="Name of the field to perform the sorting around.",
        validation_alias=AliasChoices("order_by", "sort_by", "sortBy", "orderBy"),
        serialization_alias="order_by",
    )
    direction: Optional[str] = Field(
        default="ASC",
        description="Whether ordering should be done in ascending or descending order. Must be either `ASC` or `DESC`",
        validation_alias=AliasChoices("direction", "sort_dir", "sortDir"),
        serialization_alias="direction",
    )

    @field_validator("order_by")
    @classmethod
    def convert_order_by_field_name_to_snake_case(
        cls, order_by: Optional[str]
    ) -> Optional[str]:
        if order_by is None:
            return None
        return to_snake(order_by)


# Utility functions for API query parameters
def query_param_limit(request: Request, name: str) -> int:
    """
    Returns Integer if the request URL contains a limit query parameter.

    :param request: A request
    :param name: The name of the parameter to check for
    :return: 10 if the value for the parameter is not specified, otherwise given value.
    """
    return request.args.get(name, 10, type=int)


def query_param_page(request: Request, name: str) -> int:
    """
    Returns Integer if the request URL contains a page query parameter.

    :param request: A request
    :param name: The name of the parameter to check for
    :return: 1 if the value for the parameter is not specified, otherwise given value.

    """
    return request.args.get(name, 1, type=int)


def query_param_sortBy(request: Request, name: str) -> str:
    """
    Returns String if the request URL contains a page sort_by parameter.

    :param request: A request
    :param name: The name of the parameter to check for
    :return: patientName if the value for the parameter is not specified, otherwise given column name.

    """
    return request.args.get(name, "patientName", type=str)


def query_param_sort_dir(request: Request, name: str) -> str:
    """
    Returns String if the request URL contains a page sort_dir parameter.

    :param request: A request
    :param name: The name of the parameter to check for
    :return: asc if the value for the parameter is not specified, otherwise given column name.

    """
    return request.args.get(name, "asc", type=str)


def query_param_search(request: Request, name: str) -> str:
    """
    Returns String if the request URL contains a page sort_dir parameter.

    :param request: A request
    :param name: The name of the parameter to check for
    :return: empty string if the value for the parameter is not specified, otherwise given column name.

    """
    return request.args.get(name, "", type=str)
