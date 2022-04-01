from typing import Optional, Type

from data.crud import M
from models import Form, FormTemplate, QRelationalEnum, QuestionTypeEnum
from validation.validate import required_keys_present, values_correct_type


def validate_mc_options(q: dict) -> Optional[str]:
    """
    Returns an error if the mcOptions is invalid.
    Else, returns None.

    :param q: the parent dict for mcOptions

    valid example:
    [
        "opt1",
        "opt2",
        ... (maximum 5 answers)
    ]
    """
    target = "mcOptions"

    if not target in q:
        return None
    if target in q and q.get(target) is None:
        # avoid case "mcOptions": null
        return f"Can not provide key={target} with null value"

    error = values_correct_type(q, [target], list)
    if error:
        return error

    mcopts = q[target]
    if len(mcopts) > 5:
        return "Number of multiple choices provided exceed maximum 5"
    for opt in mcopts:
        if not isinstance(opt, str):
            return "multiple choice type is not string type"


def validate_answers(q: dict) -> Optional[str]:
    """
    Returns an error if the answer is invalid.
    Else, returns None.

    :param q: the parent dict for answers

    valid example (all fields, in real case only present part of it):
    {
        "number": 5/5.0,
        "text": "a",
        "textArray":["opt1","opt2"],
        "comment": "other opt"
    }
    """
    target = "answers"

    if q.get(target) is None:
        # avoid case "answers": null
        return f"Can not provide key={target} with null value"

    error = values_correct_type(q, [target], dict)
    if error:
        return error

    ans = q[target]
    all_fields = {"number", "text", "textArray", "comment"}
    for key in ans:
        if key not in all_fields:
            return "The key '" + key + "' is not a valid field or is set server-side"

    error = values_correct_type(ans, ["number"], int)
    if error:
        return error

    if "number" in ans and ans.get("number") is not None:
        if not isinstance(ans["number"], int) and not isinstance(ans["number"], float):
            return "Answers - number type must be int/float"

    error = values_correct_type(ans, ["textArray"], list)
    if error:
        return error
    if "textArray" in ans and ans.get("textArray") is not None:
        for opt in ans["textArray"]:
            if not isinstance(opt, str):
                return "answers - textArray option is not string type"

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
                "number": 5
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
        error = validate_answers(cond)
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
        "questionIndex",
        "questionText",
        "questionType",
        "answers",
    ]

    all_fields = [
        "questionId",
        "isBlank",
        "category",
        "hasCommentAttached",
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

    error = values_correct_type(q, ["isBlank", "hasCommentAttached", "required"], bool)
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
    error = validate_answers(q)
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

    error = validate_answers(["answers"])
    if error:
        return error
