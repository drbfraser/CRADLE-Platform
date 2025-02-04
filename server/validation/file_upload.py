from flask_openapi3.models.file import FileStorage
from pydantic import field_validator
from werkzeug.utils import secure_filename

from validation import CradleBaseModel


class FileUploadForm(CradleBaseModel):
    """
    Files are passed into the View through the `form` parameter.
    https://luolingchun.github.io/flask-openapi3/v3.x/Usage/Request/#form
    """

    file: FileStorage  # request.files["file"]

    @field_validator("file")
    @classmethod
    def validate_filename(cls, file: FileStorage):
        if file.filename is None:
            raise ValueError("Missing filename.")
        # Check that filename is secure.
        if not secure_filename(file.filename):
            raise ValueError("Insecure filename.")
        return file
