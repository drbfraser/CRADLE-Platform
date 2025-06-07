"""
The ``api.util`` module contains utility functions to help extract useful information
from requests.
"""

from __future__ import annotations

import csv
import json
import os
from typing import TYPE_CHECKING, Any, Type

from flask import Request

import utils
from common.constants import (
    FORM_TEMPLATE_LANGUAGES_COL,
    FORM_TEMPLATE_LANGUAGES_ROW,
    FORM_TEMPLATE_NAME_COL,
    FORM_TEMPLATE_NAME_ROW,
    FORM_TEMPLATE_QUESTION_ID_COL,
    FORM_TEMPLATE_QUESTION_LINE_COUNT_COL,
    FORM_TEMPLATE_QUESTION_MAX_VALUE_COL,
    FORM_TEMPLATE_QUESTION_MIN_VALUE_COL,
    FORM_TEMPLATE_QUESTION_OPTIONS_COL,
    FORM_TEMPLATE_QUESTION_REQUIRED_COL,
    FORM_TEMPLATE_QUESTION_TEXT_COL,
    FORM_TEMPLATE_QUESTION_TYPE_COL,
    FORM_TEMPLATE_QUESTION_UNITS_COL,
    FORM_TEMPLATE_QUESTION_VISIBILITY_CONDITION_COL,
    FORM_TEMPLATE_ROW_LENGTH,
    FORM_TEMPLATE_VERSION_COL,
    FORM_TEMPLATE_VERSION_ROW,
)
from data import crud, marshal
from enums import QRelationalEnum, QuestionTypeEnum
from models import (
    FormClassificationOrm,
    FormOrm,
    FormTemplateOrm,
    QuestionOrm,
    UserOrm,
    UserPhoneNumberOrm,
)

if TYPE_CHECKING:
    from collections.abc import Iterable

    from data.crud import M

duration = os.environ.get("SMS_KEY_DURATION")

if duration:
    duration = int(duration)
else:
    duration = 40

SMS_KEY_DURATION = duration


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


def filterPairsWithNone(payload: dict) -> dict:
    """
    Returns dict with all the key-value pairs wherein the value is not None

    :param payload: The dictionary to evaluate
    """
    updated_data = {k: v for k, v in payload.items() if v is not None}

    return updated_data


def getDictionaryOfUserInfo(id: int) -> dict:
    """
    Takes in an id and returns all of the information about a user from the users table
    and from the supervises table

    :param id: The user's id
    """
    user = crud.read(UserOrm, id=id)
    user_dict = marshal.marshal(user)

    # The vhtlist has to be marshalled manually
    vht_list = []
    for user in user.vht_list:
        vht_list.append(user.id)
    user_dict["supervises"] = vht_list

    user_dict.pop("password")

    # Add user's phone numbers to the dictionary
    user_dict["phone_numbers"] = [
        phone_number.phone_number for phone_number in user.phone_numbers
    ]

    return user_dict


def doesUserExist(id: int) -> bool:
    """
    Takes in id of the user and does a read to see if this user exists or not.
    :param id: The user's id

    """
    user = crud.read(UserOrm, id=id)
    if user is None:
        return False
    return True


