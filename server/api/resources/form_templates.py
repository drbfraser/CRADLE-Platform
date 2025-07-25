import json
from typing import Optional

from flask import abort, make_response
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from pydantic import Field, ValidationError

import data
from api.decorator import roles_required
from common import form_utils
from common.api_utils import (
    FormTemplateIdPath,
)
from data import crud, marshal
from enums import ContentTypeEnum, RoleEnum
from models import FormClassificationOrm, FormTemplateOrm
from service import serialize
from validation import CradleBaseModel
from validation.file_upload import FileUploadForm
from validation.formTemplates import (
    FormTemplateLang,
    FormTemplateList,
    FormTemplateModel,
    FormTemplateUpload,
)

# /api/forms/templates
api_form_templates = APIBlueprint(
    name="form_templates",
    import_name=__name__,
    url_prefix="/forms/templates",
    abp_tags=[Tag(name="Form Templates", description="")],
    abp_security=[{"jwt": []}],
)


class GetAllFormTemplatesQuery(CradleBaseModel):
    include_archived: bool = Field(
        False, description="If true, archived Form Templates will be included."
    )


# /api/forms/templates [GET]
@api_form_templates.get("", responses={200: FormTemplateList})
def get_all_form_templates(query: GetAllFormTemplatesQuery):
    """Get All Form Templates"""
    filters: dict = {}
    filters["archived"] = 1 if query.include_archived else 0

    form_templates = crud.read_all(FormTemplateOrm, **filters)

    return [marshal.marshal(f, shallow=True) for f in form_templates]


def handle_form_template_upload(form_template: FormTemplateUpload):
    """
    Common logic for handling uploaded form template. Whether it was uploaded
    as a file, or in the request body.
    """
    form_template_dict = form_template.model_dump()
    form_utils.assign_form_or_template_ids(FormTemplateOrm, form_template_dict)
    form_classification_dict = form_template_dict["classification"]
    del form_template_dict["classification"]

    # FormClassification is basically the name of the FormTemplate. FormTemplates can have multiple versions, and the FormClassification is used to group different versions of the same FormTemplate.
    form_classification_orm = crud.read(
        FormClassificationOrm,
        id=form_classification_dict["id"],
    )
    if form_classification_orm is None:
        form_classification_orm = marshal.unmarshal(
            FormClassificationOrm, form_classification_dict
        )
    else:
        if crud.read(
            FormTemplateOrm,
            form_classification_id=form_classification_orm.id,
            version=form_template.version,
        ):
            raise ValueError(
                "Form Template with the same version already exists - change the version to upload."
            )

        previous_template = crud.read(
            FormTemplateOrm,
            form_classification_id=form_classification_orm.id,
            archived=False,
        )
        if previous_template is not None:
            previous_template.archived = True
            data.db_session.commit()

    form_template_dict["form_classification_id"] = form_classification_orm.id

    form_template_orm = marshal.unmarshal(FormTemplateOrm, form_template_dict)
    form_template_orm.classification = form_classification_orm
    crud.create(form_template_orm, refresh=True)
    return marshal.marshal(form_template_orm, shallow=True)


# /api/forms/templates [POST]
@api_form_templates.post("", responses={201: FormTemplateModel})
@roles_required([RoleEnum.ADMIN])
def upload_form_template_file(form: FileUploadForm):
    """
    Upload Form Template VIA File
    Accepts Form Template as a file.
    Supports `.json` and `.csv` file formats.
    """
    file_contents = {}
    file = form.file
    file_str = str(file.stream.read(), "utf-8")

    if file.content_type == ContentTypeEnum.JSON.value:
        try:
            file_contents = json.loads(file_str)
        except json.JSONDecodeError:
            return abort(415, description="File content is not valid JSON format")
    elif file.content_type == ContentTypeEnum.CSV.value:
        try:
            file_contents = form_utils.getFormTemplateDictFromCSV(file_str)
        except RuntimeError as err:
            return abort(400, description=err.args[0])
        except TypeError as err:
            return abort(400, description=err.args[0])
        except Exception:
            return abort(
                400,
                description="Something went wrong while parsing the CSV file.",
            )
    else:
        return abort(422, description="Invalid content-type.")

    try:
        form_template = FormTemplateUpload(**file_contents)
        return handle_form_template_upload(form_template), 201

    except ValidationError as e:
        return abort(422, description=e.errors())

    except ValueError as err:
        return abort(code=409, description=str(err))


# /api/forms/templates/body [POST]
@api_form_templates.post("/body", responses={201: FormTemplateModel})
@roles_required([RoleEnum.ADMIN])
def upload_form_template_body(body: FormTemplateUpload):
    """
    Upload Form Template VIA Request Body
    Accepts Form Template through the request body, rather than as a file.
    """
    try:
        return handle_form_template_upload(body), 201

    except ValueError as err:
        return abort(code=409, description=str(err))


