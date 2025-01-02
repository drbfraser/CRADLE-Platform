from flask_openapi3.blueprint import APIBlueprint

import config as config

# /api/version
api_version = APIBlueprint(
    name="version",
    import_name=__name__,
    url_prefix="/api/version",
)


# /api/version [GET]
@api_version.get("")
def get_version():
    return {"version": config.app_version}, 200
