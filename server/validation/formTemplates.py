from typing import Optional

from models import FormTemplate
from validation.validate import (
    check_invalid_keys_present,
    required_keys_present,
    values_correct_type,
)
from validation.questions import validate_template_question_post


def validate_template(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the template part in /api/forms/templates POST or PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    required_fields = ["questions"]

    all_fields = [
        "id",
        "name",
        "category",
        "version",
    ] + required_fields

    error_message = None

    error_message = required_keys_present(request_body, required_fields)
    if error_message is not None:
        return error_message

    error_message = check_invalid_keys_present(request_body, all_fields)
    if error_message is not None:
        return error_message

    error = values_correct_type(
        request_body, ["id", "name", "category", "version"], str
    )
    if error:
        return error

    error = values_correct_type(request_body, ["questions"], list)
    if error:
        return error


def validate_questions(request_body: list) -> Optional[str]:
    """
    Returns an error message if the questions part in /api/forms/templates POST or PUT
    request is not valid (json format and lang versions consistency). Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    lang_version_list = None
    # validate each question
    for i, q in enumerate(request_body):
        error = validate_template_question_post(q)
        if error:
            return error
        if i == 0:
            lang_version_list = [v.get("lang") for v in q.get("QuestionLangVersions")]
            lang_version_list.sort()
        else:
            tmp_lang_version_list = [v.get("lang") for v in q.get("QuestionLangVersions")]
            tmp_lang_version_list.sort()
            # validate lang versions consistency
            if tmp_lang_version_list != lang_version_list:
                return "lang versions provided between questions are not consistent"
    
    return None
    

