from flask_openapi3.blueprint import APIBlueprint

from api.resources.assessments import api_assessments

api = APIBlueprint(
    name="api",
    import_name=__name__,
    url_prefix="/api",
)

api.register_api(api_assessments)