# def assign_form_or_template_ids(model: Type[M], req: dict) -> None:
#     """
#     Assign form id if not provided.
#     Assign question id and form_id or form_template_id.
#     Assign lang version question_id.
#     Therefore, we can create the form or template one time.
#     """
#     if req.get("classification") is not None:
#         if req["classification"].get("id") is None:
#             req["classification"]["id"] = utils.get_uuid()
#         if req.get("form_classification_id") is None:
#             req["form_classification_id"] = req["classification"].get("id")
#
#     # assign form id if not provided.
#     if req.get("id") is None:
#         req["id"] = utils.get_uuid()
#
#     id = req["id"]
#
#     if model is FormClassificationOrm:
#         return
#
#     # assign question id and form_id or form_template_id.
#     # assign lang version question_id.
#     for question in req["questions"]:
#         question["id"] = utils.get_uuid()
#
#         if model is FormOrm:
#             question["form_id"] = id
#         elif model is FormTemplateOrm:
#             question["form_template_id"] = id
#
#         if question.get("lang_versions") is not None:
#             for version in question.get("lang_versions"):
#                 version["question_id"] = question["id"]
#
#
# def parseCondition(parentQuestion: dict, conditionText: str) -> dict:
#     """
#     Returns a condition based on the parent question and the conditionText
#
#     :param parentQuestion: The question the conditionText should be compared against
#     :param conditionText: The text to be compared to the value of the parent question
#
#     :return: Condition dictionary with the parent question ID and a valid answers object
#     """
#
#     def mc_optionsToDict(mc_options):
#         return {option["opt"].casefold(): option["mc_id"] for option in mc_options}
#
#     condition: dict[str, Any] = {
#         "question_index": parentQuestion["question_index"],
#         "relation": QRelationalEnum.EQUAL_TO.value,
#         "answers": {},
#     }
#
#     if parentQuestion["question_type"] == QuestionTypeEnum.CATEGORY:
#         raise RuntimeError("Question visibility cannot depend on a category")
#
#     if parentQuestion["question_type"] in [
#         QuestionTypeEnum.MULTIPLE_CHOICE.value,
#         QuestionTypeEnum.MULTIPLE_SELECT.value,
#     ]:
#         options = [option.strip().casefold() for option in conditionText.split(",")]
#
#         previousQuestionOptions = mc_optionsToDict(
#             parentQuestion["lang_versions"][0]["mc_options"],
#         )
#
#         condition["answers"]["mc_id_array"] = []
#         for option in options:
#             if option not in previousQuestionOptions:
#                 raise RuntimeError("Invalid option for visibility.")
#
#             condition["answers"]["mc_id_array"].append(previousQuestionOptions[option])
#
#     elif parentQuestion["question_type"] == QuestionTypeEnum.INTEGER.value:
#         try:
#             condition["answers"]["number"] = int(conditionText)
#         except ValueError:
#             raise RuntimeError("Invalid condition for parent question of type Integer")
#
#     elif parentQuestion["question_type"] == QuestionTypeEnum.DECIMAL.value:
#         try:
#             condition["answers"]["number"] = float(conditionText)
#         except ValueError:
#             raise RuntimeError("Invalid condition for parent question of type Integer")
#
#     else:
#         condition["answers"]["text"] = int(conditionText)
#
#     return condition
#
#
# def getFormTemplateDictFromCSV(csvData: str):
#     """
#     Returns a dictionary of form templates from a CSV file.
#     """
#
#     # Helper functions
#     def isRowEmpty(row: Iterable) -> bool:
#         return all(map(lambda val: val == "", row))
#
#     def isQuestionRequired(required: str) -> bool:
#         return len(required) > 0 and required.upper()[0] == "Y"
#
#     def toNumberOrNone(strVal: str) -> int | float | None:
#         if strVal == "":
#             return None
#
#         return float(strVal) if "." in strVal else int(strVal)
#
#     def toMcOptions(strVal: str) -> list[dict[str, int | str]]:
#         return [
#             {"mc_id": index, "opt": opt.strip()}
#             for index, opt in enumerate(strVal.split(","))
#             if len(opt.strip()) > 0
#         ]
#
#     def getQuestionLanguageVersionFromRow(row: list) -> dict:
#         return {
#             "question_text": row[FORM_TEMPLATE_QUESTION_TEXT_COL],
#             "mc_options": toMcOptions(row[FORM_TEMPLATE_QUESTION_OPTIONS_COL]),
#             "lang": row[FORM_TEMPLATE_LANGUAGES_COL].strip(),
#         }
#
#     def findCategoryIndex(
#         categoryList: list[dict[str, Any]],
#         categoryText: str,
#     ) -> int | None:
#         for category in categoryList:
#             for languageVersion in category["lang_versions"]:
#                 if languageVersion["question_text"] == categoryText:
#                     return category["question_index"]
#
#         return None
#
#     result: dict = dict()
#
#     csv_reader = csv.reader(csvData.splitlines())
#     rows = []
#
#     for index, row in enumerate(csv_reader):
#         if len(row) != FORM_TEMPLATE_ROW_LENGTH:
#             raise RuntimeError(
#                 f"All Rows must have {FORM_TEMPLATE_ROW_LENGTH} columns. Row {index} has {len(row)} columns.",
#             )
#
#         rows.append(row)
#
#     languages = [
#         language.strip()
#         for language in rows[FORM_TEMPLATE_LANGUAGES_ROW][
#             FORM_TEMPLATE_LANGUAGES_COL
#         ].split(",")
#     ]
#
#     result["classification"] = {
#         "name": rows[FORM_TEMPLATE_NAME_ROW][FORM_TEMPLATE_NAME_COL],
#     }
#     result["version"] = rows[FORM_TEMPLATE_VERSION_ROW][FORM_TEMPLATE_VERSION_COL]
#     result["questions"] = []
#
#     categoryIndex = None
#     categoryList: list[dict[str, Any]] = []
#
#     questionRows = iter(rows[4:])
#     question_index = 0
#
#     for row in questionRows:
#         if isRowEmpty(row):
#             categoryIndex = None
#             continue
#
#         type = str(row[FORM_TEMPLATE_QUESTION_TYPE_COL]).upper()
#
#         if type not in QuestionTypeEnum.listNames():
#             raise RuntimeError("Invalid Question Type Encountered")
#
#         visibilityConditionsText = str.strip(
#             row[FORM_TEMPLATE_QUESTION_VISIBILITY_CONDITION_COL],
#         )
#
#         visibilityConditions: list = []
#
#         if len(visibilityConditionsText) > 0:
#             if question_index == 0:
#                 raise RuntimeError(
#                     "First questions cannot have a visibility condition.",
#                 )
#
#             previousQuestion = result["questions"][question_index - 1]
#
#             visibilityConditions.append(
#                 parseCondition(previousQuestion, visibilityConditionsText),
#             )
#
#         question = {
#             "question_id": row[FORM_TEMPLATE_QUESTION_ID_COL],
#             "question_index": question_index,
#             "question_type": QuestionTypeEnum[type].value,
#             "lang_versions": [],
#             "required": isQuestionRequired(row[FORM_TEMPLATE_QUESTION_REQUIRED_COL]),
#             "num_max": toNumberOrNone(row[FORM_TEMPLATE_QUESTION_MAX_VALUE_COL]),
#             "num_min": toNumberOrNone(row[FORM_TEMPLATE_QUESTION_MIN_VALUE_COL]),
#             "string_max_length": toNumberOrNone(
#                 row[FORM_TEMPLATE_QUESTION_LINE_COUNT_COL],
#             ),
#             "units": row[FORM_TEMPLATE_QUESTION_UNITS_COL],
#             "visible_condition": visibilityConditions,
#             "category_index": categoryIndex,
#         }
#
#         questionLangVersion = getQuestionLanguageVersionFromRow(row)
#
#         if type == "CATEGORY":
#             existingCategoryIndex = findCategoryIndex(
#                 categoryList=categoryList,
#                 categoryText=questionLangVersion["question_text"],
#             )
#
#             if existingCategoryIndex is not None:
#                 categoryIndex = existingCategoryIndex
#                 continue
#
#         question_lang_versions = dict(
#             [(questionLangVersion["lang"], questionLangVersion)],
#         )
#
#         for _ in range(len(languages) - 1):
#             row = next(questionRows, None)
#
#             if row is None or isRowEmpty(row):
#                 raise RuntimeError(
#                     "All Questions must be provided in all the languages supported by the form",
#                 )
#
#             questionLangVersion = getQuestionLanguageVersionFromRow(row)
#             language: str = questionLangVersion["lang"]
#
#             if language not in languages:
#                 raise RuntimeError(
#                     "Language {} for question #{} not listed in Form Languages [{}].".format(
#                         language,
#                         question_index + 1,
#                         str.join(", ", languages),
#                     ),
#                 )
#
#             if language in question_lang_versions:
#                 raise RuntimeError(
#                     f"Language {language} defined multiple times for question #{question_index + 1}",
#                 )
#
#             question_lang_versions[language] = getQuestionLanguageVersionFromRow(row)
#
#         question["lang_versions"] = list(question_lang_versions.values())
#
#         if type == "CATEGORY":
#             categoryList.append(question)
#             categoryIndex = question_index
#
#         result["questions"].append(question)
#         question_index += 1
#
#     return result
#
#
# def getCsvFromFormTemplate(form_template: FormTemplateOrm):
#     """
#     Returns a CSV string from a FormTemplate object.
#     """
#
#     # Helper functions
#     def get_question_lang_list(question: QuestionOrm):
#         lang_list = []
#         for lang in question.lang_versions:
#             lang_list.append(lang.lang)
#         return lang_list
#
#     def list_to_csv(rows: list):
#         csv_str = ""
#
#         def format_cell(cell: str):
#             return '"{}"'.format(cell if cell is not None else "")
#
#         for row in rows:
#             row = [format_cell(cell) for cell in row]
#
#             csv_str += ",".join(row)
#             csv_str += "\n"
#
#         return csv_str
#
#     def mcoptions_to_str(mcoptions: str):
#         mcoptions = json.loads(mcoptions)
#         options = [option["opt"] for option in mcoptions]
#
#         return ",".join(options) if mcoptions is not None else ""
#
#     def get_visible_condition_options(
#         visible_condition: str,
#         questions: list[QuestionOrm],
#     ):
#         visible_conditions = json.loads(visible_condition)
#
#         if visible_conditions is None or len(visible_conditions) == 0:
#             return ""
#
#         visible_condition = visible_conditions[0]
#         parent_question_id = visible_condition["question_index"]
#         parent_question = questions[parent_question_id]
#
#         if parent_question is None:
#             return ""
#
#         mc_options = json.loads(parent_question.lang_versions[0].mc_options)
#
#         optionIndices = visible_condition["answers"]["mc_id_array"]
#
#         options = [mc_options[i]["opt"] for i in optionIndices]
#
#         return ",".join(options) if visible_condition is not None else ""
#
#     questions: list[QuestionOrm] = form_template.questions
#
#     questions = sorted(questions, key=lambda q: q.question_index)
#
#     rows = [
#         [
#             "Name",
#             form_template.classification.name,
#             "Languages",
#             ",".join(get_question_lang_list(questions[0])),
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#         ],
#         [
#             "Version",
#             form_template.version,
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#         ],
#         [
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#             "Integer/Decimal only",
#             "",
#             "String Only",
#             "MC Only",
#         ],
#         [
#             "Question ID",
#             "Question Text",
#             "Type",
#             "Language",
#             "Required",
#             "Units",
#             "Visible If",
#             "Min",
#             "Max",
#             "# Lines",
#             "Options",
#         ],
#         [
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#             "",
#         ],
#     ]
#
#     for question in questions:
#         row = [
#             question.form_template_id,
#             question.lang_versions[0].question_text,
#             question.question_type.value,
#             question.lang_versions[0].lang,
#             "Y" if question.required else "N",
#             question.units,
#             get_visible_condition_options(
#                 question.visible_condition,
#                 questions=questions,
#             ),
#             question.num_min,
#             question.num_max,
#             question.string_max_length,
#             mcoptions_to_str(question.lang_versions[0].mc_options),
#         ]
#         rows.append(row)
#
#         for lang in question.lang_versions[1:]:
#             row = [
#                 "",
#                 lang.question_text,
#                 "",
#                 lang.lang,
#                 "",
#                 "",
#                 "",
#                 "",
#                 "",
#                 "",
#                 mcoptions_to_str(lang.mc_options),
#             ]
#             rows.append(row)
#
#     return list_to_csv(rows)


