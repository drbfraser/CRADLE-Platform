import json
from json import JSONDecodeError
from typing import Optional

from pydantic import Field, field_validator, model_validator
from typing_extensions import Self

from common.commonUtil import get_current_time
from enums import WorkflowStatusEnum
from validation import CradleBaseModel
from validation.forms import FormModel
from validation.rule_groups import RuleGroupExample, RuleGroupModel


class FormExample:
    LANGUAGE = "eng"
    PATIENT_ID = "123"
    QUESTION_LIST = [
        {
            "id": "question_1",
            "answers": {
                "comment": None,
                "mc_id_array": [0],
                "number": None,
                "text": "today",
            },
            "category_index": 0,
            "has_comment_attached": False,
            "mc_options": [{"mc_id": 0, "opt": "Decent"}],
            "num_max": None,
            "num_min": None,
            "question_index": 1,
            "question_text": "How the patient's condition?",
            "question_type": "MULTIPLE_CHOICE",
            "required": True,
            "string_max_length": None,
            "units": None,
            "visible_condition": [
                {
                    "answers": {"mc_id_array": [0]},
                    "question_index": 0,
                    "relation": "EQUAL_TO",
                },
            ],
        },
        {
            "id": "question_2",
            "answers": {
                "comment": None,
                "mc_id_array": [0],
                "number": None,
                "text": "today",
            },
            "category_index": 0,
            "has_comment_attached": False,
            "mc_options": [{"mc_id": 0, "opt": "Decent"}],
            "num_max": None,
            "num_min": None,
            "question_index": 1,
            "question_text": "How the patient's condition?",
            "question_type": "MULTIPLE_CHOICE",
            "required": True,
            "string_max_length": None,
            "units": None,
            "visible_condition": [
                {
                    "answers": {"mc_id_array": [0]},
                    "question_index": 0,
                    "relation": "EQUAL_TO",
                },
            ],
        },
    ]
    ID = "adas-d82314-27822-63138"
    FORM_TEMPLATE_ID = "adas-d82314-27822-63139"
    FORM_CLASSIFICATION_ID = "adas-d82314-27822-63139"
    DATE_CREATED = 1592339808
    DATE_LAST_EDITED = 1592339808
    LAST_EDITED_BY = 123
    IS_ARCHIVED = True

    form = {
        "lang": LANGUAGE,
        "patient_id": PATIENT_ID,
        "questions": QUESTION_LIST,
        "id": ID,
        "form_template_id": FORM_TEMPLATE_ID,
        "form_classification_id": FORM_CLASSIFICATION_ID,
        "date_created": DATE_CREATED,
        "last_edited": DATE_LAST_EDITED,
        "last_edited_by": LAST_EDITED_BY,
        "archived": IS_ARCHIVED,
    }


class WorkflowInstanceStepExamples:
    id = "workflow-instance-step-example-01"
    name = "Workflow Instance Step Example"
    title = "Workflow Instance Step Example"
    start_date = get_current_time()
    last_edited = get_current_time()
    completion_date = get_current_time()
    expected_completion = get_current_time()
    status = "Active"
    data = '{"answers": {"number": "123"}}'
    triggered_by = "workflow-instance-step-example-02"
    form = FormExample.form

    example_01 = {
        "id": id,
        "name": name,
        "title": title,
        "start_date": start_date,
        "last_edited": last_edited,
        "completion_date": completion_date,
        "expected_completion": expected_completion,
        "status": status,
        "data": data,
        "triggered_by": triggered_by,
        "form_id": FormExample.ID,
        "form": None,
        "assigned_to": 1232,
        "workflow_instance_id": "workflow-instance-example-01",
        "condition_id": RuleGroupExample.example_01["id"],
        "condition": RuleGroupExample.example_01,
    }

    with_form = {
        "id": id,
        "name": name,
        "title": title,
        "start_date": start_date,
        "last_edited": last_edited,
        "completion_date": completion_date,
        "expected_completion": expected_completion,
        "status": status,
        "data": data,
        "triggered_by": triggered_by,
        "form_id": FormExample.ID,
        "form": form,
        "assigned_to": 1232,
        "workflow_instance_id": RuleGroupExample.example_01["id"],
        "condition": RuleGroupExample.example_01,
    }


class WorkflowInstanceStepModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    title: str
    start_date: int = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    assigned_to: Optional[int] = None
    completion_date: Optional[int] = Field(default_factory=get_current_time)
    expected_completion: Optional[int] = Field(default_factory=get_current_time)
    status: str
    data: Optional[str] = None
    triggered_by: Optional[str] = None
    form_id: str
    form: Optional[FormModel] = None
    workflow_instance_id: str
    condition_id: str
    condition: RuleGroupModel

    @field_validator("status", mode="after")
    @classmethod
    def validate_status(cls, status: str) -> str:
        if status in [
            WorkflowStatusEnum.ACTIVE,
            WorkflowStatusEnum.CANCELLED,
            WorkflowStatusEnum.COMPLETED,
        ]:
            return status

        raise ValueError(f"Invalid step status: {status}")

    @field_validator("data", mode="after")
    @classmethod
    def validate_data(cls, data: Optional[str]) -> Optional[str]:
        # TODO: Add more answer validation once format is figured out

        if data is not None:
            try:
                json.loads(data)
            except JSONDecodeError:
                raise ValueError("data must be valid JSON")

        return data

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.start_date:
            raise ValueError("last_edited cannot be before start_date")

        if self.completion_date is not None and self.completion_date < self.start_date:
            raise ValueError("completion_date cannot be before start_date")

        if (
            self.expected_completion is not None
            and self.expected_completion < self.start_date
        ):
            raise ValueError("expected_completion cannot be before start_date")

        return self


class WorkflowInstanceStepUploadModel(WorkflowInstanceStepModel):
    id: Optional[str] = None
