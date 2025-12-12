import pytest
from pydantic import ValidationError

from enums import QRelationalEnum, QuestionTypeEnum
from validation.formsV2_models import FormTemplate

CLASSIFICATION = {
    "id": "class-123",
    "name": {"English": "Patient Intake Form", "French": "Formulaire d'admission"},
    "name_string_id": "name-str-123",
}
VERSION = 1
ID = "template-asdsd-sdsw1231"
DATE_CREATED = 1551447833

root_question = {
    "id": "root_question_id",
    "form_template_id": ID,
    "question_type": QuestionTypeEnum.MULTIPLE_CHOICE,
    "order": 0,
    "question_text": {
        "English": "What's your nationality?",
        "French": "Quelle est votre nationalité?",
    },
    "question_string_id": "question-str-123",
    "category_index": None,
    "required": True,
    "has_comment_attached": False,
    "mc_options": [
        {
            "string_id": "opt-1",
            "translations": {"English": "England", "French": "Angleterre"},
        },
        {
            "string_id": "opt-2",
            "translations": {"English": "France", "French": "France"},
        },
    ],
    "visible_condition": [],
    "user_question_id": "patient_nationality",
}

# conditional question that appears based on root question
conditional_question = {
    "id": "conditional_question_id",
    "form_template_id": ID,
    "question_type": QuestionTypeEnum.STRING,
    "order": 1,
    "question_text": {
        "English": "Please specify details",
        "French": "Veuillez préciser les détails",
    },
    "question_string_id": "question-str-456",
    "required": False,
    "has_comment_attached": True,
    "string_max_length": 500,
    "string_max_lines": 5,
    "visible_condition": [
        {
            "question_index": 0,
            "relation": QRelationalEnum.EQUAL_TO,
            "answers": {"mc_id_array": [0]},
        },
    ],
    "user_question_id": "nationality_details",
}

# Number question with constraints
number_question = {
    "id": "number_question_id",
    "form_template_id": ID,
    "question_type": QuestionTypeEnum.INTEGER,
    "order": 2,
    "question_text": {"English": "What is your age?", "French": "Quel est votre âge?"},
    "question_string_id": "question-str-789",
    "required": True,
    "num_min": 0,
    "num_max": 120,
    "units": "years",
    "user_question_id": "patient_age",
}

# Date question with constraints
date_question = {
    "id": "date_question_id",
    "form_template_id": ID,
    "question_type": QuestionTypeEnum.DATE,
    "order": 3,
    "question_text": {"English": "Date of birth", "French": "Date de naissance"},
    "question_string_id": "question-str-101",
    "required": True,
    "allow_future_dates": False,
    "allow_past_dates": True,
    "user_question_id": "patient_dob",
}

# Valid templates
template_with_valid_fields_and_no_question_should_return_none = {
    "id": ID,
    "classification": CLASSIFICATION,
    "questions": [],
    "version": VERSION,
    "date_created": DATE_CREATED,
    "archived": False,
}

template_with_valid_fields_and_one_question_should_return_none = {
    "id": ID,
    "classification": CLASSIFICATION,
    "questions": [root_question],
    "version": VERSION,
    "date_created": DATE_CREATED,
    "archived": False,
}

template_with_multiple_questions_should_return_none = {
    "id": ID,
    "classification": CLASSIFICATION,
    "questions": [root_question, conditional_question, number_question, date_question],
    "version": VERSION,
    "date_created": DATE_CREATED,
    "archived": False,
}

template_with_archived_true_should_return_none = {
    "id": ID,
    "classification": CLASSIFICATION,
    "questions": [],
    "version": VERSION,
    "date_created": DATE_CREATED,
    "archived": True,
}

# Missing required fields
template_missing_required_field_id_should_throw_exception = {
    "classification": CLASSIFICATION,
    "questions": [],
    "version": VERSION,
    "date_created": DATE_CREATED,
}

template_missing_required_field_classification_should_throw_exception = {
    "id": ID,
    "questions": [],
    "version": VERSION,
    "date_created": DATE_CREATED,
}

