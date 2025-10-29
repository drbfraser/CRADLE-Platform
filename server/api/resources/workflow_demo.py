"""
Workflow Rule Engine Demo
"""
from __future__ import annotations

from typing import TYPE_CHECKING

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from models import PatientOrm
from service.workflow.datasourcing import data_sourcing
from service.workflow.datasourcing.data_catalogue import get_catalogue
from service.workflow.evaluate.rules_engine import RulesEngineFacade, RuleStatus
from validation import CradleBaseModel

if TYPE_CHECKING:
    from common.api_utils import PatientIdPath

# /api/workflow-demo
api_workflow_demo = APIBlueprint(
    name="workflow_demo",
    import_name=__name__,
    url_prefix="/workflow-demo",
    abp_tags=[Tag(name="Workflow Demo", description="Rule engine demonstration")],
)


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


def _evaluate_single_branch(
    branch: dict, patient_id: str, catalogue: dict
) -> dict | None:
    """
    Evaluate a single workflow branch for a patient.

    :param branch: Branch configuration with rule and datasources
    :param patient_id: Patient identifier
    :param catalogue: Data catalogue for resolving datasources
    :returns: Dict with evaluation results, or None if evaluation fails
    """
    try:
        resolved = data_sourcing.resolve_datasources(
            patient_id, branch["datasources"], catalogue
        )

        engine = RulesEngineFacade(branch["rule"], resolved)
        result = engine.evaluate({})

        return {
            "id": branch["id"],
            "name": branch["name"],
            "rule": branch["rule"],
            "resolved_data": resolved,
            "status": result.status.value,
            "missing_variables": (
                list(result.missing_variables) if result.missing_variables else []
            ),
        }
    except Exception:
        return None


@api_workflow_demo.get(
    "/evaluate/<string:patient_id>", responses={200: RuleDemoResponse}
)
def evaluate_workflow_demo(path: PatientIdPath):
    """
    Demo: Evaluate workflow rules for a patient.

    Shows how the rule engine selects branches based on patient data.
    Uses short-circuit evaluation - returns first TRUE branch.
    """
    patient = crud.read(PatientOrm, id=path.patient_id)
    if not patient:
        return abort(404, description=f"Patient {path.patient_id} not found")

    catalogue = get_catalogue()

    branch_results = []
    selected_branch = None

    for branch in DEMO_WORKFLOW["branches"]:
        branch_result = _evaluate_single_branch(branch, path.patient_id, catalogue)

        if branch_result:
            branch_results.append(branch_result)

            if (
                branch_result.get("status") == RuleStatus.TRUE.value
                and selected_branch is None
            ):
                selected_branch = branch_result

    try:
        resolved_patient = data_sourcing.resolve_datasources(
            path.patient_id, ["$patient.age"], catalogue
        )
        age = resolved_patient.get("$patient.age")
    except Exception:
        age = None

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
