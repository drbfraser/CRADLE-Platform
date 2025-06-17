'''
i have included comments to hopefully help out, note that there are things that we assume the implementation of.
currently, james is still working on the database design aspect so our potential work is quite limited.
the following is similar to forms.py, so feel free to look at other files for inspiration as well.
there are more (according to your swagger), that should be implemented here but those are extra for now.
feel free to implement those, or maybe try to do the workflow_templates.py.
'''

import json                                                                     

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data
from common import user_utils
from common.api_utils import ( # look inside the file, we haven't defined it yet but it's just an ID for Pydantic Models
    WorkflowIdPath,
)
from common.commonUtil import get_current_time
from data import crud, marshal
from models import WorkflowInstanceOrm, PatientOrm, WorkflowTemplateOrm # again, not defined yet (database side) but we'll assume

# create an API blueprint for workflow-related routes - organizes related routes (like /workflows) into a modular, reusable structure
# /api/workflows
api_workflows = APIBlueprint(
    name="workflows",
    import_name=__name__,
    url_prefix="/workflows",
    abp_tags=[Tag(name="Workflows", description="Manage Workflow Instances")],
    abp_security=[{"jwt": []}], 
)


# inspired from forms, and is very bare, we might need to change or tweak depending on further implementation 
# /api/workflows [POST]
@api_workflows.post("", responses={201: dict})
def create_workflow():
    """Create a new workflow instance"""
    data = request.json  # Extract JSON body from the request

    # validate required fields
    if "patient_id" not in data:
        return abort(400, description="Missing required field: patient_id")

    # verify patient exists
    patient = crud.read(PatientOrm, id=data["patient_id"])
    if patient is None:
        return abort(404, description="Patient does not exist.")

    # if a workflow template is provided, validate it exists
    if "workflow_template_id" in data:
        template = crud.read(WorkflowTemplateOrm, id=data["workflow_template_id"])
        if template is None:
            return abort(404, description="Workflow template does not exist.")

    # get the current user from the JWT (authentication)
    user = user_utils.get_current_user_from_jwt()
    user_id = str(user["id"])

    # create a new WorkflowInstance ORM object - this format was given to me by james, for templates format and whatnot, ask him
    workflow = WorkflowInstanceOrm(
        patient_id=data["patient_id"],
        workflow_template_id=data.get("workflow_template_id"),
        last_edited_by=user_id,
        start_date=get_current_time(),
        last_edited=get_current_time(),
        status=data.get("status", "Active"),
        completion_date=data.get("completion_date")
    )

    # persist the new workflow to the database (create)
    crud.create(workflow, refresh=True)

    # return the created workflow (serialized) and 201 Created status
    # this just makes the format into a dictionary so it's suitable for for JSON responses
    return marshal.marshal(workflow, shallow=True), 201


# /api/workflows/<string:workflow_id> [GET]
@api_workflows.get("/<string:workflow_id>", responses={200: dict})
def get_workflow(path: WorkflowIdPath):
    """Get a workflow instance by its ID"""
    # look up the workflow in the database
    workflow = crud.read(WorkflowInstanceOrm, id=path.workflow_id)
    if workflow is None:
        return abort(404, description=f"No workflow with ID: {path.workflow_id}.")

    # return the found workflow (serialized)
    return marshal.marshal(workflow, shallow=True)


# /api/workflows/<string:workflow_id> [GET]
@api_workflows.put("/<string:workflow_id>", responses={200: dict})
def update_workflow(path: WorkflowIdPath):
    """Update an existing workflow instance"""
    # fetch the existing workflow
    workflow = crud.read(WorkflowInstanceOrm, id=path.workflow_id)
    if workflow is None:
        return abort(404, description=f"No workflow with ID: {path.workflow_id}.")

    data = request.json  # get JSON update data from the request

    # get the current user (for audit logging)
    user = user_utils.get_current_user_from_jwt()
    user_id = str(user["id"])

    # update modifiable fields if provided
    workflow.status = data.get("status", workflow.status)
    workflow.completion_date = data.get("completion_date", workflow.completion_date)
    workflow.last_edited_by = user_id
    workflow.last_edited = get_current_time()

    # commit the update to the database
    crud.update()

    # return the updated workflow (serialized)
    return marshal.marshal(workflow, shallow=True), 200