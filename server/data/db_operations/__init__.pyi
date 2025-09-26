"""Type stub for `data.db_operations` facade.

Purpose
-------
Provide a **static view** of the dynamically re-exported API so editors and
type checkers (VS Code/Pylance, pyright, mypy) can resolve symbols like
`crud.create`, show hover docs, “Go to Definition/References,” and CodeLens
usage counts — while leaving runtime behavior untouched.

How it works
------------
- Python executes the runtime `__init__.py`; this `.pyi` file is **not run**.
- Pylance prefers `.pyi` for types, so the re-exports here tell the analyzer
  which names exist and where they come from (e.g., `common_crud.create`).
- We also re-expose select submodules so namespaced access (e.g. `crud.patient_queries`)
  gets completion.

Maintenance
-----------
Whenever you change the public API in `data/db_operations/__init__.py`:
1. Add/remove the same names here using `from .<module> import <name>`.
2. (Optional) Re-expose namespaced submodules via `from . import <module> as <module>`.
3. Reload VS Code’s language server to re-index.

Notes
-----
- This file must only contain **type information**: imports, annotations, overloads,
  Protocols, etc. No runtime logic.
- A mismatch between the stub and the runtime file *does not* break the app, but
  editor hovers/completions may be misleading until updated.
- Performance: no runtime cost — stubs are not executed.
"""

# Stub for data.db_operations to help Pylance/pyright resolve re-exports
from typing import Any

# Database session (runtime-provided from config)
db_session: Any

from .common_crud import (
    create, create_model, create_all, read, read_all, find, update, delete,
    delete_by, delete_all,
)

from .form_queries import (
    read_form_template_language_versions, read_questions,
)

from .patient_queries import (
    read_admin_patient, read_patient_all_records, read_patient_current_medical_record, read_patient_list, read_patients, read_patient_timeline, read_readings, read_medical_records,
)

from .phone_utils import (
    get_all_relay_phone_numbers, is_phone_number_relay,
)

from .pregnancy_medical_utils import (
    has_conflicting_pregnancy_record,
)

from .referral_queries import (
    read_referral_list, read_referrals_or_assessments,
)

from .stats_queries import (
    get_days_with_readings, get_export_data, get_referred_patients, get_sent_referrals, get_total_color_readings, get_total_readings_completed, get_unique_patients_with_readings,
)

from .supervision import (
    add_vht_to_supervise, get_supervised_vhts,
)

from .workflow_management import (
    read_workflow_classifications, read_workflow_templates, read_workflow_instances, read_workflows_in_collection, read_rule_group, read_instance_steps, read_template_steps, delete_workflow_step_branch,
    delete_workflow_step, delete_workflow, delete_workflow_classification,
)

from . import common_crud as common_crud
from . import form_queries as form_queries
from . import patient_queries as patient_queries
from . import referral_queries as referral_queries
from . import stats_queries as stats_queries
from . import workflow_management as workflow_management
from . import supervision as supervision
from . import phone_utils as phone_utils
from . import pregnancy_medical_utils as pregnancy_medical_utils
