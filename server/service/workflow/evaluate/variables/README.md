# Workflow Branch Variable Extraction

> **Disclaimer:** This README is intentionally high‑level and may lag the code. For exact behavior, see tests under `server/tests/service/workflow/evaluate/variables/`.

This module extracts **JsonLogic variables** from **workflow branch conditions** for the **current step only**.

---

## Location

```
server/service/workflow/evaluate/variables/
  __init__.py
  extractor.py     # extract_variables_from_current_step(...)
  models.py        # WorkflowVariableReport, StepVariableInfo, BranchVariableInfo
  utils.py         # helpers (casting/iteration)
```

---

## Public API

```python
from service.workflow.evaluate.variables import (
    extract_variables_from_current_step,
    WorkflowVariableReport,
)

# current step only
report: WorkflowVariableReport = extract_variables_from_current_step(
    template_model, current_step_id="st-1"
)
```

### Return types (overview)

```python
WorkflowVariableReport
  .workflow_template_id: str | None
  .steps: list[StepVariableInfo]       # exactly one: the current step
  .all_variables: list[str]            # sorted, de‑duplicated within that step

StepVariableInfo
  .step_id: str | None
  .branches: list[BranchVariableInfo]

BranchVariableInfo
  .branch_id: str | None
  .rule_id: str | None
  .variables: list[str]                # sorted, unique per branch
```

---

## Input requirements

- **Model only:** Input must be a `WorkflowTemplateModel` (dicts and other models raise `TypeError`).
- **Rule format:** Each branch `condition.rule` is a **JSON string** containing JsonLogic.  
  No rule → store `"null"` (`json.dumps(None)`) → yields no variables.
- Any historical `data_sources` are ignored by the extractor.

---

## Quick start

```python
import json
from validation.workflow_models import WorkflowTemplateModel
from service.workflow.evaluate.variables import extract_variables_from_current_step

rule = json.dumps({
    "and": [
        {">=": [{"var": "patient.age"}, 28]},
        {"==": [{"var": "visit.type"}, "ANC"]},
    ]
})

template_model = WorkflowTemplateModel(**{
    "id": "wt-1",
    "starting_step_id": "st-1",
    "steps": [{
        "id": "st-1",
        "branches": [{
            "id": "b-1",
            "condition": {"id": "rg-1", "rule": rule, "data_sources": "[]"}
        }]
    }, {"id": "st-2", "branches": []}],
})

report = extract_variables_from_current_step(template_model, current_step_id="st-1")
print(report.all_variables)  # ["patient.age", "visit.type"]
```