# Check if the phone number is already in the database - if user_id is supplied the phone number should belong to that user
def phoneNumber_exists(phone_number, user_id=-1):
    existing_phone_number = None
    if user_id == -1:
        existing_phone_number = crud.read(UserPhoneNumberOrm, phone_number=phone_number)
    else:
        existing_phone_number = crud.read(
            UserPhoneNumberOrm,
            phone_number=phone_number,
            user_id=user_id,
        )
    return existing_phone_number is not None


def get_all_phoneNumbers_for_user(user_id):
    phone_numbers = crud.read_all(UserPhoneNumberOrm, user_id=user_id)
    numbers = [phone_number.phone_number for phone_number in phone_numbers]
    return numbers


def get_user_from_phone_number(phone_number):
    phone_number_object = crud.read(UserPhoneNumberOrm, phone_number=phone_number)
    if phone_number_object:
        user = crud.read(UserOrm, id=phone_number_object.user_id)
        return user
    return None


# Add new_phone_number to the list of numbers of the user with user_id.
def add_new_phoneNumber_for_user(new_phone_number, user_id):
    # check to see if the phone number is already in the database for any user
    if phoneNumber_exists(new_phone_number):
        return False

    user = crud.read(UserOrm, id=user_id)
    crud.create(UserPhoneNumberOrm(phone_number=new_phone_number, user=user))

    return True


