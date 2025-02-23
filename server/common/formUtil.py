def filter_blank_questions_dict(form_template):
    filteredQuestions = []
    for question in form_template["questions"]:
        if question.get("is_blank", False) and question.get("answers") == {}:
            filteredQuestions.append(question)
    form_template["questions"] = filteredQuestions
    return form_template


def filter_blank_questions_orm(form_template_orm):
    """Filters a FormTemplateOrm object to only include blank questions."""
    form_template_orm.questions = [
        question
        for question in form_template_orm.questions
        if question.is_blank and question.form_id is None
    ]
    return form_template_orm
