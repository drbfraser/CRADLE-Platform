from typing import Optional, List, Dict, Any
from datetime import datetime
import json
from enum import Enum
from flask import abort

from validation import CradleBaseModel


class FieldError(CradleBaseModel):
    # single field error - provide detailed error information for each field that failed in validation

    field: Optional[str] = None
    message: str


class ValidationErrorResponse(CradleBaseModel):
    # JSON list of all field errors in validation

    validation_errors: List[FieldError]


class ErrorResponse(CradleBaseModel):
    # generic error response model for non-validation errors

    description: str


class ValidationError(Exception):
    # custom exception class for form validation errors - holds both ID (if it has one) and error message

    def __init__(self, message: str, field_id: str = None):
        self.message = message
        self.field_id = field_id
        super().__init__(self.message)


class QuestionTypeEnum(Enum):
    # enum of supported question types in form templates - must match frontend enum

    CATEGORY = "category"
    INTEGER = "integer"
    STRING = "string"
    MULTIPLE_CHOICE = "multiple_choice"
    MULTIPLE_SELECT = "multiple_select"
    DATE = "date"


class FormValidator:
    # form validation class that validates form submissions against template constraints

    def __init__(self, form_template):
        if not form_template:
            raise ValidationError("Form template is required")
        self.form_template = form_template

        # handle both dict and ORM objects
        if hasattr(form_template, 'questions'):
            questions = form_template.questions
        elif isinstance(form_template, dict) and 'questions' in form_template:
            questions = form_template['questions']
        else:
            questions = []
        
        # build questions lookup with proper handling of different formats
        self.questions_by_id = {}
        for q in questions:
            if hasattr(q, 'id'):
                self.questions_by_id[q.id] = q
            elif isinstance(q, dict) and 'id' in q:
                self.questions_by_id[q['id']] = q
    
    def validate_form_submission(self, form_data: Dict[str, Any]) -> List[ValidationError]:
        # validates an entire form submission against the template constraints

        errors = []
        
        # handle case where form_data is None - this is invalid
        if form_data is None:
            return [ValidationError("Form data is required")]
        
        # form_data should be a dictionary
        if not isinstance(form_data, dict):
            return [ValidationError("Form data must be a dictionary")]
        
        # get submitted answers - handle missing 'questions' key
        form_questions = form_data.get("questions", [])
        if not isinstance(form_questions, list):
            return [ValidationError("Form questions must be a list")]
        
        # build lookup dictionary for submitted questions
        submitted_questions = {}
        try:
            submitted_questions = {q["id"]: q for q in form_questions if isinstance(q, dict) and "id" in q}
        except (KeyError, TypeError) as e:
            return [ValidationError(f"Invalid form question structure: {str(e)}")]
        
        # handle case where template has no questions
        template_questions = getattr(self.form_template, 'questions', None) or []
    
        # handle case where form_data and template mismatch
        if not template_questions:
            if submitted_questions:
                errors.append(ValidationError("Form template has no questions defined, but form submission contains questions"))
            return errors
        
        # validate each question in the template
        for question in template_questions:
            try:
                question_id = getattr(question, 'id', None)
                if not question_id:
                    continue
                
                self._validate_question(question, submitted_questions.get(question_id))
            except ValidationError as e:
                errors.append(e)
            except Exception as e:
                question_id = getattr(question, 'id', 'unknown')
                errors.append(ValidationError(f"Validation error for question {question_id}: {str(e)}", question_id))
        
        # check for submitted questions that don't exist in template
        template_question_ids = {q.id for q in template_questions if hasattr(q, 'id')}
        for submitted_id in submitted_questions.keys():
            if submitted_id not in template_question_ids:
                errors.append(ValidationError(f"Question '{submitted_id}' is not defined in the template", submitted_id))
        
        return errors
    
    def _validate_question(self, question: Any, submitted_question: Optional[Dict]) -> None:
        """validates a single question against its template constraints"""
        
        # get question properties with proper handling of dict vs ORM
        def get_attr(obj, attr, default=None):
            if hasattr(obj, attr):
                return getattr(obj, attr)
            elif isinstance(obj, dict):
                return obj.get(attr, default)
            return default
        
        question_id = get_attr(question, 'id')
        if not question_id:
            raise ValidationError("Question missing required 'id' attribute")
        
        question_type = get_attr(question, 'question_type')
        if not question_type:
            raise ValidationError(f"Question '{question_id}' missing required 'question_type' attribute", question_id)
        
        # normalize question type
        if hasattr(question_type, 'value'):  # Handle enum
            question_type = question_type.value
        question_type = str(question_type).lower()
        
        # skip category questions
        if question_type == QuestionTypeEnum.CATEGORY.value:
            return
        
        # check if question is required and has answers
        is_required = get_attr(question, 'required', False)
        has_answers = submitted_question and submitted_question.get("answers") and self._has_valid_answers(submitted_question.get("answers"))
        
        if is_required and not has_answers:
            # check if question was completely missing from submission
            if submitted_question is None:
                raise ValidationError(f"Question '{question_id}' is missing but required", question_id)
            else:
                raise ValidationError(f"Question '{question_id}' is required", question_id)
        
        if not has_answers:
            return
        
        # extract and validate answers
        try:
            answers = self._extract_answers(submitted_question["answers"])
        except Exception as e:
            raise ValidationError(f"Error extracting answers for question '{question_id}': {str(e)}", question_id)
        
        # type-specific validation
        if question_type == QuestionTypeEnum.INTEGER.value:
            self._validate_number_field(question, answers)
        elif question_type == QuestionTypeEnum.STRING.value:
            self._validate_text_field(question, answers)
        elif question_type == QuestionTypeEnum.MULTIPLE_CHOICE.value:
            self._validate_multiple_choice_field(question, answers)
        elif question_type == QuestionTypeEnum.MULTIPLE_SELECT.value:
            self._validate_multiple_select_field(question, answers)
        elif question_type == QuestionTypeEnum.DATE.value:
            self._validate_date_field(question, answers)
        else:
            raise ValidationError(f"Unknown question type '{question_type}' for question '{question_id}'", question_id)
    
    def _has_valid_answers(self, answers_data) -> bool:
        # checks if answers data contains valid (non-empty) answers
        
        if answers_data is None:
            return False
        
        if isinstance(answers_data, str):
            if not answers_data.strip():
                return False
            try:
                parsed = json.loads(answers_data)
                return self._has_valid_parsed_answers(parsed)
            except json.JSONDecodeError:
                return bool(answers_data.strip())
        elif isinstance(answers_data, dict):
            return self._has_valid_parsed_answers(answers_data)
        elif isinstance(answers_data, list):
            return len(answers_data) > 0 and any(self._is_valid_answer_value(ans) for ans in answers_data)
        else:
            return self._is_valid_answer_value(answers_data)
    
    def _has_valid_parsed_answers(self, parsed_data) -> bool:
        # checks if parsed JSON data contains valid answers
        
        if isinstance(parsed_data, dict):
            # check for special mc_id_array format
            if "mc_id_array" in parsed_data:
                mc_array = parsed_data["mc_id_array"]
                return isinstance(mc_array, list) and len(mc_array) > 0
            # check all values in the dictionary
            return any(self._is_valid_answer_value(value) for value in parsed_data.values())
        elif isinstance(parsed_data, list):
            return len(parsed_data) > 0 and any(self._is_valid_answer_value(ans) for ans in parsed_data)
        else:
            return self._is_valid_answer_value(parsed_data)
    
    def _is_valid_answer_value(self, value) -> bool:
        # checks if a single answer value is valid (not None, not empty string)
        
        if value is None:
            return False
        if isinstance(value, str):
            return bool(value.strip())
        if isinstance(value, (int, float)):
            return True
        return bool(value)
    
    def _extract_answers(self, answers_data) -> List[Any]:
        # extract and normalize answers from various possible formats
    
        if answers_data is None:
            return []
        
        if isinstance(answers_data, str):
            # handle empty strings
            if not answers_data.strip():  
                return []
            try:
                # handle format like {"number": 4} or {"text": "value"}
                parsed = json.loads(answers_data)
                if isinstance(parsed, dict):
                    # special handling for mc_id_array format
                    if "mc_id_array" in parsed:
                        return parsed["mc_id_array"]
                    return [v for v in parsed.values() if self._is_valid_answer_value(v)]
                elif isinstance(parsed, list):
                    return [v for v in parsed if self._is_valid_answer_value(v)]
                else:
                    return [parsed] if self._is_valid_answer_value(parsed) else []
            # if JSON parsing fails, treat as literal string
            except json.JSONDecodeError:
                return [answers_data] if answers_data.strip() else []
        elif isinstance(answers_data, dict):
            # extract values from dictionary format
            # special handling for mc_id_array format
            if "mc_id_array" in answers_data:
                return answers_data["mc_id_array"]
            return [v for v in answers_data.values() if self._is_valid_answer_value(v)]
        elif isinstance(answers_data, list):
            # already in list format
            return [v for v in answers_data if self._is_valid_answer_value(v)]
        else:
            # wrap primitive values in list
            return [answers_data] if self._is_valid_answer_value(answers_data) else []
    
    def _validate_number_field(self, question: Any, answers: List[Any]) -> None:
        """validates integer/number field constraints"""
        def get_attr(obj, attr, default=None):
            if hasattr(obj, attr):
                return getattr(obj, attr)
            elif isinstance(obj, dict):
                return obj.get(attr, default)
            return default
        
        question_id = get_attr(question, 'id')
        
        if not answers or len(answers) != 1:
            raise ValidationError(f"Number field '{question_id}' must have exactly one answer", question_id)
        
        try:
            value = float(answers[0])
        except (ValueError, TypeError):
            raise ValidationError(f"Number field '{question_id}' must contain a valid number", question_id)
        
        # check constraints
        num_min = get_attr(question, 'num_min')
        num_max = get_attr(question, 'num_max')
        
        if num_min is not None and value < num_min:
            raise ValidationError(f"Number field '{question_id}' must be at least {num_min}", question_id)
        
        if num_max is not None and value > num_max:
            raise ValidationError(f"Number field '{question_id}' must be at most {num_max}", question_id)
    
    def _validate_text_field(self, question: Any, answers: List[Any]) -> None:
        """validates string/text field constraints"""
        def get_attr(obj, attr, default=None):
            if hasattr(obj, attr):
                return getattr(obj, attr)
            elif isinstance(obj, dict):
                return obj.get(attr, default)
            return default
        
        question_id = get_attr(question, 'id')
        
        if not answers or len(answers) != 1:
            raise ValidationError(f"Text field '{question_id}' must have exactly one answer", question_id)
        
        text_value = str(answers[0])
        
        # check constraints
        string_max_length = get_attr(question, 'string_max_length')
        if string_max_length is not None and len(text_value) > string_max_length:
            raise ValidationError(f"Text field '{question_id}' exceeds maximum length of {string_max_length}", question_id)
        
        string_max_lines = get_attr(question, 'string_max_lines')
        if string_max_lines is not None:
            line_count = len(text_value.split('\n'))
            if line_count > string_max_lines:
                raise ValidationError(f"Text field '{question_id}' exceeds maximum lines of {string_max_lines}", question_id)
    
    def _validate_multiple_choice_field(self, question: Any, answers: List[Any]) -> None:
        # validates multiple choice (single selection) field constraints
        
        if not answers or len(answers) != 1:
            raise ValidationError(f"Multiple choice field '{question.id}' must have exactly one answer", question.id)
        
        # handle mc_id (index-based) selection
        selected_value = answers[0]
        valid_options = self._get_valid_options(question)
        
        if not valid_options:
            raise ValidationError(f"Multiple choice field '{question.id}' has no valid options defined", question.id)
        
        # check if the selected value is valid (either by index or by value)
        if not self._is_valid_option_selection(selected_value, valid_options):
            raise ValidationError(f"Multiple choice field '{question.id}' contains invalid option index: {selected_value}", question.id)
    
    def _validate_multiple_select_field(self, question: Any, answers: List[Any]) -> None:
        # validates multiple select (multiple selection) field constraints
        
        if not answers:
            raise ValidationError(f"Multiple select field '{question.id}' must have at least one answer", question.id)
        
        valid_options = self._get_valid_options(question)
        
        if not valid_options:
            raise ValidationError(f"Multiple select field '{question.id}' has no valid options defined", question.id)
        
        for answer in answers:
            if not self._is_valid_option_selection(answer, valid_options):
                raise ValidationError(f"Multiple select field '{question.id}' has invalid option: {answer}", question.id)
    
    def _is_valid_option_selection(self, selected_value, valid_options: List[str]) -> bool:
        # checks if a selected value is valid for multiple choice/select questions
        
        try:
            # try index-based selection first
            selected_index = int(selected_value)
            if 0 <= selected_index < len(valid_options):
                return True
        except (ValueError, TypeError):
            pass
        
        # fallback to string comparison
        return str(selected_value) in valid_options
    
    def _validate_date_field(self, question: Any, answers: List[Any]) -> None:
        # validates date field constraints including format and date range restrictions

        if not answers or len(answers) != 1:
            raise ValidationError(f"Date field '{question.id}' must have exactly one answer", question.id)
        
        try:
            # handle various date formats
            date_str = str(answers[0])
            if 'T' in date_str:
                # ISO format with time - handle timezone indicators
                date_value = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                # date only format - assume start of day
                date_value = datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            raise ValidationError(f"Date field '{question.id}' must be a valid date", question.id)
        
        current_date = datetime.now()
        
        # check past dates constraint
        allow_past_dates = getattr(question, 'allow_past_dates', True)  
        if not allow_past_dates and date_value.date() < current_date.date():
            raise ValidationError(f"Date field '{question.id}' does not allow past dates", question.id)
        
        # check future dates constraint
        allow_future_dates = getattr(question, 'allow_future_dates', True)  
        if not allow_future_dates and date_value.date() > current_date.date():
            raise ValidationError(f"Date field '{question.id}' does not allow future dates", question.id)
    
    def _get_valid_options(self, question: Any) -> List[str]:
        """extracts valid options for multiple choice and multiple select questions"""
        valid_options = []
        
        # handle ORM objects with lang_versions
        if hasattr(question, 'lang_versions'):
            lang_versions = question.lang_versions
            if lang_versions:
                for lang_version in lang_versions:
                    mc_options = getattr(lang_version, 'mc_options', None)
                    if isinstance(mc_options, str):
                        try:
                            mc_options = json.loads(mc_options)
                        except json.JSONDecodeError:
                            continue
                    
                    if mc_options:
                        for option in mc_options:
                            if isinstance(option, dict):
                                opt_value = option.get('opt')
                            else:
                                opt_value = getattr(option, 'opt', None)
                            if opt_value is not None:
                                valid_options.append(str(opt_value))
        
        # handle dict format with lang_versions
        elif isinstance(question, dict) and 'lang_versions' in question:
            lang_versions = question['lang_versions']
            for lang_version in lang_versions:
                mc_options = lang_version.get('mc_options', [])
                for option in mc_options:
                    if isinstance(option, dict):
                        opt_value = option.get('opt')
                        if opt_value is not None:
                            valid_options.append(str(opt_value))
        
        # handle direct mc_options (backward compatibility)
        else:
            mc_options = None
            if hasattr(question, 'mc_options'):
                mc_options = question.mc_options
            elif isinstance(question, dict):
                mc_options = question.get('mc_options', [])
            
            if mc_options:
                if isinstance(mc_options, str):
                    try:
                        mc_options = json.loads(mc_options)
                    except json.JSONDecodeError:
                        mc_options = []
                
                for option in mc_options:
                    if isinstance(option, dict):
                        opt_value = option.get('opt')
                    else:
                        opt_value = getattr(option, 'opt', None)
                    if opt_value is not None:
                        valid_options.append(str(opt_value))
        
        return valid_options
    
    def _extract_option_value(self, option) -> Optional[str]:
        # extracts the option value from various option formats
        
        if isinstance(option, dict):
            return option.get('opt')
        elif hasattr(option, 'opt'):
            return getattr(option, 'opt', None)
        else:
            return str(option) if option is not None else None


