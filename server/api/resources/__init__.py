from flask_openapi3.blueprint import APIBlueprint

from api.resources.assessments import api_assessments
from api.resources.auth import api_auth
from api.resources.facilities import api_facilities
from api.resources.form_classifications import api_form_classifications
from api.resources.form_templates import api_form_templates
from api.resources.forms import api_form_submissions
from api.resources.medical_records import api_medical_records
from api.resources.patient_associations import api_patient_associations
from api.resources.patients import api_patients
from api.resources.patients_android import api_patients_mobile
from api.resources.pregnancies import api_pregnancies
from api.resources.readings import api_readings
from api.resources.referrals import api_referrals
from api.resources.relay_server_phone_numbers import api_relay_phone_numbers
from api.resources.sms_relay import api_sms_relay
from api.resources.stats import api_stats
from api.resources.sync import api_sync
from api.resources.upload import api_upload
from api.resources.users import api_users
from api.resources.version import api_version
from api.resources.workflow_classifications import api_workflow_classifications
from api.resources.workflow_templates import api_workflow_templates
from api.resources.workflow_template_steps import api_workflow_template_steps
from api.resources.workflow_instances import api_workflow_instances
from api.resources.workflow_instance_steps import api_workflow_instance_steps

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
    name="api", import_name=__name__, url_prefix="/api", abp_security=[{"jwt": []}]
)

api.register_api(api_auth)
api.register_api(api_assessments)
api.register_api(api_facilities)
api.register_api(api_form_classifications)
api.register_api(api_form_templates)
api.register_api(api_form_submissions)
api.register_api(api_medical_records)
api.register_api(api_patient_associations)
api.register_api(api_patients_mobile)
api.register_api(api_patients)
api.register_api(api_pregnancies)
api.register_api(api_readings)
api.register_api(api_referrals)
api.register_api(api_relay_phone_numbers)
api.register_api(api_sms_relay)
api.register_api(api_stats)
api.register_api(api_sync)
api.register_api(api_upload)
api.register_api(api_users)
api.register_api(api_version)
api.register_api(api_workflow_classifications)
api.register_api(api_workflow_templates)
api.register_api(api_workflow_template_steps)
api.register_api(api_workflow_instances)
api.register_api(api_workflow_instance_steps)
