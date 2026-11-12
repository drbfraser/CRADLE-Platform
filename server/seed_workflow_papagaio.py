import json

import data.db_operations as crud
from common.commonUtil import get_current_time
from manage import (
    create_lang_text,
    create_workflow_template_step_with_form_and_branches,
)
from models import (
    FormClassificationOrmV2,
    FormQuestionTemplateOrmV2,
    FormTemplateOrmV2,
    RuleGroupOrm,
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepOrm,
    db,
)

PAPAGAIO_DIAGNOSIS_TEMPLATE_ID = "papagaio_diagnosis_workflow_template"
PAPAGAIO_DIAGNOSIS_CLASSIFICATION_ID = "papagaio_diagnosis_workflow_classification"
YES_NO = ["Yes", "No"]


# 1 WORKFLOW CLASSIFICATION
def create_papagaio_diagnosis_workflow_classification():
    if (
        crud.read(WorkflowClassificationOrm, id=PAPAGAIO_DIAGNOSIS_CLASSIFICATION_ID)
        is not None
    ):
        return

    db.session.add(
        WorkflowClassificationOrm(
            id=PAPAGAIO_DIAGNOSIS_CLASSIFICATION_ID,
            name_string_id=create_lang_text("PAPAGAIO Diagnosis"),
        )
    )
    db.session.commit()


# 2 WORKFLOW QUESTIONS
def create_papagaio_diagnosis_question(
    form_template_id,
    order,
    user_question_id,
    text,
    question_type,
    options=None,
    num_min=None,
    num_max=None,
    units=None,
):
    return FormQuestionTemplateOrmV2(
        id=f"pd_{user_question_id}",
        form_template_id=form_template_id,
        category_index=None,
        order=order,
        question_string_id=create_lang_text(text),
        question_type=question_type,
        user_question_id=user_question_id,
        required=True,
        allow_future_dates=True,
        allow_past_dates=True,
        num_min=num_min,
        num_max=num_max,
        string_max_length=None,
        units=units,
        visible_condition="[]",
        string_max_lines=None,
        mc_options=(
            json.dumps([create_lang_text(o) for o in options]) if options else None
        ),
    )


# 3 WORKFLOW FORMS
def create_papagaio_diagnosis_form_v2(form_key, form_name, questions):
    classification_id = f"pd_{form_key}_classification"
    form_template_id = f"pd_{form_key}_form"

    if crud.read(FormTemplateOrmV2, id=form_template_id) is not None:
        return form_template_id

    if crud.read(FormClassificationOrmV2, id=classification_id) is None:
        db.session.add(
            FormClassificationOrmV2(
                id=classification_id, name_string_id=create_lang_text(form_name)
            )
        )

    form_template_orm = FormTemplateOrmV2(
        id=form_template_id,
        version=1,
        archived=False,
        form_classification_id=classification_id,
    )
    for order, question in enumerate(questions):
        form_template_orm.questions.append(
            create_papagaio_diagnosis_question(form_template_id, order, **question)
        )

    db.session.add(form_template_orm)
    db.session.commit()
    return form_template_id


