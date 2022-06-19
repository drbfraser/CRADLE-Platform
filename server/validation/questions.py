from typing import Optional

import data.crud as crud
from models import QRelationalEnum, QuestionTypeEnum
from validation.validate import (
    check_invalid_keys_present,
    required_keys_present,
    force_consistent_keys,
    values_correct_type,
)


def check_target_not_null(target, q: dict) -> Optional[str]:
    """
    Returns an error if the target key has value null.
    Else, returns None.
    """
    if target in q and q.get(target) is None:
        return f"Can not provide key={target} with null value"
    return None


def validate_mc_options(q: dict) -> Optional[str]:
    """
    Returns an error if the mcOptions is invalid.
    Else, returns None.

    :param q: the parent dict for mcOptions

    valid example:
    [
        {
            "mcid": 0,
            "opt": "abcd"
        },
        ... (maximum 5 answers)
    ]
    """
    target = "mcOptions"

    if not target in q:
        return None

    error = check_target_not_null(target, q)
    if error:
        return error

    error = values_correct_type(q, [target], list)
    if error:
        return error

    mcopts = q[target]
    
    force_fields = ["mcid", "opt"]
    for opt in mcopts:
        error_message = force_consistent_keys(opt, force_fields)
        if error_message:
            return error_message


def validate_answers(q: dict) -> Optional[str]:
    """
    Returns an error if the answer is invalid.
    Else, returns None.

    :param q: the parent dict for answers

    valid example (all fields, in real case only present one part of it):
    {
        "number": 5/5.0,
        "text": "a",
        "mcidArray":[0,1],
        "comment": "other opt"
    }
    """
    target = "answers"

    if not target in q:
        return None

    error = check_target_not_null(target, q)
    if error:
        return error

    error = values_correct_type(q, [target], dict)
    if error:
        return error

    ans = q[target]
    all_fields = {"number", "text", "mcidArray", "comment"}
    error = check_invalid_keys_present(ans, all_fields)
    if error:
        return error

    if "number" in ans and ans.get("number") is not None:
        if not isinstance(ans["number"], int) and not isinstance(ans["number"], float):
            return "Answers - number type must be int or float"

    # check mcidArray
    error = values_correct_type(ans, ["mcidArray"], list)
    if error:
        return error
    if "mcidArray" in ans and ans.get("mcidArray") is not None:
        for opt in ans["mcidArray"]:
            if not isinstance(opt, int):
                return "answers - textArray option is not integer type"

    error = values_correct_type(ans, ["text", "comment"], str)
    if error:
        return error


def validate_visible_condition(q: dict) -> Optional[str]:
    """
    Returns an error if the visible condition is invalid
    . Else, returns None.

    :param q: the parent dict for visible condition

    valid example:
    [
        {
            "qidx": 1,
            "relation": "EQUAL_TO",
            "answers": {
                "number": 5
            }
        },...
    ]
    """
    target = "visibleCondition"

    if not target in q:
        return None

    error = check_target_not_null(target, q)
    if error:
        return error

    error = values_correct_type(q, [target], list)
    if error:
        return error

    vc = q[target]
    force_keys = ["qidx", "relation", "answers"]
    for cond in vc:
        error = force_consistent_keys(cond, force_keys)
        if error:
            return error

        error = values_correct_type(cond, ["qidx"], int)
        if error:
            return error

        error = values_correct_type(cond, ["relation"], QRelationalEnum)
        if error:
            return error

        error = validate_answers(cond)
        if error:
            return error


def validate_lang_versions(q: dict) -> Optional[str]:
    """
    Returns an error if the lang versions is invalid.
    Else, returns None.

    :param q: the parent dict for visible condition

    valid example:
    [
        {
           "lang": "English",
           "questionText": "How the patient's condition?",
            "mcOptions": [
                {
                    "mcid":0,
                    "opt": "Decent"
                }
            ],
        },

    ]
    """
    target = "questionLangVersions"

    if not target in q:
        return None

    error = check_target_not_null(target, q)
    if error:
        return error

    error = values_correct_type(q, [target], list)
    if error:
        return error

    lang_versions = q[target]
    required_keys = ["lang", "questionText"]
    all_keys = required_keys + ["mcOptions"]
    for version in lang_versions:
        error = required_keys_present(version, required_keys)
        if error:
            return error

        error = check_invalid_keys_present(version, all_keys)
        if error:
            return error

        error = values_correct_type(version, ["lang", "questionText"], str)
        if error:
            return error

        error = validate_mc_options(version)
        if error:
            return error


