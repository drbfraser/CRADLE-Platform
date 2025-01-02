import json
from typing import Optional

from flask import abort, make_response
from flask_openapi3.blueprint import APIBlueprint
from pydantic import Field

import data
from api import util
from api.decorator import roles_required
from common.api_utils import (
    FormTemplateIdPath,
)
from data import crud, marshal
from enums import ContentTypeEnum, RoleEnum
from models import FormClassificationOrm, FormTemplateOrm
from service import serialize
from validation import CradleBaseModel
from validation.file_upload import FileUploadForm
from validation.formTemplates import FormTemplateValidator

# /api/forms/templates
api_form_templates = APIBlueprint(
    name="form_templates",
    import_name=__name__,
    url_prefix="/forms/templates",
)


class GetAllFormTemplatesQuery(CradleBaseModel):
    include_archived: bool = Field(
        False, description="If true, archived Form Templates will be included."
    )


# /api/forms/templates [GET]
@api_form_templates.get("")
def get_all_form_templates(query: GetAllFormTemplatesQuery):
    filters: dict = {}
    if not query.include_archived:
        filters["archived"] = 0

    form_templates = crud.read_all(FormTemplateOrm, **filters)

    return [marshal.marshal(f, shallow=True) for f in form_templates]


class FormTemplateFileUploadForm(FileUploadForm):
    file_type: ContentTypeEnum = Field(..., description="File type.")


# /api/forms/templates [POST]
@api_form_templates.post("")
@roles_required([RoleEnum.ADMIN])
def create_form_template(form: FormTemplateFileUploadForm):
    file_contents = {}
    file = form.file
    file_str = str(file.stream.read(), "utf-8")

    if file.content_type == ContentTypeEnum.JSON.value:
        try:
            file_contents = json.loads(file_str)
        except json.JSONDecodeError:
            return abort(415, message="File content is not valid JSON format")
    elif file.content_type == ContentTypeEnum.CSV.value:
        try:
            file_contents = util.getFormTemplateDictFromCSV(file_str)
        except RuntimeError as err:
            return abort(400, message=err.args[0])
        except TypeError as err:
            return abort(400, message=err.args[0])
        except Exception:
            return abort(
                400,
                message="Something went wrong while parsing the CSV file.",
            )
    form_template_model = FormTemplateValidator(**file_contents)
    new_form_template = form_template_model.model_dump()

    classification = crud.read(
        FormClassificationOrm,
        name=form_template_model.classification.name,
    )

    # FormClassification is basically the name of the FormTemplate. FormTemplates can have multiple versions, and the FormClassification is used to group different versions of the same FormTemplate.
    if classification is not None:
        if crud.read(
            FormTemplateOrm,
            form_classification_id=classification.id,
            version=new_form_template["version"],
        ):
            abort(
                409,
                message="Form template with the same version already exists - change the version to upload",
            )

        del new_form_template["classification"]

        new_form_template["form_classification_id"] = classification.id

        previous_template = crud.read(
            FormTemplateOrm,
            form_classification_id=classification.id,
            archived=False,
        )

        if previous_template is not None:
            previous_template.archived = True
            data.db_session.commit()

    util.assign_form_or_template_ids(FormTemplateOrm, new_form_template)

    form_template = marshal.unmarshal(FormTemplateOrm, new_form_template)

    crud.create(form_template, refresh=True)

    return marshal.marshal(form_template, shallow=True), 201


# /api/forms/templates/<string:form_template_id>/versions [GET]
@api_form_templates.get("<string:form_template_id>/versions")
def get_form_template_versions(path: FormTemplateIdPath):
    form_template = crud.read(FormTemplateOrm, id=path.form_template_id)
    if form_template is None:
        return abort(404, message=f"No form with ID: {path.form_template_id}")

    # Why is it called "lang_versions" and not just "versions"?
    lang_list = crud.read_form_template_versions(form_template)

    return {"lang_versions": lang_list}, 200


# /api/forms/templates/<string:form_template_id>/versions/<string:version>/csv
class FormTemplateVersionPath(FormTemplateIdPath):
    version: str = Field(..., description="Form Template version.")


# /api/forms/templates/<string:form_template_id>/versions/<string:version>/csv [GET]
@api_form_templates.get("/<string:form_template_id>/versions/<string:version>/csv")
def get_form_template_version_as_csv(path: FormTemplateVersionPath):
    filters: dict = {
        "id": path.form_template_id,
        "version": path.version,
    }

    form_template = crud.read(
        FormTemplateOrm,
        **filters,
    )

    if form_template is None:
        return abort(404, message=f"No form with ID: {path.form_template_id}")

    form_template_csv: str = util.getCsvFromFormTemplate(form_template)

    response = make_response(form_template_csv)
    response.headers["Content-Disposition"] = "attachment; filename=form_template.csv"
    response.headers["Content-Type"] = "text/csv"
    return response


# /api/forms/templates/<string:form_template_id>
class GetFormTemplateQuery(CradleBaseModel):
    lang: Optional[str]


# /api/forms/templates/<string:form_template_id> [GET]
@api_form_templates.get("/<string:form_template_id>")
def get_form_template(path: FormTemplateIdPath, query: GetFormTemplateQuery):
    form_template = crud.read(FormTemplateOrm, id=path.form_template_id)
    if form_template is None:
        return abort(404, message=f"No form with ID: {path.form_template_id}")

    # WHY IS THE QUERY PARAM CALLED "lang" AND NOT "version"???
    version = query.lang
    if version is None:
        # admin user get template of full versions
        return marshal.marshal(
            form_template,
            shallow=False,
            if_include_versions=True,
        )

    available_versions = crud.read_form_template_versions(
        form_template,
        refresh=True,
    )
    """ 
    What is a "language version"? Isn't the "version" field used to track 
    modifications to the forms?
    """
    if version not in available_versions:
        return abort(
            404,
            message=f"Template(id={path.form_template_id}) doesn't have language version = {version}",
        )

    return marshal.marshal_template_to_single_version(form_template, version)


class ArchiveFormTemplateBody(CradleBaseModel):
    archived: bool = Field(
        True,
        description="If true, the Form Template will be archived. If false, the Form Template will be unarchived.",
    )


# /api/forms/templates/<string:form_template_id> [PUT]
def archive_form_template(path: FormTemplateIdPath, body: ArchiveFormTemplateBody):
    # TODO: It would make more sense to take the "archived" bool from query params.
    form_template = crud.read(FormTemplateOrm, id=path.form_template_id)

    if form_template is None:
        return abort(404, message=f"No form template with ID: {path.form_template_id}")

    form_template.archived = body.archived
    data.db_session.commit()
    data.db_session.refresh(form_template)

    return marshal.marshal(form_template, shallow=True), 201


# /api/forms/templates/blank/<string:form_template_id>


# /api/forms/templates/blank/<string:form_template_id> [GET]
api_form_templates.get("/blank/<string:form_template_id>")


def get_blank_form_template(path: FormTemplateIdPath, query: GetFormTemplateQuery):
    form_template = crud.read(FormTemplateOrm, id=path.form_template_id)
    if form_template is None:
        return abort(404, message=f"No form with ID: {path.form_template_id}")

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

    available_versions = crud.read_form_template_versions(
        form_template,
        refresh=True,
    )
    if version not in available_versions:
        abort(
            404,
            message=f"Template(id={path.form_template_id}) doesn't have language version = {version}",
        )
        return None

    blank_template = marshal.marshal_template_to_single_version(
        form_template,
        version,
    )
    blank_template = serialize.serialize_blank_form_template(blank_template)

    return blank_template, 200