def create_papagaio_diagnosis_forms_v2():
    return {
        "eligibility": create_papagaio_diagnosis_form_v2(
            "eligibility",
            "PAPAGAIO Diagnosis Eligibility Form",
            [
                {
                    "user_question_id": "gestational_weeks",
                    "text": "Gestational age (completed weeks)",
                    "question_type": "INTEGER",
                    "num_min": 0,
                    "num_max": 45,
                    "units": "weeks",
                },
                {
                    "user_question_id": "suspected_pe",
                    "text": "Is pre-eclampsia suspected?",
                    "question_type": "MULTIPLE_CHOICE",
                    "options": YES_NO,
                },
                {
                    "user_question_id": "informed_consent",
                    "text": "Is the patient able to provide, and has she given, informed consent?",
                    "question_type": "MULTIPLE_CHOICE",
                    "options": YES_NO,
                },
                {
                    "user_question_id": "multifetal_pregnancy",
                    "text": "Is this a multifetal pregnancy?",
                    "question_type": "MULTIPLE_CHOICE",
                    "options": YES_NO,
                },
                {
                    "user_question_id": "confirmed_pe",
                    "text": "Does the patient already have a confirmed diagnosis of pre-eclampsia?",
                    "question_type": "MULTIPLE_CHOICE",
                    "options": YES_NO,
                },
            ],
        ),
        "randomisation": create_papagaio_diagnosis_form_v2(
            "randomisation",
            "PAPAGAIO Diagnosis Randomisation Form",
            [
                {
                    "user_question_id": "allocation",
                    "text": "Which testing strategy was the patient randomised to?",
                    "question_type": "MULTIPLE_CHOICE",
                    "options": ["Revealed", "Concealed"],
                },
            ],
        ),
        "plgf": create_papagaio_diagnosis_form_v2(
            "plgf",
            "PAPAGAIO Diagnosis PlGF Testing Form",
            [
                {
                    "user_question_id": "plgf_result",
                    "text": "PlGF result",
                    "question_type": "DECIMAL",
                    "num_min": 0,
                    "units": "pg/mL",
                },
            ],
        ),
        "antenatal_care": create_papagaio_diagnosis_form_v2(
            "antenatal_care",
            "PAPAGAIO Diagnosis Antenatal Care Form",
            [
                {
                    "user_question_id": "antenatal_care_provided",
                    "text": "Has usual antenatal care (including best practice guidance) been provided?",
                    "question_type": "MULTIPLE_CHOICE",
                    "options": YES_NO,
                },
            ],
        ),
        "primary_outcomes": create_papagaio_diagnosis_form_v2(
            "primary_outcomes",
            "PAPAGAIO Diagnosis Co-primary Outcomes Form",
            [
                {
                    "user_question_id": "severe_maternal_outcome",
                    "text": "Did the patient have a severe adverse maternal outcome?",
                    "question_type": "MULTIPLE_CHOICE",
                    "options": YES_NO,
                },
                {
                    "user_question_id": "perinatal_death",
                    "text": "Was there a perinatal death?",
                    "question_type": "MULTIPLE_CHOICE",
                    "options": YES_NO,
                },
            ],
        ),
        "secondary_outcomes": create_papagaio_diagnosis_form_v2(
            "secondary_outcomes",
            "PAPAGAIO Diagnosis Secondary Outcomes Form",
            [
                {
                    "user_question_id": "ga_at_delivery",
                    "text": "Gestational age at delivery",
                    "question_type": "INTEGER",
                    "num_min": 0,
                    "num_max": 45,
                    "units": "weeks",
                },
                {
                    "user_question_id": "mode_of_birth",
                    "text": "Mode of birth",
                    "question_type": "MULTIPLE_CHOICE",
                    "options": ["Vaginal", "Assisted vaginal", "Caesarean"],
                },
                {
                    "user_question_id": "days_to_diagnosis",
                    "text": "Time to diagnosis",
                    "question_type": "INTEGER",
                    "num_min": 0,
                    "units": "days",
                },
                {
                    "user_question_id": "maternal_quality_of_life",
                    "text": "Maternal quality of life score",
                    "question_type": "INTEGER",
                    "num_min": 0,
                    "num_max": 100,
                },
                {
                    "user_question_id": "healthcare_resource_use",
                    "text": "Healthcare resource use and costs",
                    "question_type": "STRING",
                },
            ],
        ),
    }


def create_papagaio_diagnosis_branch(branch_id, step_id, target_step_id, rule=None):
    branch = {
        "id": branch_id,
        "step_id": step_id,
        "target_step_id": target_step_id,
        "condition_id": None,
        "condition": None,
    }
    if rule is not None:
        rule_group = RuleGroupOrm(id=f"rg_{branch_id}", rule=json.dumps(rule))
        db.session.add(rule_group)
        branch["condition_id"] = rule_group.id
        branch["condition"] = rule_group
    return branch


