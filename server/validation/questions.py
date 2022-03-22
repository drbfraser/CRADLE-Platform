from typing import Optional, Type
from data.crud import M
from models import Form, FormTemplate
from validation.validate import required_keys_present, values_correct_type


def validate_answer(ans: dict) -> Optional[str]:
    """
    Returns an error if the answer dict is invalid (Empty is valid).
    Else, returns None.
    """
    all_fields = {"Value", "Text", "MC", "Comment"}

    for key in ans:
        if key not in all_fields:
            return "The key '" + key + "' is not a valid field or is set server-side"

    error = values_correct_type(ans, ["Value"], int)
    if error:
        return error

    error = values_correct_type(ans, ["Text", "Comment"], str)
    if error:
        return error


def validate_reference(q: dict, model: Type[M]) -> Optional[str]:
    """
    Returns an error message id the question has a correct referrence. Else, returns None.
    """
    if "isBlank" in q and q["isBlank"]:
        if model is Form:
            return "Form questions shouldn't be blank"
        # the form template question shouldn't provide a form id
        if "formId" in q and q["formId"] is not None:
            return "Form template questions shouldn't have a form reference"
    else:
        if model is FormTemplate:
            return "Form template questions should be blank"
        # the form question shouldn't provide a form template id
        if "formTemplateId" in q and q["formTemplateId"] is not None:
            return "Form questions shouldn't have a form template reference"


def validate_question_post(q: dict, model: Type[M]) -> Optional[str]:
    """
    Returns an error message if the question dict is not valid when making form or
    template post request. Else, returns None.

    :param q: question as a dict object

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    required_fields = [
        "questionIndex",
        "questionId",
        "questionText",
        "questionType",
        "answers",
    ]

    all_fields = [
        "isBlank",
        "category",
        "required",
        "units",
        "visibleCondition",
        "mcOptions",
        "numMin",
        "numMax",
        "stringMaxLength",
        "formId",
        "formTemplateId",
    ] + required_fields

    error_message = None

    error_message = required_keys_present(q, required_fields)
    if error_message is not None:
        return error_message

    for key in q:
        if key not in all_fields:
            return "The key '" + key + "' is not a valid field or is set server-side"

    error = values_correct_type(q, ["isBlank", "required"], bool)
    if error:
        return error

    error = values_correct_type(
        q,
        [
            "questionIndex",
            "numMin",
            "numMax",
            "stringMaxLength",
            "formId",
            "formTemplateId",
        ],
        int,
    )
    if error:
        return error

    error = values_correct_type(
        q,
        [
            "questionId",
            "questionText",
            "questionType",
            "category",
            "units",
        ],
        str,
    )
    if error:
        return error

    error = values_correct_type(q, ["visibleCondition", "answers"], dict)
    if error:
        return error

    error = values_correct_type(q, ["mcOptions"], list)
    if error:
        return error

    # validate mcOptions, and answers
    if q.get("mcOptions") and len(q["mcOptions"]) > 5:
        return "Number of multiple choices provided exceed maximum 5"

    error = validate_answer(q["answers"])
    if error:
        return error

    # validate reference
    error = validate_reference(q, model)
    if error:
        return error


def validate_question_put(q: dict) -> Optional[str]:
    """
    Returns an error message if the question dict is not valid when making form put
    request. Else, returns None.

    :param q: question as a dict object

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    required_fields = ["id", "answers"]

    error_message = None

    error_message = required_keys_present(q, required_fields)
    if error_message is not None:
        return error_message

    error = values_correct_type(q, ["id"], int)
    if error:
        return error

    error = values_correct_type(q, ["answers"], dict)
    if error:
        return error

    error = validate_answer(q["answers"])
    if error:
        return error
