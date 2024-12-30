from flask_openapi3.blueprint import APIBlueprint

from api.resources.assessments import api_assessments
from api.resources.facilities import api_facilities

"""
The `flask-openapi3` plugin for Flask is used to generate API Specification 
Documentation automatically from the Pydantic models that are used to validate 
incoming request data.
https://luolingchun.github.io/flask-openapi3/v3.x/

It also allows us to pass the request data into the Flask Views as parameters, 
by defining their types as Pydantic Models. The parameters of the View must be
given specific names, depending on where the data is to be taken from, 
i.e., `body` for the request body. 
See https://luolingchun.github.io/flask-openapi3/v3.x/Usage/Request/ for all of 
the parameter names.
"""

api = APIBlueprint(
    name="api",
    import_name=__name__,
    url_prefix="/api",
)

api.register_api(api_assessments)
api.register_api(api_facilities)
