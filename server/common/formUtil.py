def filter_blank_questions_dict(form_template):
    """Filters a form template dictionary to only include blank questions."""
    form_template["questions"] = [
        question for question in form_template["questions"]
        if question.get("is_blank", False) is True
    ]
    return form_template

def filter_blank_questions_orm(form_template_orm):
    """Filters a FormTemplateOrm object to only include blank questions."""
    form_template_orm.questions = [
        question for question in form_template_orm.questions if question.is_blank
    ]
    return form_template_orm