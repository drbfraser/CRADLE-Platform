import json
import re
import time
import uuid
from typing import Any

import phonenumbers
from flask import abort

from common.constants import EMAIL_REGEX_PATTERN

# from server.enums import QRelationalEnum, QuestionTypeEnum
from enums import QRelationalEnum, QuestionTypeEnum


def parseCondition(parentQuestion: dict, conditionText: str) -> dict:
    """
    Returns a condition based on the parent question and the conditionText

    :param parentQuestion: The question the conditionText should be compared against
    :param conditionText: The text to be compared to the value of the parent question

    :return: Condition dictionary with the parent question ID and a valid answers object
    """

    def mc_optionsToDict(mc_options):
        return {option["opt"].casefold(): option["mc_id"] for option in mc_options}

    condition: dict[str, Any] = {
        "question_index": parentQuestion["question_index"],
        "relation": QRelationalEnum.EQUAL_TO.value,
        "answers": {},
    }

    if parentQuestion["question_type"] == QuestionTypeEnum.CATEGORY:
        raise RuntimeError("Question visibility cannot depend on a category")

    if parentQuestion["question_type"] in [
        QuestionTypeEnum.MULTIPLE_CHOICE.value,
        QuestionTypeEnum.MULTIPLE_SELECT.value,
    ]:
        options = [option.strip().casefold() for option in conditionText.split(",")]

        previousQuestionOptions = mc_optionsToDict(
            parentQuestion["lang_versions"][0]["mc_options"],
        )

        condition["answers"]["mc_id_array"] = []
        for option in options:
            if option not in previousQuestionOptions:
                raise RuntimeError("Invalid option for visibility.")

            condition["answers"]["mc_id_array"].append(previousQuestionOptions[option])

    elif parentQuestion["question_type"] == QuestionTypeEnum.INTEGER.value:
        try:
            condition["answers"]["number"] = int(conditionText)
        except ValueError:
            raise RuntimeError("Invalid condition for parent question of type Integer")

    elif parentQuestion["question_type"] == QuestionTypeEnum.DECIMAL.value:
        try:
            condition["answers"]["number"] = float(conditionText)
        except ValueError:
            raise RuntimeError("Invalid condition for parent question of type Integer")

    else:
        condition["answers"]["text"] = int(conditionText)

    return condition


def filterNestedAttributeWithValueNone(payload: dict) -> dict:
    """
    Returns dict with all the nested key-value pairs wherein the value is not None

    :param payload: The dictionary to evaluate
    """
    updated_data = {}
    for k in payload:
        v = payload[k]
        if type(v) is list:
            updated_list = []
            for item in v:
                if isinstance(item, dict):
                    updated_list_item = filterNestedAttributeWithValueNone(item)
                    if len(updated_list_item) != 0:
                        updated_list.append(updated_list_item)
                elif item is not None:
                    updated_list.append(item)

            updated_data[k] = updated_list
        elif v is not None:
            updated_data[k] = v

    return updated_data


def is_valid_email_format(email: str) -> bool:
    return re.fullmatch(EMAIL_REGEX_PATTERN, email) is not None


def format_phone_number(phone_number: str):
    try:
        parsed_phone_number = phonenumbers.parse(phone_number)
        if not phonenumbers.is_possible_number(parsed_phone_number):
            raise ValueError(f"Phone number ({phone_number}) is invalid.")
    except phonenumbers.NumberParseException:
        raise ValueError(f"Phone number ({phone_number}) is invalid.")
    else:
        return phonenumbers.format_number(
            parsed_phone_number, phonenumbers.PhoneNumberFormat.E164
        )


def to_lowercase(string: str) -> str:
    return string.lower()


def to_uppercase(string: str) -> str:
    return string.upper()


def to_titlecase(string: str) -> str:
    return string.title()


# returns formatted current time in utc timezone
def get_current_time():
    return int(time.time())


def get_uuid():
    return str(uuid.uuid4())


# use this to replace json.dumps if you want the different
# language words in json string still to be visible in
# database rather than unicode format
def dumps(obj):
    return json.dumps(obj, ensure_ascii=False)


def filterPairsWithNone(payload: dict) -> dict:
    """
    Returns dict with all the key-value pairs wherein the value is not None

    :param payload: The dictionary to evaluate
    """
    updated_data = {k: v for k, v in payload.items() if v is not None}

    return updated_data


def hex2bytes(key):
    return bytes.fromhex(key)


def bytes2hex(key: bytes):
    return key.hex()


# NOTE: May be better in api_utils.py, but currently causes circular import
#       error because api_utils imports user_utils
def abort_not_found(message: str):
    """
    Abort the request with a 404 Not Found error and a message.
    """
    abort(404, description=message)