template_missing_required_field_version_should_throw_exception = {
    "id": ID,
    "classification": CLASSIFICATION,
    "questions": [],
    "date_created": DATE_CREATED,
}

# Wrong type fields
template_field_id_has_wrong_type_should_throw_exception = {
    "id": 111,
    "classification": CLASSIFICATION,
    "questions": [],
    "version": VERSION,
    "date_created": DATE_CREATED,
}

template_field_classification_has_wrong_type_should_throw_exception = {
    "id": ID,
    "classification": "wrong_type",
    "questions": [],
    "version": VERSION,
    "date_created": DATE_CREATED,
}

template_field_questions_has_wrong_type_should_throw_exception = {
    "id": ID,
    "classification": CLASSIFICATION,
    "questions": "string",
    "version": VERSION,
    "date_created": DATE_CREATED,
}

template_field_version_has_wrong_type_should_throw_exception = {
    "id": ID,
    "classification": CLASSIFICATION,
    "questions": [],
    "version": "V1",
    "date_created": DATE_CREATED,
}

# Invalid nested structures
template_with_invalid_classification_should_throw_exception = {
    "id": ID,
    "classification": {
        "id": "class-123",
        "name": "wrong_type",  # should be MultiLangText (dict)
    },
    "questions": [],
    "version": VERSION,
    "date_created": DATE_CREATED,
}

template_with_invalid_question_should_throw_exception = {
    "id": ID,
    "classification": CLASSIFICATION,
    "questions": [
        {
            "id": "q1",
            "form_template_id": ID,
            "question_type": "INVALID_TYPE",  # invalid type enum value
            "order": 0,
            "question_text": {"English": "Question"},
            "required": True,
        }
    ],
    "version": VERSION,
    "date_created": DATE_CREATED,
}

