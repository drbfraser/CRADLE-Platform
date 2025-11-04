# `data/orm_serializer`
## Usage

- Use `marshal(obj, shallow=False, if_include_versions=False)` to turn an object into a dict.
- Use `marshal_with_type(obj, shallow=False)` to add a `"type"` label (e.g., `"form"`).
- Use `unmarshal(ModelOrm, data)` to build/merge ORM instances from dicts.

```python
from data import orm_serializer as s

d = s.marshal(patient)                       # -> dict
obj = s.unmarshal(PatientOrm, payload_dict)  # -> ORM or SimpleNamespace (per helper)
```


## The Registry (what it is and when to use it)

A in-memory lookup table that maps each ORM model class to the functions that know how to marshal (obj → dict) and unmarshal (dict → obj) it.
It lets the public API (api.marshal, api.unmarshal) find the right helper at runtime without importing every feature module directly—so we avoid circular imports.

You will **Only** need to use the register if your function depends on using `marshal()` or `unmarshal()` from the `api.py`.

### API

```python
from typing import Any, Callable, Type
from .registry import register_legacy

register_legacy(
    model: Type[Any],
    *,
    marshal_helper: Callable,    # your existing function
    marshal_mode: str,           # "", "S", "V", or "SV" (see below)
    unmarshal_helper: Callable | None = None,
    type_label: str | None = None,
) -> None
```

- `model`: The ORM (or model) class this helper handles (e.g., `PatientOrm`).
- `marshal_helper`: Your *existing* helper function; **do not change its signature**.
- `marshal_mode`: Tells the adapter how to call your helper:
  - `""`  → helper expects `(obj)` only
  - `"S"` → helper expects `(obj, shallow)`
  - `"V"` → helper expects `(obj, if_include_versions)`
  - `"SV"`→ helper expects `(obj, shallow, if_include_versions)`
- `unmarshal_helper` *(optional)*: Your existing unmarshal function for this model.
- `type_label` *(optional)*: A short label used by `marshal_with_type(...)`.

### How legacy signatures are adapted

The registry uses a small `MarshalAdapter` so the public API can always call
helpers in a **uniform way**: `(obj, shallow, if_include_versions)`.
You keep your original helper signatures; the adapter does the mapping.

---

## Typical registration pattern

In `data/orm_serializer/patients.py` (executed on import):

```python
from .registry import register_legacy
from .api import marshal, unmarshal
from models import PatientOrm

def _marshal_patient(obj, shallow):  # legacy signature — do not change
    marsha(...)
    return {...}

def _unmarshal_patient(data):        # legacy signature — do not change
    unmarshal(...)
    return patient

register_legacy(
    PatientOrm,
    marshal_helper=_marshal_patient,
    marshal_mode="S",             # helper expects (obj, shallow)
    unmarshal_helper=_unmarshal_patient,
    type_label="patient",         # optional; used by marshal_with_type
)
```

Do the same in `records.py`, `forms.py`, `workflows.py`, etc. Each module
registers its own helpers for its own models.

> **Note:** `data/orm_serializer/__init__.py` exposes the API and then
> side‑effect‑loads submodules:
> ```python
> for _mod in ("patients", "records", "forms", "phone", "questions", "workflows"):
>     importlib.import_module(f"{__name__}.{_mod}")
> ```
> That’s when the `register_legacy(...)` calls run and wire everything up.


## Example Usage 

### 1) Marshal a form with/without versions

```python
from data.orm_serializer import marshal, marshal_with_type

d1 = marshal(form)                                 
d2 = marshal(form, if_include_versions=True)       
d3 = marshal_with_type(form)                    
```

### 2) Unmarshal a patient payload

```python
from data.orm_serializer import unmarshal
from models import PatientOrm

payload = {"id": "p-001", "name": "Mary", "sex": "FEMALE"}
patient = unmarshal(PatientOrm, payload)
```