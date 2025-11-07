# Workflow Branch Variable Extraction

> **Disclaimer:** The content of the README might not be up to date with the code in the package. The instructions are kept at high level.

This module extracts **all JsonLogic variables** used in **workflow branch conditions** and reports them per‑branch and per‑step.  

---

## Location

```
server/service/workflow/evaluate/variables/
  __init__.py
  extractor.py     # extract_variables_from_workflow_template(...)
  models.py        # WorkflowVariableReport, StepVariableInfo, BranchVariableInfo
  utils.py         # internal helpers (casting, iteration)
```

---

## Public API

```python
from service.workflow.evaluate.variables import (
    extract_variables_from_workflow_template,
    WorkflowVariableReport,
)

report: WorkflowVariableReport = extract_variables_from_workflow_template(template_model)
```

### Return types (overview)

```python
WorkflowVariableReport
  .workflow_template_id: str | None
  .steps: list[StepVariableInfo]
  .all_variables: list[str]        # sorted, de‑duplicated across all branches

StepVariableInfo
  .step_id: str | None
  .branches: list[BranchVariableInfo]

BranchVariableInfo
  .branch_id: str | None
  .rule_id: str | None
  .variables: list[str]            # sorted, unique per branch
```

---

## Input requirements

- **Model only:** The extractor accepts **only** a `WorkflowTemplateModel`.
- **Rules:** Each branch condition’s `rule` must be a **JSON string** containing a JsonLogic structure.  
  If there’s **no rule**, store the string value of JSON `null` (i.e., `json.dumps(None)`)—the extractor will return no variables for that branch.
- **Note:** Your `WorkflowTemplateModel` may still require a `data_sources` field; this is **ignored** by the extractor and **does not** appear in the output.

---

## Quick start

```python
import json
from validation.workflow_models import WorkflowTemplateModel
from service.workflow.evaluate.variables import extract_variables_from_workflow_template

rule = json.dumps({
    "and": [
        {">=": [{"var": "patient.age"}, 18]},
        {"==": [{"var": "visit.type"}, "ANC"]},
    ]
})

template_dict = {
    "id": "wt-1",
    "starting_step_id": "st-1",
    "steps": [
        {
            "id": "st-1",
            "branches": [
                {"id": "b-1", "target_step_id": "st-2",
                 "condition": {"id": "rg-1", "rule": rule, "data_sources": "[]"}}
            ],
        },
        {"id": "st-2", "branches": []},
    ],
}

template_model = WorkflowTemplateModel(**template_dict)

report = extract_variables_from_workflow_template(template_model)
print(report.workflow_template_id)            # "wt-1"
print(report.all_variables)                   # ["patient.age", "visit.type"]
print(report.steps[0].branches[0].variables)  # ["patient.age", "visit.type"]

```

---

## Behavior & edge cases

- **Deterministic output:** Variable lists are **sorted**; duplicates across branches are **de‑duplicated** in `all_variables`.
- **No condition:** Branch `condition=None` → branch variables `[]`.
- **Condition but no rule:** `rule` set to the string `"null"` (`json.dumps(None)`) → variables `[]`.
- **“Bad JSON rule”:** If the rule is a valid JSON string but not a JsonLogic object (e.g., `"123"`), extraction is **gracefully empty** for that branch (others continue).
- **Type guard:** Non‑`WorkflowTemplateModel` input raises `TypeError`.

See tests for exact expectations:
- `test_extract_after_workflowservice_generation`
- `test_no_condition_yields_empty_variables`
- `test_condition_without_rule_yields_empty_variables`
- `test_bad_json_rule`
- `test_duplicate_variables_across_branches_are_deduped_in_all_variables`
- `test_requires_workflow_template_model_input`

---

## Output shape

### Python model
```python
report.workflow_template_id            # "wt-1"
report.all_variables                  # ["patient.age", "patient.sex", "visit.type", "vitals.bp.systolic"]
report.steps[0].step_id               # "st-1"
report.steps[0].branches[0].variables # ["patient.age", "visit.type"]
```

### JSON (`to_dict()`)
```json
{
  "workflow_template_id": "wt-1",
  "steps": [
    {
      "step_id": "st-1",
      "branches": [
        { "branch_id": "b-1", "rule_id": "rg-1", "variables": ["patient.age", "visit.type"] }
      ]
    },
    { "step_id": "st-2", "branches": [] }
  ],
  "all_variables": ["patient.age", "patient.sex", "visit.type", "vitals.bp.systolic"]
}
```