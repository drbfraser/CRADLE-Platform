from __future__ import annotations

import json
from typing import TYPE_CHECKING

import data.db_operations as crud
from common import commonUtil
from enums import QuestionTypeEnum
from models import (
    FormClassificationOrm,
    FormClassificationOrmV2,
    FormOrm,
    FormTemplateOrm,
    FormTemplateOrmV2,
    LangVersionOrmV2,
    QuestionOrm,
)

if TYPE_CHECKING:
    from validation.formsV2_models import (
        FormClassification,
        FormTemplateUploadQuestion,
        FormTemplateUploadRequest,
        MultiLangText,
    )

FORM_NOT_FOUND_MSG = "Form with ID: ({}) not found."


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


def assign_form_or_template_ids(model, req: dict) -> None:
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


def _assign_id(obj, field: str):
    if getattr(obj, field, None) is None:
        setattr(obj, field, commonUtil.get_uuid())


def assign_form_template_ids_v2(req: FormTemplateUploadRequest) -> None:
    """
    Mutates the request dict to assign ALL required UUIDs:
    - template.id
    - classification.id + name_string_id
    - question.id + question_string_id
    - mc option string_ids
    """
    classification = req.classification
    if not classification:
        raise ValueError("Classification is required for form template upload")

    # Classification core IDs
    _assign_id(classification, "id")
    _assign_id(classification, "name_string_id")

    # Template ID
    req.id = commonUtil.get_uuid()
    template_id = req.id

    # Questions
    for question in req.questions:
        question.id = commonUtil.get_uuid()
        question.form_template_id = template_id

        # Question text (string_id)
        if question.question_text:
            _assign_id(question, "question_string_id")

        # MC option string_ids
        mc_opts = question.mc_options
        if mc_opts:
            for opt in mc_opts:
                _assign_id(opt, "string_id")


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


def resolve_string_text(string_id: str, lang: str = "English") -> str | None:
    """
    Resolve the string name by looking up the the string_id and lang.

    :param string_id: String id to look up the text
    :param lang: Language for translation
    :return: Translated name or None if not found
    """
    translation = crud.read(LangVersionOrmV2, string_id=string_id, lang=lang)

    return translation.text if translation else None


def _get_and_remove_string_id(q: dict) -> str | None:
    """Extract and remove the question string ID, if present."""
    if "question_string_id" in q:
        return q.pop("question_string_id")
    return None


def _get_mc_list(q: dict) -> list[str]:
    """Get the multiple-choice options list (if present)."""
    if "mc_options" in q:
        return q["mc_options"]
    return []


def format_template(template: dict, available_langs: list[str]) -> dict:
    """
    Format a marshalled template into a multi-language version.
    Every string field becomes a dict of {lang: text}.
    """
    if not template:
        return {}

    questions = template.get("questions", [])
    formatted = template.copy()

    # resolve different classification language versions
    classification = formatted.get("classification")
    if classification and classification.get("name_string_id"):
        sid = classification["name_string_id"]
        classification["name"] = {
            lang: resolve_string_text(sid, lang) for lang in available_langs
        }

    # remove unneeded FK
    formatted.pop("form_classification_id", None)

    # resolve different question language versions
    new_questions = []
    for q in questions:
        q = q.copy()

        # question text
        sid = q.get("question_string_id", None)
        if sid:
            q["question_text"] = {
                lang: resolve_string_text(sid, lang) for lang in available_langs
            }

        # MC options
        if q["question_type"] in (
            QuestionTypeEnum.MULTIPLE_CHOICE.value,
            QuestionTypeEnum.MULTIPLE_SELECT.value,
        ):
            mc_list = _get_mc_list(q)
            q["mc_options"] = [
                {
                    "string_id": opt,
                    "translations": {
                        lang: resolve_string_text(opt, lang) for lang in available_langs
                    },
                }
                for opt in mc_list
            ]

        new_questions.append(q)

    formatted["questions"] = new_questions
    return formatted


def lang_version_exists(string_id: str, lang: str):
    return crud.read(LangVersionOrmV2, string_id=string_id, lang=lang) is not None


def check_name_conflict(english_name: str) -> bool:
    """
    Check if a FormClassification with the same English name exists.
    :param english_name: English text to check
    :raises: abort(409) if conflict exists
    """
    existing_langs = crud.read_all(LangVersionOrmV2, lang="English", text=english_name)

    for existing_lang in existing_langs:
        fc = crud.read(FormClassificationOrmV2, name_string_id=existing_lang.string_id)
        if fc:
            return True

    return False


def handle_model_existence(
    new_template: bool,
    classification_dict: FormClassification,
    version: int,
    english_name: str,
) -> tuple[bool, FormClassificationOrmV2]:
    # Boolean to check whether to archive an existing form template version
    archive_previous_template: bool = False
    existing_classification = None

    # Case where user is creating a new form template
    if new_template:
        # Check whether an existing classification with the english_name exists
        if not english_name:
            raise ValueError("Form template must have an english lanuage version.")

        exists = check_name_conflict(english_name)
        if exists:
            raise ValueError(
                f"Form Classification with name {english_name} already exists."
            )
    else:
        existing_classification = crud.read(
            FormClassificationOrmV2, id=classification_dict.get("id")
        )
        existing_template = crud.read(
            FormTemplateOrmV2,
            form_classification_id=classification_dict.get("id"),
            version=version,
        )
        if existing_template:
            raise ValueError(
                f"Form Template with version V{version} already exists - change the version to upload."
            )
        archive_previous_template = True

    return archive_previous_template, existing_classification


def _extend_lang_version(
    translations: MultiLangText, string_id: str
) -> list[LangVersionOrmV2]:
    new_lang_versions = []

    for lang, text in translations.items():
        lang = lang.capitalize()
        if not lang_version_exists(string_id, lang):
            new_lang_versions.append(
                LangVersionOrmV2(
                    string_id=string_id,
                    lang=lang,
                    text=text,
                ),
            )

    return new_lang_versions


def get_new_lang_versions_and_questions(
    classification_dict: FormClassification,
    new_template: bool,
    questions: list[FormTemplateUploadQuestion],
):
    new_lang_versions = []
    new_questions = []

    for lang_key, text in classification_dict.get("name").items():
        existing = None
        if not new_template:
            existing = crud.read(
                LangVersionOrmV2,
                string_id=classification_dict.get("name_string_id"),
                lang=lang_key.capitalize(),
            )

        if not existing:
            lang_version = LangVersionOrmV2(
                string_id=classification_dict.get("name_string_id"),
                lang=lang_key.capitalize(),
                text=text,
            )
            new_lang_versions.append(lang_version)

    for question in questions:
        question_text = question.get("question_text")
        question.pop("question_text")

        mc_opts = question.get("mc_options", [])
        question["mc_options"] = json.dumps([opt.get("string_id") for opt in mc_opts])

        new_questions.append(question)

        q_string_id = question.get("question_string_id")
        new_lang_versions.extend(_extend_lang_version(question_text, q_string_id))

        for opt in mc_opts:
            opt_string_id = opt.get("string_id")
            new_lang_versions.extend(
                _extend_lang_version(opt.get("translations"), opt_string_id)
            )

    return new_questions, new_lang_versions


def fetch_form_or_404(form_id: str) -> FormOrm:
    """
    Fetch a form or raise a 404 if not found.
    Intended for use inside Flask endpoint handlers.
    """
    form = crud.read(FormOrm, id=form_id)
    if form is None:
        commonUtil.abort_not_found(FORM_NOT_FOUND_MSG.format(form_id))

    return form