def validate_template_question_post(q: dict) -> Optional[str]:
    """
    Returns an error message if the question dict is not valid (after pre-process) when
    making template post request. Else, returns None.

    :param q: question as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    # for template questions, below fields are redundant fields so we remove them in
    # case they are provided by frontend, to skip validation to them
    non_required_fields = [
        "id",
        "isBlank",
        "questionText",
        "hasCommentAttached",
        "mcOptions",
        "answers",
        "formId",
        "formTemplateId",
    ]

    for key in non_required_fields:
        if key in q:
            del q[key]

    # pre-process the template question dict
    q["isBlank"] = True

    # validate fields
    required_fields = [
        "questionIndex",
        "questionType",
        "questionLangVersions",
    ]

    all_fields = [
        "isBlank",
        "questionId",
        "required",
        "units",
        "visibleCondition",
        "numMin",
        "numMax",
        "stringMaxLength",
        "categoryIndex",
    ] + required_fields

    error_message = None

    error_message = required_keys_present(q, required_fields)
    if error_message is not None:
        return error_message

    error_message = check_invalid_keys_present(q, all_fields)
    if error_message is not None:
        return error_message

    error = values_correct_type(q, ["required"], bool)
    if error:
        return error

    error = values_correct_type(
        q,
        [
            "questionIndex",
            "stringMaxLength",
            "categoryIndex",
        ],
        int,
    )
    if error:
        return error

    if q["questionIndex"] < 0:
        return "question should have non-negative index"

    if "numMin" in q and q.get("numMin") is not None:
        if not isinstance(q["numMin"], int) and not isinstance(q["numMin"], float):
            return "numMin type must be int or float"

    if "numMax" in q and q.get("numMax") is not None:
        if not isinstance(q["numMax"], int) and not isinstance(q["numMax"], float):
            return "numMax type must be int or float"

    error = values_correct_type(
        q,
        [
            "id",
            "questionId",
            "units",
        ],
        str,
    )
    if error:
        return error

    error = values_correct_type(q, ["questionType"], QuestionTypeEnum)
    if error:
        return error

    # validate visibleCondition
    error = validate_visible_condition(q)
    if error:
        return error

    # validate lang versions
    error = validate_lang_versions(q)
    if error:
        return error


def validate_form_question_post(q: dict) -> Optional[str]:
    """
    Returns an error message if the question dict is not valid (after pre-process) when
    making form post request. Else, returns None.

    :param q: question as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    # for form questions, below fields are redundant fields so we remove them in
    # case they are provided by frontend, to skip validation to them
    non_required_fields = [
        "id",
        "isBlank",
        "formId",
        "formTemplateId",
    ]

    for key in non_required_fields:
        if key in q:
            del q[key]

    # pre-process the form question dict
    q["isBlank"] = False

    # validate fields
    required_fields = [
        "questionIndex",
        "questionText",
        "questionType",
    ]

    all_fields = [
        "isBlank",
        "questionId",
        "hasCommentAttached",
        "required",
        "units",
        "visibleCondition",
        "mcOptions",
        "numMin",
        "numMax",
        "stringMaxLength",
        "categoryIndex",
        "answers",
    ] + required_fields

    error_message = None

    error_message = required_keys_present(q, required_fields)
    if error_message is not None:
        return error_message

    error_message = check_invalid_keys_present(q, all_fields)
    if error_message is not None:
        return error_message

    error = values_correct_type(q, ["required", "hasCommentAttached"], bool)
    if error:
        return error

    error = values_correct_type(
        q,
        [
            "questionIndex",
            "stringMaxLength",
            "categoryIndex",
        ],
        int,
    )
    if error:
        return error

    if "numMin" in q and q.get("numMin") is not None:
        if not isinstance(q["numMin"], int) and not isinstance(q["numMin"], float):
            return "numMin type must be int or float"

    if "numMax" in q and q.get("numMax") is not None:
        if not isinstance(q["numMax"], int) and not isinstance(q["numMax"], float):
            return "numMax type must be int or float"

    error = values_correct_type(
        q,
        [
            "id",
            "questionId",
            "questionText",
            "units",
        ],
        str,
    )

    error = values_correct_type(q, ["questionType"], QuestionTypeEnum)
    if error:
        return error

    # validate visibleCondition
    error = validate_visible_condition(q)
    if error:
        return error

    # validate mcOptions
    error = validate_mc_options(q)
    if error:
        return error

    # validate answers
    error = validate_answers(q)
    if error:
        return error


def validate_form_question_put(q: dict) -> Optional[str]:
    """
    Returns an error message if the question dict is not valid when making form put
    request. Else, returns None.

    :param q: question as a dict object

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    force_fields = ["id", "answers"]

    error_message = None

    error_message = force_consistent_keys(q, force_fields)
    if error_message is not None:
        return error_message

    error = values_correct_type(q, ["id"], str)
    if error:
        return error

    error = validate_answers(q)
    if error:
        return error