# /api/forms/templates/<string:form_template_id>/versions [GET]
@api_form_templates.get("<string:form_template_id>/versions")
def get_form_template_versions(path: FormTemplateIdPath):
    """Get Form Template Versions"""
    form_template = crud.read(FormTemplateOrm, id=path.form_template_id)
    if form_template is None:
        return abort(404, description=f"No form with ID: {path.form_template_id}")

    lang_list = crud.read_form_template_language_versions(form_template)

    return {"lang_versions": lang_list}, 200


# /api/forms/templates/<string:form_template_id>/versions/<string:version>/csv
class FormTemplateVersionPath(FormTemplateIdPath):
    version: str = Field(..., description="Form Template version.")


# /api/forms/templates/<string:form_template_id>/versions/<string:version>/csv [GET]
@api_form_templates.get(
    "/<string:form_template_id>/versions/<string:version>/csv",
    responses={
        200: {"content": {"text/csv": {"schema": {"type": "string"}}}},
    },
)
def get_form_template_version_as_csv(path: FormTemplateVersionPath):
    """Get Form Template Version as CSV"""
    filters: dict = {
        "id": path.form_template_id,
        "version": path.version,
    }

    form_template = crud.read(
        FormTemplateOrm,
        **filters,
    )

    if form_template is None:
        return abort(404, description=f"No form with ID: {path.form_template_id}")

    form_template_csv: str = form_utils.getCsvFromFormTemplate(form_template)

    response = make_response(form_template_csv)
    response.headers["Content-Disposition"] = "attachment; filename=form_template.csv"
    response.headers["Content-Type"] = "text/csv"
    return response


# /api/forms/templates/<string:form_template_id>
class GetFormTemplateQuery(CradleBaseModel):
    lang: Optional[str] = None


# /api/forms/templates/<string:form_template_id> [GET]
@api_form_templates.get("/<string:form_template_id>", responses={200: FormTemplateLang})
def get_form_template_language_version(
    path: FormTemplateIdPath, query: GetFormTemplateQuery
):
    """Get Form Template"""
    form_template = crud.read(FormTemplateOrm, id=path.form_template_id)
    if form_template is None:
        return abort(404, description=f"No form with ID: {path.form_template_id}")

    version = query.lang
    if version is None:
        # admin user get template of full versions
        blank_template = marshal.marshal(
            form_template,
            shallow=False,
            if_include_versions=True,
        )

        return blank_template

    available_versions = crud.read_form_template_language_versions(
        form_template,
        refresh=True,
    )

    if version not in available_versions:
        return abort(
            404,
            description=f"FormTemplate(id={path.form_template_id}) doesn't have language version = {version}",
        )

    blank_template = marshal.marshal_template_to_single_version(form_template, version)
    return blank_template, 200


class ArchiveFormTemplateBody(CradleBaseModel):
    archived: bool = Field(
        True,
        description="If true, the Form Template will be archived. If false, the Form Template will be unarchived.",
    )


# /api/forms/templates/<string:form_template_id> [PUT]
@api_form_templates.put(
    "/<string:form_template_id>", responses={200: FormTemplateModel}
)
def archive_form_template(path: FormTemplateIdPath, body: ArchiveFormTemplateBody):
    """Archive Form Template"""
    # TODO: It would make more sense to take the "archived" bool from query params.
    form_template = crud.read(FormTemplateOrm, id=path.form_template_id)

    if form_template is None:
        return abort(
            404, description=f"No form template with ID: {path.form_template_id}"
        )

    form_template.archived = body.archived
    data.db_session.commit()
    data.db_session.refresh(form_template)

    return marshal.marshal(form_template, shallow=True), 201


# /api/forms/templates/blank/<string:form_template_id> [GET]
@api_form_templates.get(
    "/blank/<string:form_template_id>",
    responses={200: FormTemplateLang},
)
def get_blank_form_template(path: FormTemplateIdPath, query: GetFormTemplateQuery):
    """Get Blank Form Template"""
    form_template = crud.read(FormTemplateOrm, id=path.form_template_id)
    if form_template is None:
        return abort(404, description=f"No form with ID: {path.form_template_id}")

    version = query.lang
    if version is None:
        # admin user get template of full versions
        blank_template = marshal.marshal(
            form_template,
            shallow=False,
            if_include_versions=True,
        )

        blank_template = serialize.serialize_blank_form_template(blank_template)
        return blank_template

    available_versions = crud.read_form_template_language_versions(
        form_template,
        refresh=True,
    )
    if version not in available_versions:
        abort(
            404,
            description=f"Template(id={path.form_template_id}) doesn't have language version = {version}",
        )
        return None

    blank_template = marshal.marshal_template_to_single_version(
        form_template,
        version,
    )

    blank_template = serialize.serialize_blank_form_template(blank_template)

    return blank_template, 200
