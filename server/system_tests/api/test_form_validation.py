import pytest
from validation.formValidation import (
    FormValidator,
    ValidationError,
    validate_form_against_template,
    validate_and_abort_on_errors
)
from flask import Flask
from unittest.mock import patch


class TestFormValidation:

    def test_valid_form_submission(self, mock_form_template_orm, simple_form_data):
        template_data = [
            {
                "id": "q1",
                "question_type": "MULTIPLE_CHOICE",
                "required": True,
                "visible_condition": [],
                "lang_versions": [
                    {
                        "lang": "english",
                        "mc_options": [
                            {"mc_id": 0, "opt": "Option A"},
                            {"mc_id": 1, "opt": "Option B"},
                        ]
                    }
                ]
            }
        ]
        
        template = mock_form_template_orm(template_data)
        errors = validate_form_against_template(simple_form_data, template)
        assert len(errors) == 0

    def test_missing_required_question(self, mock_form_template_orm):
        template_data = [
            {
                "id": "q1",
                "question_type": "MULTIPLE_CHOICE",
                "required": True,
                "visible_condition": [],
                "lang_versions": [
                    {
                        "lang": "english",
                        "mc_options": [
                            {"mc_id": 0, "opt": "Option A"},
                            {"mc_id": 1, "opt": "Option B"},
                        ]
                    }
                ]
            }
        ]
        
        template = mock_form_template_orm(template_data)
        form_data = {"questions": []}
        
        errors = validate_form_against_template(form_data, template)
        assert len(errors) == 1
        assert "required" in errors[0].message.lower()
        assert errors[0].field_id == "q1"

    def test_invalid_multiple_choice_option(self, mock_form_template_orm):
        template_data = [
            {
                "id": "q1",
                "question_type": "MULTIPLE_CHOICE",
                "required": True,
                "visible_condition": [],
                "lang_versions": [
                    {
                        "lang": "english",
                        "mc_options": [
                            {"mc_id": 0, "opt": "Option A"},
                            {"mc_id": 1, "opt": "Option B"},
                        ]
                    }
                ]
            }
        ]
        
        template = mock_form_template_orm(template_data)
        form_data = {
            "questions": [
                {
                    "id": "q1",
                    "answers": {"mc_id_array": [5]}  # Invalid option index
                }
            ]
        }
        
        errors = validate_form_against_template(form_data, template)
        assert len(errors) == 1
        assert "invalid option index" in errors[0].message.lower()

    def test_number_field_validation(self, mock_form_template_orm):
        template_data = [
            {
                "id": "age",
                "question_type": "INTEGER",
                "required": True,
                "visible_condition": [],
                "num_min": 0,
                "num_max": 120,
                "lang_versions": [
                    {
                        "lang": "english",
                        "mc_options": []
                    }
                ]
            }
        ]
        
        template = mock_form_template_orm(template_data)
        
        # test valid number
        form_data = {
            "questions": [
                {
                    "id": "age",
                    "answers": {"number": 25}
                }
            ]
        }
        errors = validate_form_against_template(form_data, template)
        assert len(errors) == 0
        
        # test number too high
        form_data["questions"][0]["answers"] = {"number": 150}
        errors = validate_form_against_template(form_data, template)
        assert len(errors) == 1
        assert "at most 120" in errors[0].message

        # test number too low
        form_data["questions"][0]["answers"] = {"number": -5}
        errors = validate_form_against_template(form_data, template)
        assert len(errors) == 1
        assert "at least 0" in errors[0].message

    def test_string_field_validation(self, mock_form_template_orm):
        template_data = [
            {
                "id": "comment",
                "question_type": "STRING",
                "required": True,
                "visible_condition": [],
                "string_max_length": 10,
                "lang_versions": [
                    {
                        "lang": "english",
                        "mc_options": []
                    }
                ]
            }
        ]
        
        template = mock_form_template_orm(template_data)
        
        # test valid string
        form_data = {
            "questions": [
                {
                    "id": "comment",
                    "answers": {"text": "Short"}
                }
            ]
        }
        errors = validate_form_against_template(form_data, template)
        assert len(errors) == 0
        
        # test string too long
        form_data["questions"][0]["answers"] = {"text": "This is way too long"}
        errors = validate_form_against_template(form_data, template)
        assert len(errors) == 1
        assert "exceeds maximum length" in errors[0].message

    def test_validate_and_abort_function(self, mock_form_template_orm):
        template_data = [
            {
                "id": "q1",
                "question_type": "MULTIPLE_CHOICE",
                "required": True,
                "visible_condition": [],
                "lang_versions": [
                    {
                        "lang": "english",
                        "mc_options": [
                            {"mc_id": 0, "opt": "Option A"}
                        ]
                    }
                ]
            }
        ]
        
        template = mock_form_template_orm(template_data)
        
        # test with Flask app context
        app = Flask(__name__)
        with app.app_context():
            # valid form should not abort
            form_data = {
                "questions": [
                    {
                        "id": "q1",
                        "answers": {"mc_id_array": [0]}
                    }
                ]
            }
            
            # this should not raise an exception
            try:
                validate_and_abort_on_errors(form_data, template)
            except Exception:
                pytest.fail("validate_and_abort_on_errors should not raise exception for valid form")
            
            # invalid form should abort
            invalid_form_data = {"questions": []}  # missing required question
            
            with pytest.raises(Exception):  # should raise abort exception
                validate_and_abort_on_errors(invalid_form_data, template)

    def test_edge_cases(self, mock_form_template_orm):
        # test empty template
        template = mock_form_template_orm([])
        form_data = {"questions": []}
        errors = validate_form_against_template(form_data, template)
        assert len(errors) == 0
        
        # test None template
        errors = validate_form_against_template(form_data, None)
        assert len(errors) == 1
        assert "template is required" in errors[0].message.lower()
        
        # test malformed form data
        errors = validate_form_against_template(None, template)
        assert len(errors) == 1
        assert "form data is required" in errors[0].message.lower()
        
        # test form data without questions key
        errors = validate_form_against_template({}, template)
        assert len(errors) == 0  # empty questions list is valid for empty template