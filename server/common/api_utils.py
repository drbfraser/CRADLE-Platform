import json
import re
from typing import List, Optional

from flask import Request, request
from pydantic import AliasChoices, Field, field_validator
from pydantic.alias_generators import to_snake

from common import user_utils
from config import app
from data import crud
from models import UserOrm
from validation import CradleBaseModel
from validation.workflow_template_steps import WorkflowTemplateStepModel


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


class WorkflowClassificationIdPath(CradleBaseModel):
    workflow_classification_id: str


class WorkflowTemplateIdPath(CradleBaseModel):
    workflow_template_id: str


class WorkflowTemplateStepIdPath(CradleBaseModel):
    workflow_template_step_id: str


class WorkflowInstanceIdPath(CradleBaseModel):
    workflow_instance_id: str


class WorkflowInstanceStepIdPath(CradleBaseModel):
    workflow_instance_step_id: str


# Create a response model for the list endpoints
class WorkflowTemplateStepListResponse(CradleBaseModel):
    items: List[WorkflowTemplateStepModel]


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


def get_user_id(d: dict, user_attribute: str) -> Optional[int]:
    """
    Returns the ID of the user associated with the given dictionary. Raises an error if the user does not exist.

    :param d: The dictionary to get the user associated with
    :param user_attribute: The attribute that holds the user ID

    :return: The ID of the user associated with the given attribute
    """
    if d[user_attribute]:
        current_user = crud.read(m=UserOrm, id=d[user_attribute])

    # If the attribute does not have a user ID, get the user from the JWT
    else:
        current_user = user_utils.get_current_user_from_jwt()

    # Check if the user actually exists
    if current_user is None:
        raise ValueError("User does not exist")

    if isinstance(current_user, dict):
        return int(current_user["id"])

    return int(current_user.id)


def convert_query_parameter_to_bool(value):
    if value is None:
        return False
    return str(value).lower() == "true"