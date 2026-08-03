"""Shared helpers for form_utils unit tests."""

from __future__ import annotations

import json
from types import SimpleNamespace

from enums import QuestionTypeEnum

TEMPLATE_ID = "template-test-1"


def make_question(
    question_id: str,
    question_type: QuestionTypeEnum,
    *,
    required: bool = False,
    num_min: float | None = None,
    num_max: float | None = None,
    string_max_length: int | None = None,
    mc_options: list[str] | None = None,
    allow_past_dates: bool | None = True,
    allow_future_dates: bool | None = True,
) -> SimpleNamespace:
    question = SimpleNamespace()
    question.id = question_id
    question.question_type = question_type
    question.required = required
    question.num_min = num_min
    question.num_max = num_max
    question.string_max_length = string_max_length
    question.mc_options = json.dumps(mc_options if mc_options is not None else [])
    question.allow_past_dates = allow_past_dates
    question.allow_future_dates = allow_future_dates
    return question


def make_template(questions: list[SimpleNamespace]) -> SimpleNamespace:
    template = SimpleNamespace()
    template.questions = questions
    return template