def validate_form_against_template(form_data: Dict[str, Any], form_template) -> List[ValidationError]:
    # validates form_data against template constraints 
    
    if not form_template:
        return [ValidationError("Form template is required")]
    
    # check for None specifically, but allow empty dict {}
    if form_data is None:
        return [ValidationError("Form data is required")]

    try:
        validator = FormValidator(form_template)
        return validator.validate_form_submission(form_data)
    except Exception as e:
        return [ValidationError(f"Validation system error: {str(e)}")]


def convert_validation_errors_to_response(validation_errors: List[ValidationError]) -> ValidationErrorResponse:
    # converts internal ValidationError objects to API response format for endpoints and frontend
    
    field_errors = []
    for error in validation_errors:
        field_errors.append(FieldError(
            field=error.field_id,
            message=error.message
        ))
    
    return ValidationErrorResponse(validation_errors=field_errors)


def validate_and_abort_on_errors(form_data: Dict[str, Any], form_template) -> None:
    # validates form data and automatically aborts HTTP request with 400 error if validation fails
    # a convenience function for Flask endpoints that want automatic error handling
    
    validation_errors = validate_form_against_template(form_data, form_template)
    
    if validation_errors:
        error_response = convert_validation_errors_to_response(validation_errors)
        # convert to dict for Flask abort response
        error_dict = error_response.model_dump()
        abort(400, description=error_dict)