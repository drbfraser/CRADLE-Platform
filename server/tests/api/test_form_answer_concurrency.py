import json
import os
from concurrent.futures import ThreadPoolExecutor
from threading import Event, local
from time import monotonic

import pytest
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.schema import CreateTable
from werkzeug.exceptions import HTTPException

from api.resources import forms_v2
from common.commonUtil import get_uuid
from enums import QuestionTypeEnum
from models import (
    FormAnswerOrmV2,
    FormQuestionTemplateOrmV2,
    FormSubmissionOrmV2,
    FormTemplateOrmV2,
)
from validation.formsV2_models import (
    FormIdPath,
    ReplaceFormRequestBody,
    UpdateFormRequestBody,
)


@pytest.fixture(scope="module")
def mysql_engine():
    database_url = os.getenv("FORM_V2_LOCK_TEST_DATABASE_URL")
    if not database_url:
        pytest.skip(
            "Set FORM_V2_LOCK_TEST_DATABASE_URL to a disposable MySQL database."
        )
    engine = create_engine(database_url, isolation_level="REPEATABLE READ")
    if engine.dialect.name != "mysql" or not engine.url.database.startswith(
        "test_form_v2_lock_"
    ):
        engine.dispose()
        pytest.fail(
            "Concurrency tests require a dedicated test_form_v2_lock_ MySQL database."
        )
    with engine.begin() as connection:
        # Use the real mapped columns, without unrelated patient/user foreign keys.
        for model in (
            FormTemplateOrmV2,
            FormQuestionTemplateOrmV2,
            FormSubmissionOrmV2,
            FormAnswerOrmV2,
        ):
            connection.execute(
                CreateTable(
                    model.__table__,
                    include_foreign_key_constraints=[],
                    if_not_exists=True,
                )
            )
    yield engine
    engine.dispose()


def wait_for_lock(engine):
    deadline = monotonic() + 10
    while monotonic() < deadline:
        with engine.connect() as connection:
            if connection.execute(
                text("SELECT COUNT(*) FROM information_schema.INNODB_LOCK_WAITS")
            ).scalar():
                return
        Event().wait(0.01)
    pytest.fail("The second transaction never waited for the submission row lock.")


@pytest.mark.parametrize("method", ["PATCH", "PUT"])
@pytest.mark.parametrize("preload_answers", [False, True])
def test_waiting_update_uses_answers_committed_by_put(
    mysql_engine, monkeypatch, method, preload_answers
):
    sessions = scoped_session(sessionmaker(bind=mysql_engine))
    template_id, question_id, submission_id, answer_id = [get_uuid() for _ in range(4)]
    with sessions() as session:
        session.add(FormTemplateOrmV2(id=template_id, form_classification_id="unused"))
        session.add(
            FormQuestionTemplateOrmV2(
                id=question_id,
                form_template_id=template_id,
                question_string_id="unused",
                question_type=QuestionTypeEnum.STRING,
                order=0,
                required=False,
            )
        )
        session.add(
            FormSubmissionOrmV2(
                id=submission_id,
                form_template_id=template_id,
                patient_id="unused",
                user_id=1,
                answers=[
                    FormAnswerOrmV2(
                        id=answer_id,
                        question_id=question_id,
                        answer=json.dumps({"text": "Original"}),
                    )
                ],
            )
        )
        session.commit()
    sessions.remove()

    roles = local()
    writer_ready, release_writer, reader_lock_attempted = Event(), Event(), Event()
    monkeypatch.setattr(forms_v2.crud, "db_session", sessions)
    monkeypatch.setattr(
        forms_v2.crud,
        "read",
        lambda model, **filters: sessions.query(model)
        .filter_by(**filters)
        .one_or_none(),
    )
    monkeypatch.setattr(
        forms_v2.user_utils, "get_current_user_from_jwt", lambda: {"id": 1}
    )

    def authorize(model, resource_id):
        form = sessions.query(model).filter_by(id=resource_id).one()
        if roles.reader and preload_answers:
            list(form.answers)
        return form

    monkeypatch.setattr(forms_v2, "load_authorized_patient_resource", authorize)

    def pause_before_commit(session):
        writer_ready.set()
        assert release_writer.wait(10), "Timed out waiting to commit the first PUT."

    def observe_reader_lock(
        connection, cursor, statement, parameters, context, executemany
    ):
        if "form_submission_v2" in statement and "FOR UPDATE" in statement:
            reader_lock_attempted.set()

    path = FormIdPath(form_submission_id=submission_id)

    def writer():
        roles.reader = False
        session = sessions()
        event.listen(session, "before_commit", pause_before_commit)
        try:
            return forms_v2.replace_form_answers(
                path, ReplaceFormRequestBody(expected_revision=1, answers=[])
            )
        finally:
            sessions.remove()

    def reader():
        roles.reader = True
        session = sessions()
        event.listen(session.connection(), "before_cursor_execute", observe_reader_lock)
        try:
            if method == "PATCH":
                try:
                    forms_v2.update_form(
                        path,
                        UpdateFormRequestBody(
                            answers=[
                                {
                                    "id": answer_id,
                                    "answer": {"text": "Changed"},
                                }
                            ]
                        ),
                    )
                except HTTPException as error:
                    return error.code
                return 200
            return forms_v2.replace_form_answers(
                path,
                ReplaceFormRequestBody(
                    expected_revision=2,
                    answers=[
                        {"question_id": question_id, "answer": {"text": "Added again"}}
                    ],
                ),
            )[1]
        finally:
            sessions.remove()

    try:
        with ThreadPoolExecutor(max_workers=2) as executor:
            first = executor.submit(writer)
            try:
                assert writer_ready.wait(10)
                second = executor.submit(reader)
                assert reader_lock_attempted.wait(10)
                wait_for_lock(mysql_engine)
            finally:
                release_writer.set()
            assert first.result(timeout=10)[1] == 200
            assert second.result(timeout=10) == (404 if method == "PATCH" else 200)

        with sessions() as session:
            form = session.query(FormSubmissionOrmV2).filter_by(id=submission_id).one()
            assert form.revision == (2 if method == "PATCH" else 3)
            if method == "PATCH":
                assert form.answers == []
            else:
                assert len(form.answers) == 1
                assert form.answers[0].id != answer_id
                assert json.loads(form.answers[0].answer)["text"] == "Added again"
    finally:
        sessions.remove()
