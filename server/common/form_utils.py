from models import FormTemplateOrm

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
