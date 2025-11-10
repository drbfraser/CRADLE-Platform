from __future__ import annotations

import csv
import json
from typing import TYPE_CHECKING, Any, Type

import data.db_operations as crud
from common import commonUtil
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
from enums import QuestionTypeEnum
from models import (
    FormClassificationOrm,
    FormOrm,
    FormTemplateOrm,
    FormTemplateOrmV2,
    LangVersionOrmV2,
    QuestionOrm,
)

if TYPE_CHECKING:
    from collections.abc import Iterable

    from data.crud import M


def filter_template_questions_dict(form_template: dict):
    form_template["questions"] = [
        question
        for question in form_template["questions"]
        if question.get("form_id") is None
    ]
    return form_template


def filter_template_questions_orm(form_template_orm: FormTemplateOrm):
    """Filters a FormTemplateOrm object to only include blank questions."""
    form_template_orm.questions = [
        question for question in form_template_orm.questions if question.form_id is None
    ]
    return form_template_orm


def assign_form_or_template_ids(model: Type[M], req: dict) -> None:
    """
    Assign form id if not provided.
    Assign question id and form_id or form_template_id.
    Assign lang version question_id.
    Therefore, we can create the form or template one time.
    """
    if req.get("classification") is not None:
        if req["classification"].get("id") is None:
            req["classification"]["id"] = commonUtil.get_uuid()
        if req.get("form_classification_id") is None:
            req["form_classification_id"] = req["classification"].get("id")

    # assign form id if not provided.
    if req.get("id") is None:
        req["id"] = commonUtil.get_uuid()

    id = req["id"]

    if model is FormClassificationOrm:
        return

    # assign question id and form_id or form_template_id.
    # assign lang version question_id.
    for question in req["questions"]:
        question["id"] = commonUtil.get_uuid()

        if model is FormOrm:
            question["form_id"] = id
        elif model is FormTemplateOrm:
            question["form_template_id"] = id

        if question.get("lang_versions") is not None:
            for version in question.get("lang_versions"):
                version["question_id"] = question["id"]


