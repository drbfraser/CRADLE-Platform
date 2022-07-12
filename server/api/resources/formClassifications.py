from email import message
import json
from pprint import pp

import api.util as util
import data
import data.crud as crud
import data.marshal as marshal
import service.serialize as serialize
from api.decorator import roles_required
from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort
from models import ContentTypeEnum, FormClassification, FormTemplate, Question, RoleEnum
from utils import get_current_time, pprint
import utils
from validation import formClassifications
from werkzeug.datastructures import FileStorage


# /api/forms/classifications
class Root(Resource):
    @staticmethod
    @roles_required([RoleEnum.ADMIN])
    @swag_from(
        "../../specifications/form-classifications-post.yml",
        methods=["POST"],
        endpoint="form_classifications",
    )
    def post():
        req = {}

        # provide file upload method from web
        if "file" in request.files:
            file: FileStorage = request.files["file"]

            if file.content_type not in ContentTypeEnum.listValues():
                abort(400, message="File Type not supported")

            file_str = str(file.read(), "utf-8")
            if file.content_type == ContentTypeEnum.JSON.value:
                try:
                    req = json.loads(file_str)
                except json.JSONDecodeError:
                    abort(400, message="File content is not valid json-format")

            elif file.content_type == ContentTypeEnum.CSV.value:
                try:
                    req = util.getFormTemplateDictFromCSV(file_str)
                except RuntimeError as err:
                    abort(400, message=err.args[0])
                except TypeError as err:
                    pprint(err)
                    abort(400, message=err.args[0])
                except:
                    abort(
                        400, message="Something went wrong while parsing the CSV file."
                    )
        else:
            req = request.get_json(force=True)

        if len(req) == 0:
            abort(400, message="Request body is empty")

        if req.get("id") is not None:
            if crud.read(FormClassification, id=req["id"]):
                abort(404, message="Form classification already exists")

        error_message = formClassifications.validate_template(req)
        if error_message:
            abort(404, message=error_message)

        if req.get("name") is not None:
            if crud.read(FormClassification, id=req["name"]):
                abort(
                    404,
                    message="Form classification with the same name already exists",
                )

        util.assign_form_or_template_ids(FormClassification, req)

        formClassification = marshal.unmarshal(FormClassification, req)

        crud.create(formClassification, refresh=True)

        return marshal.marshal(formClassification, shallow=True), 201
