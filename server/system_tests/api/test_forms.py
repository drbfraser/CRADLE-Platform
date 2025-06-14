from humps import decamelize

from common.print_utils import pretty_print
from data import crud
from models import FormClassificationOrm, FormOrm, FormTemplateOrm, QuestionOrm


def test_form_created(
    database,
    form,
    form_template,
    form_classification,
    create_patient,
    api_post,
    api_put,
):
    try:
        create_patient()

        response = api_post(
            endpoint="/api/forms/classifications",
            json=form_classification,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Upload form template via request body.
        response = api_post(endpoint="/api/forms/templates/body", json=form_template)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        response = api_post(endpoint="/api/forms/responses", json=form)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        form_id = "f9"
        question = crud.read(
            QuestionOrm,
            form_id=form_id,
            question_text="How the patient's condition?",
        )
        assert question is not None

        response = api_put(
            endpoint=f"/api/forms/responses/{form_id}",
            json=form_question_put(question.id),
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201
    finally:
        crud.delete_all(FormOrm, id="f9")
        crud.delete_all(FormTemplateOrm, id="ft9")
        crud.delete_all(FormClassificationOrm, name="fc9")


def form_question_put(qid):
    return {
        "questions": [
            {
                "id": qid,
                "answers": {
                    "mc_id_array": [1],
                },
            },
        ],
    }