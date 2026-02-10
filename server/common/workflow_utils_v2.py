from common import commonUtil


def resolve_name(string_id: str, lang: str = "English") -> str | None:
    """
    Resolve a single-language name for a given string_id.

    Follows the FormsV2 list-endpoint pattern: looks up a single row
    in ``lang_version_v2`` for (*string_id*, *lang*) and returns the
    plain text string.  Used in API responses so the frontend receives
    a simple ``"name": "ANC"`` instead of ``{"English": "ANC"}``.

    :param string_id: The UUID that links to ``lang_version_v2`` rows.
    :param lang: Language to resolve (default ``"English"``).
    :return: The name string, or ``None`` if not found.
    """
    from common import form_utils

    if not string_id:
        return None
    return form_utils.resolve_string_text(string_id, lang)


def resolve_multilang_name(string_id: str) -> dict[str, str]:
    """
    Resolve **all** language translations for a given string_id.

    Returns ``{"English": "ANC", "French": "CPN", …}``.
    Useful for edit / detail views that need every translation at once.
    Most list endpoints should prefer :func:`resolve_name` instead.
    """
    from common import form_utils

    if not string_id:
        return {}
    translations = form_utils.read_all_translations(string_id)
    return {t.lang: t.text for t in translations}


def handle_classification_name(
    classification_dict: dict,
    new_classification: bool = True,
) -> None:
    """
    Handles the name of a workflow classification.

    Accepts name as either:
      - MultiLangText dict (e.g. {"English": "ANC", "French": "CPN"})
      - Plain string (treated as English)

    Upserts translations into lang_version_v2 via the shared FormsV2 utility.
    """
    from common import form_utils

    if classification_dict.get("name") is None:
        if new_classification:
            raise ValueError("Workflow Classification name is required.")
        return

    if classification_dict.get("name_string_id") is None:
        classification_dict["name_string_id"] = commonUtil.get_uuid()

    name = classification_dict["name"]
    name_map = name if isinstance(name, dict) else {"English": name}

    form_utils.upsert_multilang_versions(
        classification_dict["name_string_id"],
        name_map,
    )


def handle_template_step_name(
    step_dict: dict,
) -> None:
    """
    Handles the name of a workflow template step.

    Accepts name as either:
      - MultiLangText dict (e.g. {"English": "Collect vitals"})
      - Plain string (treated as English)
      - None (no-op; name_string_id will remain as-is)

    Upserts translations into lang_version_v2 via the shared FormsV2 utility.
    """
    from common import form_utils

    if step_dict.get("name") is None:
        return

    if step_dict.get("name_string_id") is None:
        step_dict["name_string_id"] = commonUtil.get_uuid()

    name = step_dict["name"]
    name_map = name if isinstance(name, dict) else {"English": name}

    form_utils.upsert_multilang_versions(
        step_dict["name_string_id"],
        name_map,
    )


def handle_template_name(
    template_dict: dict,
    new_template: bool = True,
) -> None:
    """
    Handles the name of a workflow template.

    Accepts name as either:
      - MultiLangText dict (e.g. {"English": "Prenatal Checkup"})
      - Plain string (treated as English)
      - None (no-op; name_string_id will remain as-is)

    Upserts translations into lang_version_v2 via the shared FormsV2 utility.
    """
    from common import form_utils

    if template_dict.get("name") is None:
        return

    if template_dict.get("name_string_id") is None:
        template_dict["name_string_id"] = commonUtil.get_uuid()

    name = template_dict["name"]
    name_map = name if isinstance(name, dict) else {"English": name}

    form_utils.upsert_multilang_versions(
        template_dict["name_string_id"],
        name_map,
    )
