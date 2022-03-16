from typing import Optional
from validation.validate import required_keys_present, values_correct_type
import json


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


def validate_question_post(q: dict) -> Optional[str]:
    """
    Returns an error message if the question dict is not valid when making form post
    request. Else, returns None.

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
        q, ["questionIndex", "numMin", "numMax", "stringMaxLength"], int
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