def getFormTemplateDictFromCSV(csvData: str):
    """
    Returns a dictionary of form templates from a CSV file.
    """

    # Helper functions
    def isRowEmpty(row: Iterable) -> bool:
        return all(map(lambda val: val == "", row))

    def isQuestionRequired(required: str) -> bool:
        return len(required) > 0 and required.upper()[0] == "Y"

    def toNumberOrNone(strVal: str) -> int | float | None:
        if strVal == "":
            return None

        return float(strVal) if "." in strVal else int(strVal)

    def toMcOptions(strVal: str) -> list[dict[str, int | str]]:
        return [
            {"mc_id": index, "opt": opt.strip()}
            for index, opt in enumerate(strVal.split(","))
            if len(opt.strip()) > 0
        ]

    def getQuestionLanguageVersionFromRow(row: list) -> dict:
        return {
            "question_text": row[FORM_TEMPLATE_QUESTION_TEXT_COL],
            "mc_options": toMcOptions(row[FORM_TEMPLATE_QUESTION_OPTIONS_COL]),
            "lang": row[FORM_TEMPLATE_LANGUAGES_COL].strip(),
        }

    def findCategoryIndex(
        categoryList: list[dict[str, Any]],
        categoryText: str,
    ) -> int | None:
        for category in categoryList:
            for languageVersion in category["lang_versions"]:
                if languageVersion["question_text"] == categoryText:
                    return category["question_index"]

        return None

    result: dict = dict()

    csv_reader = csv.reader(csvData.splitlines())
    rows = []

    for index, row in enumerate(csv_reader):
        if len(row) != FORM_TEMPLATE_ROW_LENGTH:
            raise RuntimeError(
                f"All Rows must have {FORM_TEMPLATE_ROW_LENGTH} columns. Row {index} has {len(row)} columns.",
            )

        rows.append(row)

    languages = [
        language.strip()
        for language in rows[FORM_TEMPLATE_LANGUAGES_ROW][
            FORM_TEMPLATE_LANGUAGES_COL
        ].split(",")
    ]

    result["classification"] = {
        "name": rows[FORM_TEMPLATE_NAME_ROW][FORM_TEMPLATE_NAME_COL],
    }
    result["version"] = rows[FORM_TEMPLATE_VERSION_ROW][FORM_TEMPLATE_VERSION_COL]
    result["questions"] = []

    categoryIndex = None
    categoryList: list[dict[str, Any]] = []

    questionRows = iter(rows[4:])
    question_index = 0

    for row in questionRows:
        if isRowEmpty(row):
            categoryIndex = None
            continue

        type = str(row[FORM_TEMPLATE_QUESTION_TYPE_COL]).upper()

        if type not in QuestionTypeEnum.listNames():
            raise RuntimeError("Invalid Question Type Encountered")

        visibilityConditionsText = str.strip(
            row[FORM_TEMPLATE_QUESTION_VISIBILITY_CONDITION_COL],
        )

        visibilityConditions: list = []

        if len(visibilityConditionsText) > 0:
            if question_index == 0:
                raise RuntimeError(
                    "First questions cannot have a visibility condition.",
                )

            previousQuestion = result["questions"][question_index - 1]

            visibilityConditions.append(
                commonUtil.parseCondition(previousQuestion, visibilityConditionsText),
            )

        question = {
            "question_id": row[FORM_TEMPLATE_QUESTION_ID_COL],
            "question_index": question_index,
            "question_type": QuestionTypeEnum[type].value,
            "lang_versions": [],
            "required": isQuestionRequired(row[FORM_TEMPLATE_QUESTION_REQUIRED_COL]),
            "num_max": toNumberOrNone(row[FORM_TEMPLATE_QUESTION_MAX_VALUE_COL]),
            "num_min": toNumberOrNone(row[FORM_TEMPLATE_QUESTION_MIN_VALUE_COL]),
            "string_max_length": toNumberOrNone(
                row[FORM_TEMPLATE_QUESTION_LINE_COUNT_COL],
            ),
            "units": row[FORM_TEMPLATE_QUESTION_UNITS_COL],
            "visible_condition": visibilityConditions,
            "category_index": categoryIndex,
        }

        questionLangVersion = getQuestionLanguageVersionFromRow(row)

        if type == "CATEGORY":
            existingCategoryIndex = findCategoryIndex(
                categoryList=categoryList,
                categoryText=questionLangVersion["question_text"],
            )

            if existingCategoryIndex is not None:
                categoryIndex = existingCategoryIndex
                continue

        question_lang_versions = dict(
            [(questionLangVersion["lang"], questionLangVersion)],
        )

        for _ in range(len(languages) - 1):
            row = next(questionRows, None)

            if row is None or isRowEmpty(row):
                raise RuntimeError(
                    "All Questions must be provided in all the languages supported by the form",
                )

            questionLangVersion = getQuestionLanguageVersionFromRow(row)
            language: str = questionLangVersion["lang"]

            if language not in languages:
                raise RuntimeError(
                    "Language {} for question #{} not listed in Form Languages [{}].".format(
                        language,
                        question_index + 1,
                        str.join(", ", languages),
                    ),
                )

            if language in question_lang_versions:
                raise RuntimeError(
                    f"Language {language} defined multiple times for question #{question_index + 1}",
                )

            question_lang_versions[language] = getQuestionLanguageVersionFromRow(row)

        question["lang_versions"] = list(question_lang_versions.values())

        if type == "CATEGORY":
            categoryList.append(question)
            categoryIndex = question_index

        result["questions"].append(question)
        question_index += 1

    return result


def getCsvFromFormTemplate(form_template: FormTemplateOrm):
    """
    Returns a CSV string from a FormTemplate object.
    """

    # Helper functions
    def get_question_lang_list(question: QuestionOrm):
        lang_list = []
        for lang in question.lang_versions:
            lang_list.append(lang.lang)
        return lang_list

    def list_to_csv(rows: list):
        csv_str = ""

        def format_cell(cell: str):
            return '"{}"'.format(cell if cell is not None else "")

        for row in rows:
            row = [format_cell(cell) for cell in row]

            csv_str += ",".join(row)
            csv_str += "\n"

        return csv_str

    def mcoptions_to_str(mcoptions: str):
        mcoptions = json.loads(mcoptions)
        options = [option["opt"] for option in mcoptions]

        return ",".join(options) if mcoptions is not None else ""

    def get_visible_condition_options(
        visible_condition: str,
        questions: list[QuestionOrm],
    ):
        visible_conditions = json.loads(visible_condition)

        if visible_conditions is None or len(visible_conditions) == 0:
            return ""

        visible_condition = visible_conditions[0]
        parent_question_id = visible_condition["question_index"]
        parent_question = questions[parent_question_id]

        if parent_question is None:
            return ""

        mc_options = json.loads(parent_question.lang_versions[0].mc_options)

        optionIndices = visible_condition["answers"]["mc_id_array"]

        options = [mc_options[i]["opt"] for i in optionIndices]

        return ",".join(options) if visible_condition is not None else ""

    questions: list[QuestionOrm] = form_template.questions

    questions = sorted(questions, key=lambda q: q.question_index)

    rows = [
        [
            "Name",
            form_template.classification.name,
            "Languages",
            ",".join(get_question_lang_list(questions[0])),
            "",
            "",
            "",
            "",
            "",
            "",
            "",
        ],
        [
            "Version",
            form_template.version,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
        ],
        [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "Integer/Decimal only",
            "",
            "String Only",
            "MC Only",
        ],
        [
            "Question ID",
            "Question Text",
            "Type",
            "Language",
            "Required",
            "Units",
            "Visible If",
            "Min",
            "Max",
            "# Lines",
            "Options",
        ],
        [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
        ],
    ]

    for question in questions:
        row = [
            question.form_template_id,
            question.lang_versions[0].question_text,
            question.question_type.value,
            question.lang_versions[0].lang,
            "Y" if question.required else "N",
            question.units,
            get_visible_condition_options(
                question.visible_condition,
                questions=questions,
            ),
            question.num_min,
            question.num_max,
            question.string_max_length,
            mcoptions_to_str(question.lang_versions[0].mc_options),
        ]
        rows.append(row)

        for lang in question.lang_versions[1:]:
            row = [
                "",
                lang.question_text,
                "",
                lang.lang,
                "",
                "",
                "",
                "",
                "",
                "",
                mcoptions_to_str(lang.mc_options),
            ]
            rows.append(row)

    return list_to_csv(rows)


