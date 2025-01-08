import os

from flask import abort, current_app, send_from_directory
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from api.decorator import roles_required
from enums import RoleEnum
from validation.file_upload import FileUploadForm

# /api/upload
api_upload = APIBlueprint(
    name="upload",
    import_name=__name__,
    url_prefix="/upload",
    abp_tags=[Tag(name="Upload", description="")],
    abp_security=[{"jwt": []}],
)


# /api/upload/admin [GET]
@api_upload.get("/admin")
@roles_required([RoleEnum.ADMIN])
def get_sms_relay_apk():
    return send_from_directory(
        current_app.config["UPLOAD_FOLDER"],
        "cradle_sms_relay.apk",
    )


# /api/upload/admin [POST]
@api_upload.post("/admin")
@roles_required([RoleEnum.ADMIN])
def upload_apk_file(form: FileUploadForm):
    file = form.file

    if not is_allowed_file(file.filename):
        return abort(422, description="File not allowed")

    file.save(
        os.path.join(current_app.config["UPLOAD_FOLDER"], "cradle_sms_relay.apk"),
    )

    return {"message": "File saved"}, 201


def is_allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() == "apk"
