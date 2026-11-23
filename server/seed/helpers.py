"""
Shared helpers for seed data (used by manage.py and the seed/ modules).
"""

import data.db_operations as crud
from common.commonUtil import get_uuid
from models import (
    FormTemplateOrmV2,
    LangVersionOrmV2,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
    db,
)


def create_lang_text(text_en, text_fr=None):
    """
    Create a string_id plus its LangVersionOrmV2 row(s).

    Temporary seeding helper for the workflow-language demo slice - real
    multi-lang authoring will go through the editor UI/API instead.
    """
    string_id = get_uuid()
    db.session.add(LangVersionOrmV2(string_id=string_id, lang="English", text=text_en))
    if text_fr:
        db.session.add(
            LangVersionOrmV2(string_id=string_id, lang="French", text=text_fr)
        )
    return string_id


def create_workflow_template_step_with_form_and_branches(
    template_step: dict, form_id: str, template_step_branches: list[dict]
) -> None:
    form_template_orm = crud.read(FormTemplateOrmV2, id=form_id)
    template_step_orm = WorkflowTemplateStepOrm(form=form_template_orm, **template_step)

    for branch in template_step_branches:
        template_step_branch_orm = WorkflowTemplateStepBranchOrm(**branch)
        template_step_orm.branches.append(template_step_branch_orm)

    db.session.add(template_step_orm)
    db.session.commit()
