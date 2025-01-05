import json
import re
from typing import Optional

from flask import request
from humps import decamelize
from pydantic import AliasChoices, Field, field_validator
from pydantic.alias_generators import to_snake

from common import user_utils
from config import app
from validation import CradleBaseModel


def get_query_params() -> dict:
    """
    Extracts URL search params contained in the request
    and converts the keys to snake case.

    :param request: Flask request object
    :return: URL search params converted to snake case,
      stored in a dictionary
    """
    request_args: dict = decamelize(request.args)

    params = {
        "search_text": request_args.get("search"),
        "order_by": request_args.get("sort_by"),
        "direction": request_args.get("sort_dir"),
        "limit": request_args.get("limit"),
        "page": request_args.get("page"),
        "date_range": request_args.get("date_range"),
        "readings": request_args.get("readings"),
        "referrals": request_args.get("referrals"),
        "assessments": request_args.get("assessments"),
        "forms": request_args.get("forms"),
        "lang": request_args.get("lang"),
        "is_assessed": request_args.get("is_assessed"),
        "is_pregnant": request_args.get("is_pregnant"),
        "include_archived": request_args.get("include_archived"),
        "vital_signs": list(
            filter(None, decamelize(request.args.getlist("vital_signs")))
        ),
        "referrers": list(filter(None, decamelize(request.args.getlist("referrer")))),
        "health_facilities": list(
            filter(None, decamelize(request.args.getlist("health_facility")))
        ),
    }

    # If not None, order_by will be assigned a field name, so it too must
    # me converted to snake case.
    order_by = params.get("order_by")
    if order_by is not None:
        params["order_by"] = decamelize(order_by)

    return {k: v for k, v in params.items() if v and k is not None}


def get_query_param_bool(name: str) -> bool:
    """
    Returns true if the request URL contains a boolean query parameter with a given
    ``name`` who's value is "true".

    :param request: A request
    :param name: The name of the parameter to check for
    :return: True if the value for the parameter is "true", otherwise False.
    """
    request_args: dict = decamelize(request.args)
    return request_args.get(name, "false") == "true"


@app.after_request
def log_request_details(response):
    """
    middleware function for logging changes made by users
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
        5, description="The maximum number of records per page."
    )
    page: Optional[int] = Field(1, description="The number of pages to return.")


class SearchFilterQueryParams(PageLimitFilterQueryParams):
    search: Optional[str] = Field(
        default=None,
        description="Search term for filtering returned Patients.",
        validation_alias=AliasChoices("search", "search_text", "searchText"),
        serialization_alias="search_text",
    )
    order_by: Optional[str] = Field(
        default=None,
        description="Name of the field to perform the sorting around.",
        validation_alias=AliasChoices("order_by", "sort_by", "sortBy", "orderBy"),
    )
    direction: Optional[str] = Field(
        default="ASC",
        description="Whether ordering should be done in ascending or descending order. Must be either `ASC` or `DESC`",
        validation_alias=AliasChoices("direction", "sort_dir", "sortDir"),
    )

    @field_validator("order_by")
    @classmethod
    def convert_order_by_field_name_to_snake_case(
        cls, order_by: Optional[str]
    ) -> Optional[str]:
        if order_by is None:
            return None
        return to_snake(order_by)
