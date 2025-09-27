# ruff: noqa: F401
# Stub for data.db_operations to help Pylance/pyright resolve re-exports

from typing import Any

from . import (
    common_crud as common_crud,
)
from . import (
    form_queries as form_queries,
)
from . import (
    patient_queries as patient_queries,
)
from . import (
    phone_utils as phone_utils,
)
from . import (
    pregnancy_medical_utils as pregnancy_medical_utils,
)
from . import (
    referral_queries as referral_queries,
)
from . import (
    stats_queries as stats_queries,
)
from . import (
    supervision as supervision,
)
from . import (
    workflow_management as workflow_management,
)
from .common_crud import (
    create,
    create_all,
    create_model,
    delete,
    delete_all,
    delete_by,
    find,
    read,
    read_all,
    update,
)
from .form_queries import (
    read_form_template_language_versions,
    read_questions,
)
from .patient_queries import (
    read_admin_patient,
    read_medical_records,
    read_patient_all_records,
    read_patient_current_medical_record,
    read_patient_list,
    read_patient_timeline,
    read_patients,
    read_readings,
)
from .phone_utils import (
    get_all_relay_phone_numbers,
    is_phone_number_relay,
)
from .pregnancy_medical_utils import (
    has_conflicting_pregnancy_record,
)
from .referral_queries import (
    read_referral_list,
    read_referrals_or_assessments,
)
from .stats_queries import (
    get_days_with_readings,
    get_export_data,
    get_referred_patients,
    get_sent_referrals,
    get_total_color_readings,
    get_total_readings_completed,
    get_unique_patients_with_readings,
)
from .supervision import (
    add_vht_to_supervise,
    get_supervised_vhts,
)
from .workflow_management import (
    delete_workflow,
    delete_workflow_classification,
    delete_workflow_step,
    delete_workflow_step_branch,
    read_instance_steps,
    read_rule_group,
    read_template_steps,
    read_workflow_classifications,
    read_workflow_instances,
    read_workflow_templates,
    read_workflows_in_collection,
)

# Expose db_session type (runtime value comes from data package)
db_session: Any

__all__ = [
    # common_crud
    "create",
    "create_all",
    "create_model",
    "delete",
    "delete_all",
    "delete_by",
    "find",
    "read",
    "read_all",
    "update",
    # form_queries
    "read_form_template_language_versions",
    "read_questions",
    # patient_queries
    "read_admin_patient",
    "read_medical_records",
    "read_patient_all_records",
    "read_patient_current_medical_record",
    "read_patient_list",
    "read_patient_timeline",
    "read_patients",
    "read_readings",
    # phone_utils
    "get_all_relay_phone_numbers",
    "is_phone_number_relay",
    # pregnancy_medical_utils
    "has_conflicting_pregnancy_record",
    # referral_queries
    "read_referral_list",
    "read_referrals_or_assessments",
    # stats_queries
    "get_days_with_readings",
    "get_export_data",
    "get_referred_patients",
    "get_sent_referrals",
    "get_total_color_readings",
    "get_total_readings_completed",
    "get_unique_patients_with_readings",
    # supervision
    "add_vht_to_supervise",
    "get_supervised_vhts",
    # workflow_management
    "delete_workflow",
    "delete_workflow_classification",
    "delete_workflow_step",
    "delete_workflow_step_branch",
    "read_instance_steps",
    "read_rule_group",
    "read_template_steps",
    "read_workflow_classifications",
    "read_workflow_instances",
    "read_workflow_templates",
    "read_workflows_in_collection",
    # misc
    "db_session",
]