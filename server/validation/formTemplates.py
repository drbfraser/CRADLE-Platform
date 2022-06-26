from typing import Optional

from validation.validate import (
    check_invalid_keys_present,
    required_keys_present,
    values_correct_type,
)
from validation.questions import validate_template_question_post
from service import questionTree


def validate_template(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the template part in /api/forms/templates POST or PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    required_fields = ["name", "questions"]

    all_fields = [
        "id",
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

    error = validate_questions(request_body["questions"])
    if error:
        return error


def validate_questions(questions: list) -> Optional[str]:
    """
    Returns an error message if the questions part in /api/forms/templates POST or PUT
    request is not valid (json format, lang versions consistency, qindex constraint).
    Else, returns None.

    :param questions: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    lang_version_list, qindex = None, None
    for index, question in enumerate(questions):
        # # validate each question
        error = validate_template_question_post(question)
        if error:
            return error
        # validate:
        # lang versions consistency: all questions should have same kinds of versions
        # qindex constraint: question index in ascending order
        if index == 0:
            lang_version_list = [v.get("lang") for v in question.get("questionLangVersions")]
            lang_version_list.sort()

            qindex = question.get("questionIndex")
        else:
            tmp_lang_version_list = [
                v.get("lang") for v in question.get("questionLangVersions")
            ]
            tmp_lang_version_list.sort()
            if tmp_lang_version_list != lang_version_list:
                return "lang versions provided between questions are not consistent"

            cur_qindex = question.get("questionIndex")
            if qindex < cur_qindex:
                qindex = cur_qindex
            else:
                return "questions should be in index-ascending order"

    # validate question qindex tree dfs order
    error = questionTree.is_dfs_order(questions)
    if error:
        return error
    return None
