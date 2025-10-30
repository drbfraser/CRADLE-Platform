# Workflow Branch Variable Extraction

This module extracts **all JsonLogic variables** used in **workflow branch conditions** and reports them per-branch and per-step. It also compares extracted variables against the branch’s declared `data_sources` and flags any **missing** items.


---

## Location

```
service/workflow/evaluate/variables/
  __init__.py            
  extractor.py           # extract_variables_from_workflow_template(...)
  models.py              # dataclasses (WorkflowVariableReport, StepVariableInfo, BranchVariableInfo)
  utils.py               # internal helpers (dict casting, iteration, parsing)
```

---

## What the extractor does

For every step → branch:
1) Parse the branch `condition.rule` (JsonLogic, serialized as a JSON **string**).  
2) Collect **variables** (e.g., `patient.age`, `visit.type`, `vitals.bp.systolic`).  
3) Normalize `data_sources` (list or JSON string) and compute **missing_from_datasources**.  



---

## Example

```python
from service.workflow.evaluate.variables import extract_variables_from_workflow_template

# `template` can be a WorkflowTemplateModel or a dict shaped like a template
report = extract_variables_from_workflow_template(template)

print(report.workflow_template_id)
for step in report.steps:
    print(step.step_id)
    for br in step.branches:
        print(br.branch_id, br.rule_id, br.variables, br.datasources, br.missing_from_datasources)

# JSON for your teammate (legacy/public shape)
payload = report.to_dict()
```

---

## Accepted Inputs (Shapes & Examples)

The extractor accepts either a **Pydantic model** or a **raw dict**. Both must contain the same essential fields:

- Template:
  - `id: str`
  - `steps: list[Step]`
  - `starting_step_id` (optional for the extractor but often present)

- Step:
  - `id: str`
  - `branches: list[Branch]`

- Branch:
  - `id: str`
  - `target_step_id: str | None` (not used by extractor)
  - `condition: { "id": str, "rule": str, "data_sources": list[str] | str }`  
    - `rule` **must** be a JSON **string** containing JsonLogic
    - `data_sources` can be a list (e.g., `["$patient.age"]`) **or** a JSON string (e.g., `'["$patient.age"]'`).

### A. Minimal **dict** input
```python
import json

template_dict = {
    "id": "wt-1",
    "starting_step_id": "st-1",
    "steps": [
        {
            "id": "st-1",
            "branches": [
                {
                    "id": "b-1",
                    "target_step_id": "st-2",
                    "condition": {
                        "id": "rg-1",
                        "rule": json.dumps({
                            "and": [
                                {">=": [{"var": "patient.age"}, 18]},
                                {"==": [{"var": "visit.type"}, "ANC"]},
                            ]
                        }),
                        "data_sources": ["$patient.age", "$visit.type"],
                    },
                },
                {
                    "id": "b-2",
                    "target_step_id": "st-2",
                    "condition": {
                        "id": "rg-2",
                        "rule": json.dumps({
                            "or": [
                                {"<": [{"var": "vitals.bp.systolic"}, 90]},
                                {"in": [{"var": "patient.sex"}, ["FEMALE", "OTHER"]]},
                            ]
                        }),
                        "data_sources": '["$vitals.bp.systolic"]',  # JSON string variant
                    },
                },
            ],
        },
        {"id": "st-2", "branches": []},
    ],
}
```



---

## Output (Model + JSON)

### Model access
```python
report = extract_variables_from_workflow_template(template_model)  # or template_dict

assert report.workflow_template_id == "wt-1"
assert set(report.all_variables) == {
    "patient.age", "visit.type", "vitals.bp.systolic", "patient.sex"
}

s1 = report.find_step("st-1")
assert s1 and len(s1.branches) == 2

b1 = report.find_branch("b-1", step_id="st-1")
assert b1.variables == ["patient.age", "visit.type"]
assert b1.datasources == ["$patient.age", "$visit.type"]
assert b1.missing_from_datasources == []

b2 = report.find_branch("b-2", step_id="st-1")
assert b2.variables == ["patient.sex", "vitals.bp.systolic"]
assert b2.datasources == ["$vitals.bp.systolic"]
assert b2.missing_from_datasources == ["patient.sex"]
```

### JSON payload (`to_dict()`)
```python
payload = report.to_dict()
# payload ==
{
  "workflow_template_id": "wt-1",
  "steps": [
    {
      "step_id": "st-1",
      "branches": [
        {
          "branch_id": "b-1",
          "rule_id": "rg-1",
          "variables": ["patient.age", "visit.type"],
          "datasources": ["$patient.age", "$visit.type"],
          "missing_from_datasources": []
        },
        {
          "branch_id": "b-2",
          "rule_id": "rg-2",
          "variables": ["patient.sex", "vitals.bp.systolic"],
          "datasources": ["$vitals.bp.systolic"],
          "missing_from_datasources": ["patient.sex"]
        }
      ]
    },
    { "step_id": "st-2", "branches": [] }
  ],
  "all_variables": ["patient.age", "patient.sex", "visit.type", "vitals.bp.systolic"]
}
```