"""
Workflow Rule Engine Demo

"""

from datetime import datetime

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common.api_utils import PatientIdPath
from models import PatientOrm
from service.workflow.datasourcing import data_sourcing
from service.workflow.datasourcing.data_catalogue import get_catalogue
from service.workflow.evaluate.rules_engine import RulesEngineFacade, RuleStatus
from validation import CradleBaseModel

# /api/workflow-demo
api_workflow_demo = APIBlueprint(
    name="workflow_demo",
    import_name=__name__,
    url_prefix="/workflow-demo",
    abp_tags=[Tag(name="Workflow Demo", description="Rule engine demonstration")],
)


def calculate_age(dob):
    """Calculate age from date of birth"""
    if isinstance(dob, str):
        dob = datetime.strptime(dob, "%Y-%m-%d")
    today = datetime.now()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


# Mock workflow for demo
DEMO_WORKFLOW = {
    "branches": [
        {
            "id": "branch_senior",
            "name": "Senior Care Pathway",
            "rule": '{">=": [{"var": "patient.age"}, 65]}',
            "datasources": ["$patient.age"],
        },
        {
            "id": "branch_maternity",
            "name": "Maternity Care Pathway",
            "rule": '{"==": [{"var": "patient.is_pregnant"}, 1]}',
            "datasources": ["$patient.is_pregnant"],
        },
        {
            "id": "branch_general",
            "name": "General Care Pathway",
            "rule": '{">=": [{"var": "patient.age"}, 0]}',
            "datasources": ["$patient.age"],
        },
    ]
}


class RuleDemoResponse(CradleBaseModel):
    patient: dict
    branch_results: list
    selected_branch: dict | None


# /api/workflow-demo/evaluate/<patient_id> [GET]
@api_workflow_demo.get(
    "/evaluate/<string:patient_id>", responses={200: RuleDemoResponse}
)
def evaluate_workflow_demo(path: PatientIdPath):
    """
    Demo: Evaluate workflow rules for a patient
    Shows how the rule engine selects branches based on patient data
    """
    patient = crud.read(PatientOrm, id=path.patient_id)
    if not patient:
        return abort(404, description=f"Patient {path.patient_id} not found")

    age = calculate_age(patient.date_of_birth)

    catalogue = get_catalogue()

    branch_results = []
    selected_branch = None

    for branch in DEMO_WORKFLOW["branches"]:
        resolved = data_sourcing.resolve_datasources(
            path.patient_id, branch["datasources"], catalogue
        )

        if "$patient.age" in branch["datasources"]:
            resolved["$patient.age"] = age

        engine = RulesEngineFacade(branch["rule"], resolved)
        result = engine.evaluate({})

        branch_result = {
            "id": branch["id"],
            "name": branch["name"],
            "rule": branch["rule"],
            "resolved_data": resolved,
            "status": result.status.value,
            "missing_variables": list(result.missing_variables)
            if result.missing_variables
            else [],
        }

        branch_results.append(branch_result)

        if result.status == RuleStatus.TRUE and selected_branch is None:
            selected_branch = branch_result

    return {
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "age": age,
            "sex": patient.sex,
            "is_pregnant": bool(patient.is_pregnant),
            "date_of_birth": patient.date_of_birth.isoformat(),
        },
        "branch_results": branch_results,
        "selected_branch": selected_branch,
    }, 200


