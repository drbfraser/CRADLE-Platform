import os

from flask import current_app, request, send_from_directory
from flask_restful import Resource, abort

from api.decorator import roles_required
from enums import RoleEnum


# /api/upload/admin
class Root(Resource):
    @staticmethod
    @roles_required([RoleEnum.ADMIN])
    def get():
        return send_from_directory(
            current_app.config["UPLOAD_FOLDER"], "cradle_sms_relay.apk",
        )

    @staticmethod
    @roles_required([RoleEnum.ADMIN])
    def post():
        if "file" not in request.files:
            abort(400, message="No file part")

        file = request.files["file"]

        if not file or not is_allowed_file(file.filename):
            abort(422, message="File not allowed")

        file.save(
            os.path.join(current_app.config["UPLOAD_FOLDER"], "cradle_sms_relay.apk"),
        )

        return {"message": "File saved"}, 201


def is_allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() == "apk"
