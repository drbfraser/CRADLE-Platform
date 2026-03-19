"""
Workflow variable catalogue API.

GET /api/workflow/variables - List available variables (optional filters: namespace, type, collection)
GET /api/workflow/variables/<variable_tag> - Get a single variable by tag
GET /api/workflow/variables/rule-logic?rule_group_id=<id> - Get variable logic (e.g. variable_tag, operator, value) for a branch condition
"""

import json
from typing import Optional

from flask import request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common.commonUtil import abort_not_found
from enums import WorkflowVariableTypeEnum
from models import WorkflowVariableCatalogueOrm
from service.workflow.evaluate.rule_logic_parser import parse_single_comparison_from_rule
from validation.workflow_api_models import (
    GetWorkflowVariablesResponse,
    VariableLogicModel,
    WorkflowVariableCatalogueItemModel,
    WorkflowVariableDetailModel,
)

api_workflow_variables = APIBlueprint(
    name="workflow_variables",
    import_name=__name__,
    url_prefix="/workflow/variables",
    abp_tags=[
        Tag(
            name="Workflow Variables",
            description="Variable catalogue for workflow rules",
        )
    ],
    abp_security=[{"jwt": []}],
)


def _orm_to_item_model(
    orm: WorkflowVariableCatalogueOrm,
) -> WorkflowVariableCatalogueItemModel:
    """Build API model from ORM; parse field_path JSON if present."""
    field_path_list: Optional[list] = None
    if orm.field_path:
        try:
            parsed = json.loads(orm.field_path)
            if isinstance(parsed, list):
                field_path_list = [str(x) for x in parsed]
        except (json.JSONDecodeError, TypeError):
            pass
    return WorkflowVariableCatalogueItemModel(
        tag=orm.tag,
        description=orm.description or None,
        type=orm.variable_type.value
        if hasattr(orm.variable_type, "value")
        else str(orm.variable_type),
        namespace=orm.namespace or None,
        collection_name=orm.collection_name or None,
        field_path=field_path_list,
        is_computed=orm.is_computed or False,
        is_dynamic=orm.is_dynamic or False,
    )


# GET /api/workflow/variables?namespace=&type=&collection=
@api_workflow_variables.get("", responses={200: GetWorkflowVariablesResponse})
def get_workflow_variables():
    """List all available workflow variables with optional filters."""
    namespace = request.args.get("namespace", type=str) or None
    type_filter = request.args.get("type", type=str) or None
    collection = request.args.get("collection", type=str) or None

    query = WorkflowVariableCatalogueOrm.query
    if namespace is not None:
        query = query.filter(WorkflowVariableCatalogueOrm.namespace == namespace)
    if type_filter is not None:
        try:
            query = query.filter(
                WorkflowVariableCatalogueOrm.variable_type
                == WorkflowVariableTypeEnum(type_filter)
            )
        except ValueError:
            query = query.filter(False)  # invalid type -> no matches
    if collection is not None:
        query = query.filter(WorkflowVariableCatalogueOrm.collection_name == collection)

    rows = query.order_by(WorkflowVariableCatalogueOrm.tag.asc()).all()
    variables = [_orm_to_item_model(row) for row in rows]
    response = GetWorkflowVariablesResponse(variables=variables)
    return response.model_dump(), 200


# GET /api/workflow/variables/rule-logic?rule_group_id=<id>
@api_workflow_variables.get(
    "/rule-logic",
    responses={200: VariableLogicModel},
)
def get_rule_logic():
    """
    Get variable logic (variable_tag, operator, value) for a branch condition rule.
    Used during workflow instance to show e.g. "if patient.age >= 18".
    Only supports a single-comparison rule; returns 404 if rule is compound or not found.
    """
    rule_group_id = request.args.get("rule_group_id", type=str)
    if not rule_group_id:
        abort_not_found("rule_group_id query parameter is required.")
    rule_group = crud.read_rule_group(rule_group_id)
    if rule_group is None:
        abort_not_found(f"Rule group with id '{rule_group_id}' not found.")
    rule = rule_group.rule
    parsed = parse_single_comparison_from_rule(rule)
    if parsed is None:
        abort_not_found(
            f"Rule group '{rule_group_id}' is not a single comparison (e.g. one of >, <, >=, <=, ==, !=)."
        )
    model = VariableLogicModel(**parsed)
    return model.model_dump(), 200


# GET /api/workflow/variables/<variable_tag>
@api_workflow_variables.get(
    "/<string:variable_tag>",
    responses={200: WorkflowVariableDetailModel},
)
def get_workflow_variable(variable_tag: str):
    """Get detailed information about a specific variable by tag."""
    orm = crud.read_by_filter(
        WorkflowVariableCatalogueOrm,
        WorkflowVariableCatalogueOrm.tag == variable_tag,
    )
    if orm is None:
        abort_not_found(f"Workflow variable with tag '{variable_tag}' not found.")

    item = _orm_to_item_model(orm)
    detail = WorkflowVariableDetailModel(
        **item.model_dump(),
        examples=None,  # TODO: no examples stored yet
    )
    return detail.model_dump(), 200