# 4 WORKFLOW STEPS
def create_papagaio_diagnosis_workflow_template_steps(forms):
    eligible_rule = {
        "and": [
            {">=": [{"var": "forms[latest].gestational_weeks"}, 24]},
            {"<=": [{"var": "forms[latest].gestational_weeks"}, 36]},
            {"==": [{"var": "forms[latest].suspected_pe"}, "Yes"]},
            {">=": [{"var": "patient.age"}, 16]},
            {"==": [{"var": "forms[latest].informed_consent"}, "Yes"]},
            {"==": [{"var": "forms[latest].multifetal_pregnancy"}, "No"]},
            {"==": [{"var": "forms[latest].confirmed_pe"}, "No"]},
        ]
    }
    ineligible_rule = {
        "and": [
            {"==": [{"var": "forms[latest].multifetal_pregnancy"}, "Yes"]},
            {"==": [{"var": "forms[latest].confirmed_pe"}, "Yes"]},
        ]
    }

    steps = [
        (
            "pd_eligibility_step",
            "Enrollment Criteria",
            (
                "Check inclusion and exclusion criteria.\n\n"
                "**Inclusion Criteria**\n"
                "- Pregnant: 24–36 weeks' gestation\n"
                "- Suspected PE\n"
                "- Aged ≥ 16 years\n"
                "- Able to provide informed consent\n\n"
                "**Exclusion Criteria**\n"
                "- Multifetal pregnancy\n"
                "- Confirmed diagnosis of PE"
            ),
            forms["eligibility"],
            [
                create_papagaio_diagnosis_branch(
                    "pd_eligibility_to_randomisation",
                    "pd_eligibility_step",
                    "pd_randomisation_step",
                    eligible_rule,
                ),
                create_papagaio_diagnosis_branch(
                    "pd_eligibility_to_not_eligible",
                    "pd_eligibility_step",
                    "pd_not_eligible_step",
                    ineligible_rule,
                ),
            ],
        ),
        (
            "pd_randomisation_step",
            "Randomisation",
            "Allocation: randomise to testing strategy (1:1), n = 680.",
            forms["randomisation"],
            [
                create_papagaio_diagnosis_branch(
                    "pd_randomisation_to_revealed",
                    "pd_randomisation_step",
                    "pd_revealed_plgf_step",
                    {"==": [{"var": "forms[latest].allocation"}, "Revealed"]},
                ),
                create_papagaio_diagnosis_branch(
                    "pd_randomisation_to_concealed",
                    "pd_randomisation_step",
                    "pd_concealed_plgf_step",
                    {"==": [{"var": "forms[latest].allocation"}, "Concealed"]},
                ),
            ],
        ),
        (
            "pd_revealed_plgf_step",
            "Revealed PlGF Testing",
            "PlGF result is revealed.",
            forms["plgf"],
            [
                create_papagaio_diagnosis_branch(
                    "pd_revealed_to_antenatal",
                    "pd_revealed_plgf_step",
                    "pd_antenatal_care_step",
                )
            ],
        ),
        (
            "pd_concealed_plgf_step",
            "Concealed PlGF Testing",
            "PlGF result is concealed.",
            forms["plgf"],
            [
                create_papagaio_diagnosis_branch(
                    "pd_concealed_to_antenatal",
                    "pd_concealed_plgf_step",
                    "pd_antenatal_care_step",
                )
            ],
        ),
        (
            "pd_antenatal_care_step",
            "Usual Antenatal Care",
            (
                "Follow-up: usual antenatal care, including guidance and support on "
                "best practice management."
            ),
            forms["antenatal_care"],
            [
                create_papagaio_diagnosis_branch(
                    "pd_antenatal_to_primary",
                    "pd_antenatal_care_step",
                    "pd_primary_outcomes_step",
                )
            ],
        ),
        (
            "pd_primary_outcomes_step",
            "Co-primary Outcomes",
            (
                "Analysis: co-primary outcomes.\n\n"
                "- Maternal: Severe adverse maternal outcomes\n"
                "- Perinatal: Perinatal death"
            ),
            forms["primary_outcomes"],
            [
                create_papagaio_diagnosis_branch(
                    "pd_primary_to_secondary",
                    "pd_primary_outcomes_step",
                    "pd_secondary_outcomes_step",
                )
            ],
        ),
        (
            "pd_secondary_outcomes_step",
            "Secondary Outcomes",
            (
                "Analysis: secondary outcomes.\n\n"
                "- Gestational age at delivery\n"
                "- Mode of birth\n"
                "- Time to diagnosis\n"
                "- Maternal quality of life\n"
                "- Healthcare resource use and costs"
            ),
            forms["secondary_outcomes"],
            [],
        ),
        (
            "pd_not_eligible_step",
            "Not Eligible",
            "Patient does not meet the PAPAGAIO diagnosis enrollment criteria.",
            None,
            [],
        ),
    ]

    for step_id, name, description, form_id, branches in steps:
        if crud.read(WorkflowTemplateStepOrm, id=step_id) is not None:
            continue

        template_step = {
            "id": step_id,
            "name_string_id": create_lang_text(name),
            "description_string_id": create_lang_text(description),
            "expected_completion": None,
            "last_edited": get_current_time(),
            "form_id": form_id,
            "workflow_template_id": PAPAGAIO_DIAGNOSIS_TEMPLATE_ID,
        }
        create_workflow_template_step_with_form_and_branches(
            template_step, form_id, branches
        )


def create_papagaio_diagnosis_workflow_template():
    if crud.read(WorkflowTemplateOrm, id=PAPAGAIO_DIAGNOSIS_TEMPLATE_ID) is not None:
        return

    create_papagaio_diagnosis_workflow_classification()
    forms = create_papagaio_diagnosis_forms_v2()

    papagaio_diagnosis_workflow_template = {
        "id": PAPAGAIO_DIAGNOSIS_TEMPLATE_ID,
        "description_string_id": create_lang_text(
            "PAPAGAIO is an NIHR Global Health Research Group focussed on reducing maternal and perinatal"
            "mortality and morbidity from pre-eclampsia, across low- and middle-income countries"
        ),
        "archived": False,
        "starting_step_id": "pd_eligibility_step",
        "date_created": get_current_time(),
        "last_edited": get_current_time(),
        "version": "V1",
        "classification_id": PAPAGAIO_DIAGNOSIS_CLASSIFICATION_ID,
    }

    papagaio_study_classification_orm = crud.read(
        WorkflowClassificationOrm, id=PAPAGAIO_DIAGNOSIS_CLASSIFICATION_ID
    )
    papagaio_study_template_orm = WorkflowTemplateOrm(
        classification=papagaio_study_classification_orm,
        **papagaio_diagnosis_workflow_template,
    )

    db.session.add(papagaio_study_template_orm)
    db.session.commit()

    create_papagaio_diagnosis_workflow_template_steps(forms)
