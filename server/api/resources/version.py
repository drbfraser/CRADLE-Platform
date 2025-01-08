from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import config as config

# /api/version
api_version = APIBlueprint(
    name="version",
    import_name=__name__,
    url_prefix="/version",
    abp_tags=[Tag(name="Version", description="")],
)


# /api/version [GET]
@api_version.get("")
def get_version():
    """Get App Version"""
    return {"version": config.app_version}, 200