def getCsvFromFormTemplateV2(form_template: FormTemplateOrmV2) -> str:
    """
    Returns a CSV string for a FormTemplateOrmV2, including all language versions,
    multiple-choice options, and visible-if conditions.
    """

    def fmt(cell):
        return f'"{cell if cell is not None else ""}"'

    def list_to_csv(rows: list[list[str]]):
        return "\n".join([",".join(map(fmt, row)) for row in rows]) + "\n"

    def read_all_translations(string_id: str):
        """Return all LangVersionOrmV2 entries for a given string_id as a list."""
        return crud.read_all(LangVersionOrmV2, string_id=string_id) or []

    def get_mc_options_text(mc_options_json: str):
        """Return mapping of {lang: 'option1, option2, ...'} for all option translations."""
        if not mc_options_json:
            return {}

        try:
            option_ids = json.loads(mc_options_json)
        except Exception:
            return {}

        lang_map = {}
        for opt_id in option_ids:
            versions = read_all_translations(opt_id)
            for v in versions:
                lang_map.setdefault(v.lang, []).append(v.text)

        return {lang: ", ".join(texts) for lang, texts in lang_map.items()}

    def get_visible_if_text(visible_condition_json: str):
        """Return visible-if info, fallback to raw JSON."""
        try:
            conditions = json.loads(visible_condition_json)
            if not conditions:
                return ""
            return json.dumps(conditions, ensure_ascii=False)
        except Exception:
            return visible_condition_json or ""

    def get_all_languages():
        """Aggregate all languages across all questions."""
        langs = set()
        for q in form_template.questions:
            for lv in read_all_translations(q.question_string_id):
                langs.add(lv.lang)
        return sorted(langs)

    # Build CSV
    questions = sorted(form_template.questions, key=lambda q: q.order)
    classification_translations = read_all_translations(
        form_template.classification.name_string_id
    )
    all_langs = get_all_languages()

    rows = [
        [
            "Form Name",
            classification_translations[0].text
            if classification_translations
            else form_template.classification.name_string_id,
            "Languages",
            ",".join(all_langs),
        ],
        ["Version", str(form_template.version)],
        [],
        [
            "Question ID",
            "Question Text",
            "Type",
            "Language",
            "Required",
            "Units",
            "Visible If",
            "Min",
            "Max",
            "# Lines",
            "Choices",
            "User Question ID",
            "Order",
            "Category Index",
        ],
    ]

    for q in questions:
        question_langs = read_all_translations(q.question_string_id)
        choices_by_lang = get_mc_options_text(q.mc_options)
        visible_if_text = get_visible_if_text(q.visible_condition)

        # First row: main question (with metadata)
        for i, q_lang in enumerate(question_langs):
            rows.append(
                [
                    q.id if i == 0 else "",
                    q_lang.text,
                    q.question_type.value if i == 0 else "",
                    q_lang.lang,
                    "Y" if (i == 0 and q.required) else "",
                    q.units if i == 0 else "",
                    visible_if_text if i == 0 else "",
                    q.num_min if i == 0 else "",
                    q.num_max if i == 0 else "",
                    q.string_max_lines if i == 0 else "",
                    choices_by_lang.get(q_lang.lang, ""),
                    q.user_question_id if i == 0 else "",
                    q.order if i == 0 else "",
                    q.category_index if i == 0 else "",
                ]
            )

        # If a question has no translation at all
        if not question_langs:
            rows.append(
                [
                    q.id,
                    f"[{q.question_string_id}]",
                    q.question_type.value,
                    "",
                    "Y" if q.required else "",
                    q.units or "",
                    visible_if_text,
                    q.num_min or "",
                    q.num_max or "",
                    q.string_max_lines or "",
                    "",
                    q.user_question_id,
                    q.order,
                    q.category_index or "",
                ]
            )

    return list_to_csv(rows)
