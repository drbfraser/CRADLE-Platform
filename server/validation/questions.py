from typing import Optional, Type

from data.crud import M
from models import Form, FormTemplate, QRelationalEnum, QuestionTypeEnum
from validation.validate import required_keys_present, values_correct_type


def validate_mc_options(q: dict) -> Optional[str]:
    """
    Returns an error if the mcOptions is invalid (Empty is valid).
    Else, returns None.

    :param q: the parent dict for mcOptions

    valid example:
    [
        {
            "mcid": 1,
            "opt": "a little"
        }... (maximum 5)
    ]
    """
    target = "mcOptions"

    error = values_correct_type(q, [target], list)
    if error:
        return error

    if target in q and q.get(target) is not None:
        mcopts = q[target]
        if len(mcopts) > 5:
            return "Number of multiple choices provided exceed maximum 5"
        for opt in mcopts:
            record_keys = ["mcid", "opt"]
            for k in opt:
                if k not in record_keys:
                    return f"{k} is not a valid key in the mc_option cell."
                else:
                    record_keys.remove(k)

                if len(record_keys) > 0:
                    return f"There are missing fields for the mc_option cell."

            error = values_correct_type(opt, ["mcid"], int)
            if error:
                return error


def validate_answer(q: dict) -> Optional[str]:
    """
    Returns an error if the answer is invalid (Empty is valid).
    Else, returns None.

    :param q: the parent dict for answers

    valid example (all fields, in real case only present part of it):
    {
        "value": 5,
        "text": "a",
        "mc": [
            1,2
        ],
        "comment": "other opt"
    }
    """
    target = "answers"

    error = values_correct_type(q, [target], dict)
    if error:
        return error

    if (not target in q) or q.get(target) is None:
        # empty answers is valid case
        return None

    ans = q[target]
    all_fields = {"value", "text", "mc", "comment"}
    for key in ans:
        if key not in all_fields:
            return "The key '" + key + "' is not a valid field or is set server-side"

    error = values_correct_type(ans, ["value"], int)
    if error:
        return error

    error = values_correct_type(ans, ["mc"], list)
    if error:
        return error

    error = values_correct_type(ans, ["text", "comment"], str)
    if error:
        return error


def validate_visible_condition(q: dict) -> Optional[str]:
    """
    Returns an error if the visible condition is invalid
    (Empty is valid). Else, returns None.

    :param q: the parent dict for visible condition

    valid example:
    [
        {
            "qid": "asdsd-123214214",
            "relation": "EQUAL_TO",
            "answers": {
                "value": 5
            }
        },...
    ]
    """
    target = "visibleCondition"

    error = values_correct_type(q, [target], list)
    if error:
        return error

    if (not target in q) or q.get(target) is None:
        # empty visible condition is valid case
        return None

    vc = q[target]
    for cond in vc:
        record_keys = ["qid", "relation", "answers"]
        for k in cond:
            if k not in record_keys:
                return f"{k} is not a valid key in visible condition dict."
            else:
                record_keys.remove(k)

        if len(record_keys) > 0:
            return f"There are missing fields for the visible condition dict."

        error = values_correct_type(cond, ["qid"], str)
        if error:
            return error

        error = values_correct_type(cond, ["relation"], QRelationalEnum)
        if error:
            return error

        # validate answer part in visible condition
        error = validate_answer(cond)
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
        # the form template question should provide a form template id    
        if (not "formTemplateId" in q) and q.get("formTemplateId") is None:
            return "Form template questions should have a template reference"
    else:
        if model is FormTemplate:
            return "Form template questions should be blank"
        # the form question shouldn't provide a form template id
        if "formTemplateId" in q and q["formTemplateId"] is not None:
            return "Form questions shouldn't have a form template reference"
        # the form question should provide a form id
        if (not "formId" in q) and q.get("formId") is None:
            return "Form questions should have a form reference"


def validate_question_post(q: dict, model: Type[M]) -> Optional[str]:
    """
    Returns an error message if the question dict is not valid when making form or
    template post request. Else, returns None.

    :param q: question as a dict object

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    required_fields = [
        "id",
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
        ],
        int,
    )
    if error:
        return error

    error = values_correct_type(
        q,
        [
            "id",
            "questionId",
            "questionText",
            "category",
            "units",
            "formId",
            "formTemplateId",
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

    # validate mcOptions
    error = validate_mc_options(q)
    if error:
        return error

    # validate answer
    error = validate_answer(q)
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

    error = values_correct_type(q, ["id"], str)
    if error:
        return error

    error = validate_answer(q["answers"])
    if error:
        return error
