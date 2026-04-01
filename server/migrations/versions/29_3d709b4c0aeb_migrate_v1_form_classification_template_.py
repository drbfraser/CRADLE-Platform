"""Migrate V1 form classification/template/question/submission/answer to V2 and update workflow template step

Revision ID: 29_3d709b4c0aeb
Revises: 28_seed_basic_workflow_variables
Create Date: 2026-03-31 16:40:51.253868

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text
import uuid
import json


# revision identifiers, used by Alembic.
revision = '29_3d709b4c0aeb'
down_revision = '28_seed_basic_workflow_variables'
branch_labels = None
depends_on = None

# *****Note: This migration was created with the help of AI. Please review carefully before applying.*****

def _uuid():
    return str(uuid.uuid4())


def upgrade():
    conn = op.get_bind()

    # ----------------------------------------------------------------------
    # 0) Build basic mappings
    # ----------------------------------------------------------------------
    classification_id_map = {}  # v1_class_id -> v2_class_id
    template_id_map = {}        # v1_template_id -> v2_template_id
    question_id_map = {}        # v1_blank_question_id -> v2_question_id
    form_id_map = {}            # v1_form_id -> v2_submission_id

    # ----------------------------------------------------------------------
    # 1) Migrate classifications V1 -> V2
    # ----------------------------------------------------------------------
    v1_classes = conn.execute(
        text("SELECT id, name FROM form_classification")
    ).fetchall()

    for row in v1_classes:
        v1_id = row.id
        v1_name = row.name

        v2_class_id = _uuid()
        name_string_id = _uuid()
        text_value = f"V1 {v1_name}"

        classification_id_map[v1_id] = v2_class_id

        conn.execute(
            text(
                """
                INSERT INTO form_classification_v2 (id, name_string_id)
                VALUES (:id, :name_string_id)
                """
            ),
            {"id": v2_class_id, "name_string_id": name_string_id},
        )

        conn.execute(
            text(
                """
                INSERT INTO lang_version_v2 (string_id, lang, text)
                VALUES (:string_id, :lang, :text)
                """
            ),
            {"string_id": name_string_id, "lang": "English", "text": text_value},
        )

    # ----------------------------------------------------------------------
    # 2) Migrate templates V1 -> V2 (grouped by classification, versioned by date_created)
    # ----------------------------------------------------------------------
    v1_templates = conn.execute(
        text(
            """
            SELECT id, form_classification_id, date_created, archived
            FROM form_template
            ORDER BY form_classification_id, date_created
            """
        )
    ).fetchall()

    grouped_templates = {}
    for row in v1_templates:
        grouped_templates.setdefault(row.form_classification_id, []).append(row)

    for v1_class_id, templates in grouped_templates.items():
        v2_class_id = classification_id_map.get(v1_class_id)

        if v2_class_id is None:
            # Handle NULL or orphaned classifications
            v2_class_id = _uuid()
            name_string_id = _uuid()
            text_value = "V1 Unclassified"

            classification_id_map[v1_class_id] = v2_class_id

            conn.execute(
                text(
                    """
                    INSERT INTO form_classification_v2 (id, name_string_id)
                    VALUES (:id, :name_string_id)
                    """
                ),
                {"id": v2_class_id, "name_string_id": name_string_id},
            )

            conn.execute(
                text(
                    """
                    INSERT INTO lang_version_v2 (string_id, lang, text)
                    VALUES (:string_id, :lang, :text)
                    """
                ),
                {"string_id": name_string_id, "lang": "English", "text": text_value},
            )

        templates_sorted = sorted(templates, key=lambda r: r.date_created)

        for idx, t in enumerate(templates_sorted, start=1):
            v1_template_id = t.id
            v2_template_id = _uuid()
            template_id_map[v1_template_id] = v2_template_id

            conn.execute(
                text(
                    """
                    INSERT INTO form_template_v2
                    (id, form_classification_id, version, archived, date_created)
                    VALUES (:id, :class_id, :version, :archived, :date_created)
                    """
                ),
                {
                    "id": v2_template_id,
                    "class_id": v2_class_id,
                    "version": idx,
                    "archived": t.archived,
                    "date_created": t.date_created,
                },
            )

    # ----------------------------------------------------------------------
    # 3) Migrate blank questions (template structure) V1 -> V2
    # ----------------------------------------------------------------------
    # V1: question where is_blank = 1 and form_template_id IS NOT NULL
    v1_blank_questions = conn.execute(
        text(
            """
            SELECT
                q.id,
                q.form_template_id,
                q.question_index,
                q.question_text,
                q.question_type,
                q.has_comment_attached,
                q.required,
                q.allow_future_dates,
                q.allow_past_dates,
                q.units,
                q.visible_condition,
                q.mc_options,
                q.num_min,
                q.num_max,
                q.string_max_length,
                q.category_index,
                q.string_max_lines
            FROM question q
            WHERE q.is_blank = 1
              AND q.form_template_id IS NOT NULL
            ORDER BY q.form_template_id, q.question_index
            """
        )
    ).fetchall()

    # Preload V1 question translations
    v1_lang_versions = conn.execute(
        text(
            """
            SELECT question_id, lang, question_text, mc_options
            FROM question_lang_version
            """
        )
    ).fetchall()

    lang_by_question = {}
    for row in v1_lang_versions:
        lang_by_question.setdefault(row.question_id, []).append(row)

    for q in v1_blank_questions:
        v1_q_id = q.id
        v1_template_id = q.form_template_id
        v2_template_id = template_id_map.get(v1_template_id)
        if not v2_template_id:
            # Template not migrated (should not happen, but guard)
            continue

        v2_q_id = _uuid()
        question_id_map[v1_q_id] = v2_q_id

        # Create question_string_id for the main question text
        question_string_id = _uuid()

        # Insert English translation from base question_text
        conn.execute(
            text(
                """
                INSERT INTO lang_version_v2 (string_id, lang, text)
                VALUES (:string_id, :lang, :text)
                """
            ),
            {
                "string_id": question_string_id,
                "lang": "English",
                "text": q.question_text or "",
            },
        )

        # Insert other language versions from question_lang_version
        for lv in lang_by_question.get(v1_q_id, []):
            if lv.lang == "English":
                continue  # English already inserted from base question_text
            conn.execute(
                text("""
                    INSERT INTO lang_version_v2 (string_id, lang, text)
                    VALUES (:string_id, :lang, :text)
                """),
                {"string_id": question_string_id, "lang": lv.lang, "text": lv.question_text or ""},
            )


        # Handle MC options: V1 stores text; V2 expects UUIDs with translations
        mc_options_raw = q.mc_options or "[]"
        try:
            mc_options_list = json.loads(mc_options_raw)
        except Exception:
            mc_options_list = []

        v2_mc_ids = []
        # If question_lang_version has mc_options per lang, we only use English here
        # and rely on future enhancements for full i18n of options.
        for opt in mc_options_list:
            # opt is expected like {"mcId": 0, "opt": "abcd"}
            text_opt = opt.get("opt") if isinstance(opt, dict) else None
            if not text_opt:
                continue
            mc_id = _uuid()
            v2_mc_ids.append(mc_id)
            conn.execute(
                text(
                    """
                    INSERT INTO lang_version_v2 (string_id, lang, text)
                    VALUES (:string_id, :lang, :text)
                    """
                ),
                {"string_id": mc_id, "lang": "English", "text": text_opt},
            )

        v2_mc_options_json = json.dumps(v2_mc_ids)

        conn.execute(
            text(
                """
                INSERT INTO form_question_template_v2
                (
                    id,
                    form_template_id,
                    `order`,
                    question_type,
                    question_string_id,
                    mc_options,
                    user_question_id,
                    has_comment_attached,
                    category_index,
                    required,
                    visible_condition,
                    units,
                    num_min,
                    num_max,
                    string_max_length,
                    string_max_lines,
                    allow_future_dates,
                    allow_past_dates
                )
                VALUES
                (
                    :id,
                    :form_template_id,
                    :order,
                    :question_type,
                    :question_string_id,
                    :mc_options,
                    :user_question_id,
                    :has_comment_attached,
                    :category_index,
                    :required,
                    :visible_condition,
                    :units,
                    :num_min,
                    :num_max,
                    :string_max_length,
                    :string_max_lines,
                    :allow_future_dates,
                    :allow_past_dates
                )
                """
            ),
            {
                "id": v2_q_id,
                "form_template_id": v2_template_id,
                "order": q.question_index,
                "question_type": q.question_type,
                "question_string_id": question_string_id,
                "mc_options": v2_mc_options_json,
                # V1 has no user_question_id; set as none for now
                "user_question_id": None,
                "has_comment_attached": bool(q.has_comment_attached),
                "category_index": q.category_index,
                "required": bool(q.required),
                "visible_condition": q.visible_condition or "[]",
                "units": q.units,
                "num_min": q.num_min,
                "num_max": q.num_max,
                "string_max_length": q.string_max_length,
                "string_max_lines": q.string_max_lines,
                "allow_future_dates": bool(q.allow_future_dates),
                "allow_past_dates": bool(q.allow_past_dates),
            },
        )

    # ----------------------------------------------------------------------
    # 4) Migrate filled forms V1 -> form_submission_v2
    # ----------------------------------------------------------------------
    v1_forms = conn.execute(
        text(
            """
            SELECT
                id,
                patient_id,
                form_template_id,
                last_edited_by,
                date_created,
                last_edited,
                lang
            FROM form
            """
        )
    ).fetchall()

    for f in v1_forms:
        v1_form_id = f.id
        v1_template_id = f.form_template_id
        if not v1_template_id:
            # Skip forms without a template (handle separately?)
            continue

        v2_template_id = template_id_map.get(v1_template_id)
        if not v2_template_id:
            # Template not migrated (should not happen if data is consistent)
            continue

        v2_submission_id = _uuid()
        form_id_map[v1_form_id] = v2_submission_id

        conn.execute(
            text(
                """
                INSERT INTO form_submission_v2
                (
                    id,
                    form_template_id,
                    patient_id,
                    user_id,
                    date_submitted,
                    last_edited,
                    lang
                )
                VALUES
                (
                    :id,
                    :form_template_id,
                    :patient_id,
                    :user_id,
                    :date_submitted,
                    :last_edited,
                    :lang
                )
                """
            ),
            {
                "id": v2_submission_id,
                "form_template_id": v2_template_id,
                "patient_id": f.patient_id,
                "user_id": f.last_edited_by,
                "date_submitted": f.date_created,
                "last_edited": f.last_edited,
                "lang": f.lang or "English",
            },
        )

    # ----------------------------------------------------------------------
    # 5) Migrate answers V1 -> form_answer_v2
    # ----------------------------------------------------------------------
    # V1 answers are stored in QuestionOrm.answers when is_blank = 0 and form_id IS NOT NULL
    v1_answer_questions = conn.execute(
        text(
            """
            SELECT
                id,
                form_id,
                answers
            FROM question
            WHERE is_blank = 0
              AND form_id IS NOT NULL
            """
        )
    ).fetchall()

    # We need to map V1 question (filled) to V2 question (template) by:
    # - V1 question.form_template_id (for blank) vs V1 question.form_id (for filled)
    # There is no direct link, so we assume:
    #   - The structure of the template and the filled form match by question_index
    # So we build an index: (form_template_id, question_index) -> v2_question_id
    v1_blank_questions_for_index = conn.execute(
        text(
            """
            SELECT
                id,
                form_template_id,
                question_index
            FROM question
            WHERE is_blank = 1
              AND form_template_id IS NOT NULL
            """
        )
    ).fetchall()

    template_qindex_to_v2_qid = {}
    for q in v1_blank_questions_for_index:
        v1_q_id = q.id
        v1_template_id = q.form_template_id
        v2_q_id = question_id_map.get(v1_q_id)
        if not v2_q_id:
            continue
        template_qindex_to_v2_qid[(v1_template_id, q.question_index)] = v2_q_id

    # Now we need to know, for each filled question, which template it came from and what its index is.
    # We fetch that from V1 question table.
    v1_filled_questions_full = conn.execute(
        text(
            """
            SELECT
                id,
                form_id,
                form_template_id,
                question_index,
                answers
            FROM question
            WHERE is_blank = 0
              AND form_id IS NOT NULL
            """
        )
    ).fetchall()

    for q in v1_filled_questions_full:
        v1_form_id = q.form_id
        v1_template_id = q.form_template_id
        v2_submission_id = form_id_map.get(v1_form_id)
        if not v2_submission_id:
            continue

        v2_question_id = template_qindex_to_v2_qid.get(
            (v1_template_id, q.question_index)
        )
        if not v2_question_id:
            continue

        answers_raw = q.answers or "{}"

        conn.execute(
            text(
                """
                INSERT INTO form_answer_v2
                (
                    id,
                    question_id,
                    form_submission_id,
                    answer
                )
                VALUES
                (
                    :id,
                    :question_id,
                    :form_submission_id,
                    :answer
                )
                """
            ),
            {
                "id": _uuid(),
                "question_id": v2_question_id,
                "form_submission_id": v2_submission_id,
                "answer": answers_raw,
            },
        )

    # ----------------------------------------------------------------------
    # 6) Update workflow_template_step.form_id to point to V2 template ids
    # ----------------------------------------------------------------------
    # Drop old FK first so we can safely update form_id
    op.drop_constraint(
        "fk_workflow_template_step_form_id_form_template",
        "workflow_template_step",
        type_="foreignkey",
    )

    for v1_id, v2_id in template_id_map.items():
        conn.execute(
            text(
                """
                UPDATE workflow_template_step
                SET form_id = :v2_id
                WHERE form_id = :v1_id
                """
            ),
            {"v2_id": v2_id, "v1_id": v1_id},
        )

    conn.execute(
        text(
            """
            UPDATE workflow_template_step
            SET form_id = NULL
            WHERE form_id IS NOT NULL
              AND form_id NOT IN (SELECT id FROM form_template_v2)
            """
        )
    )

    # Create new FK to form_template_v2
    op.create_foreign_key(
        "fk_workflow_template_step_form_id_form_template_v2",
        "workflow_template_step",
        "form_template_v2",
        ["form_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade():
    conn = op.get_bind()

    # Drop FK to V2
    op.drop_constraint(
        "fk_workflow_template_step_form_id_form_template_v2",
        "workflow_template_step",
        type_="foreignkey",
    )

    # Best-effort: null out any form_id that doesn't exist in V1
    conn.execute(
        text(
            """
            UPDATE workflow_template_step
            SET form_id = NULL
            WHERE form_id IS NOT NULL
              AND form_id NOT IN (SELECT id FROM form_template)
            """
        )
    )

    # Restore FK to V1
    op.create_foreign_key(
        "fk_workflow_template_step_form_id_form_template",
        "workflow_template_step",
        "form_template",
        ["form_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # Delete V2 answers, submissions, questions, templates, classifications, translations
    conn.execute(text("DELETE FROM form_answer_v2"))
    conn.execute(text("DELETE FROM form_submission_v2"))
    conn.execute(text("DELETE FROM form_question_template_v2"))
    conn.execute(text("DELETE FROM form_template_v2"))

    # Delete lang_version_v2 entries that look like migrated V1 (best-effort)
    conn.execute(
        text(
            """
            DELETE lv
            FROM lang_version_v2 lv
            WHERE lv.text LIKE 'V1 %'
            """
        )
    )

    conn.execute(text("DELETE FROM form_classification_v2"))