template_with_question_missing_required_field_should_throw_exception = {
    "id": ID,
    "classification": CLASSIFICATION,
    "questions": [
        {
            "id": "q1",
            "form_template_id": ID,
            # missing question_type field
            "order": 0,
            "question_text": {"English": "Question"},
            "required": True,
        }
    ],
    "version": VERSION,
    "date_created": DATE_CREATED,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        # Valid cases
        (template_with_valid_fields_and_no_question_should_return_none, None),
        (template_with_valid_fields_and_one_question_should_return_none, None),
        (template_with_multiple_questions_should_return_none, None),
        (template_with_archived_true_should_return_none, None),
        # Missing required fields (only id, classification, version are actually required)
        (template_missing_required_field_id_should_throw_exception, ValidationError),
        (
            template_missing_required_field_classification_should_throw_exception,
            ValidationError,
        ),
        (
            template_missing_required_field_version_should_throw_exception,
            ValidationError,
        ),
        # Wrong types
        (template_field_id_has_wrong_type_should_throw_exception, ValidationError),
        (
            template_field_classification_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            template_field_questions_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (template_field_version_has_wrong_type_should_throw_exception, ValidationError),
        # Invalid nested structures
        (template_with_invalid_classification_should_throw_exception, ValidationError),
        (template_with_invalid_question_should_throw_exception, ValidationError),
        (
            template_with_question_missing_required_field_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validate_template(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormTemplate(**json)
    else:
        try:
            FormTemplate(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e


# Additional tests for specific scenarios
class TestFormTemplateComplexScenarios:
    """Test complex form template validation scenarios"""

    def test_template_defaults(self):
        """Test that default values are set correctly"""
        minimal_template = {
            "id": ID,
            "version": VERSION,
            "classification": CLASSIFICATION,
        }

        template = FormTemplate(**minimal_template)
        assert template.archived is False
        assert template.questions == []
        assert template.date_created is not None

    def test_template_with_all_question_types(self):
        """Test template with all supported question types"""
        template_data = {
            "id": ID,
            "version": VERSION,
            "classification": CLASSIFICATION,
            "questions": [
                {
                    "id": "q1",
                    "form_template_id": ID,
                    "question_type": QuestionTypeEnum.INTEGER,
                    "order": 0,
                    "question_text": {"English": "Number question"},
                    "required": True,
                },
                {
                    "id": "q2",
                    "form_template_id": ID,
                    "question_type": QuestionTypeEnum.STRING,
                    "order": 1,
                    "question_text": {"English": "String question"},
                    "required": True,
                },
                {
                    "id": "q3",
                    "form_template_id": ID,
                    "question_type": QuestionTypeEnum.MULTIPLE_CHOICE,
                    "order": 2,
                    "question_text": {"English": "MC question"},
                    "required": True,
                },
                {
                    "id": "q4",
                    "form_template_id": ID,
                    "question_type": QuestionTypeEnum.DATE,
                    "order": 3,
                    "question_text": {"English": "Date question"},
                    "required": True,
                },
            ],
        }

        template = FormTemplate(**template_data)
        assert len(template.questions) == 4
        assert all(q.form_template_id == ID for q in template.questions)

    def test_template_with_nested_visible_conditions(self):
        """Test template with questions having complex visible conditions"""
        template_data = {
            "id": ID,
            "version": VERSION,
            "classification": CLASSIFICATION,
            "questions": [
                {
                    "id": "q1",
                    "form_template_id": ID,
                    "question_type": QuestionTypeEnum.MULTIPLE_CHOICE,
                    "order": 0,
                    "question_text": {"English": "Q1"},
                    "required": True,
                    "mc_options": [
                        {"translations": {"English": "Yes"}},
                        {"translations": {"English": "No"}},
                    ],
                },
                {
                    "id": "q2",
                    "form_template_id": ID,
                    "question_type": QuestionTypeEnum.STRING,
                    "order": 1,
                    "question_text": {"English": "Q2"},
                    "required": False,
                    "visible_condition": [
                        {
                            "question_index": 0,
                            "relation": QRelationalEnum.EQUAL_TO,
                            "answers": {"mc_id_array": [0]},
                        }
                    ],
                },
                {
                    "id": "q3",
                    "form_template_id": ID,
                    "question_type": QuestionTypeEnum.INTEGER,
                    "order": 2,
                    "question_text": {"English": "Q3"},
                    "required": False,
                    "visible_condition": [
                        {
                            "question_index": 1,
                            "relation": QRelationalEnum.SMALLER_THAN,
                            "answers": {"text": ""},
                        }
                    ],
                },
            ],
        }

        template = FormTemplate(**template_data)
        assert len(template.questions[1].visible_condition) == 1
        assert len(template.questions[2].visible_condition) == 1

    def test_template_version_increments(self):
        """Test that different versions can be created"""
        template_v1 = FormTemplate(
            id="template-v1",
            version=1,
            classification=CLASSIFICATION,
            questions=[],
        )

        template_v2 = FormTemplate(
            id="template-v2",
            version=2,
            classification=CLASSIFICATION,
            questions=[root_question],
        )

        assert template_v1.version == 1
        assert template_v2.version == 2

    def test_template_multilingual_support(self):
        """Test that templates properly handle multiple languages"""
        multilang_classification = {
            "id": "class-ml",
            "name": {
                "English": "Patient Form",
                "French": "Formulaire patient",
                "Spanish": "Formulario del paciente",
            },
            "name_string_id": "name-str-ml",
        }

        multilang_question = {
            "id": "q-ml",
            "form_template_id": ID,
            "question_type": QuestionTypeEnum.STRING,
            "order": 0,
            "question_text": {
                "English": "What is your name?",
                "French": "Quel est votre nom?",
                "Spanish": "¿Cuál es su nombre?",
            },
            "required": True,
        }

        template = FormTemplate(
            id=ID,
            version=1,
            classification=multilang_classification,
            questions=[multilang_question],
        )

        assert len(template.classification.name.model_dump()) == 3
        assert len(template.questions[0].question_text.model_dump()) == 3