# Delete phone_number from the list of phone numbers of user with user_id if the number belongs to them
def delete_user_phoneNumber(phone_number, user_id):
    if phoneNumber_exists(phone_number, user_id):
        crud.delete_by(UserPhoneNumberOrm, phone_number=phone_number, user_id=user_id)
        return True
    return False


# Replaces current_phone_number to new_phone_number for user_id if current_phone_number belongs to the user and new_phone_number does not belong to anyone
def replace_phoneNumber_for_user(current_phone_number, new_phone_number, user_id):
    # Check to see if current_phone_number belongs to user_id and if new_phone_number belongs to anyone
    if (phoneNumber_exists(current_phone_number, user_id)) and (
        not phoneNumber_exists(new_phone_number)
    ):
        crud.update(
            UserPhoneNumberOrm,
            {"phone_number": new_phone_number},
            phone_number=current_phone_number,
            user_id=user_id,
        )
        return True
    return False


def get_user_roles(user_id):
    user_orm = crud.read(UserOrm, id=user_id)
    if user_orm is None:
        raise ValueError(f"No user with id ({user_id}) was found.")
    return user_orm.role


def hex2bytes(key):
    return bytes.fromhex(key)


def bytes2hex(key: bytes):
    return key.hex()


def validate_user(user_id):
    if not user_id:
        return {"message": "must provide an id"}, 400
    # check if user exists
    if not doesUserExist(user_id):
        return {"message": "There is no user with this id"}, 404
    return None
