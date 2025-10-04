# `data/db_operations` – Developer Guide

A practical guide for adding **new files** and **exposing functions** through the `data.db_operations` façade so call‑sites can do:

```python
import data.db_operations as crud

crud.create(...)
crud.read_patient_list(...)
```
This README is written for new contributors joining the project. It explains the architecture, conventions, and the exact steps to add or expose functions safely.

---

## Architecture Overview

We present a **package façade** in `data/db_operations/__init__.py` so the app can import a single module (`crud`) while the implementation lives in feature‑oriented submodules such as:
- `common_crud.py`
- `form_queries.py`
- `patient_queries.py`
- `phone_utils.py`
- `pregnancy_medical_utils.py`
- `referral_queries.py`
- `stats_queries.py`
- `supervision.py`
- `workflow_management.py`
- `config.py` (provides `db` / `db.session`)

The façade uses **lazy loading** (PEP 562 via `__getattr__`) to import submodules on first use and **caching** to avoid repeat overhead. This improves startup time and helps prevent circular imports.

---

## Directory Layout

```
server/
└─ data/
   ├─ config.py                 # Provides `db` (SQLAlchemy or similar)
   └─ db_operations/
      ├─ __init__.py            # Facade (public API, lazy re-exports, caching)
      ├─ common_crud.py
      ├─ form_queries.py
      ├─ patient_queries.py
      ├─ phone_utils.py
      ├─ pregnancy_medical_utils.py
      ├─ referral_queries.py
      ├─ stats_queries.py
      ├─ supervision.py
      └─ workflow_management.py
```

---

## Adding to the package - Example

Suppose you added `read_my_feature_items` in `data/db_operations/my_feature_queries.py` and want it at `crud.read_my_feature_items`.

Then, add the new function names in `__all__` and `_EXPORT`: 

```diff
 # data/db_operations/__init__.py

 __all__ = [
+    "read_my_feature_items",
 ]

 _EXPORTS = {
+    "read_my_feature_items": ("my_feature_queries", "read_my_feature_items"),
 }
```

---

## Creating Files

### Add a new feature module
1. **Create** `data/db_operations/<feature>_queries.py` (or an appropriate name).
2. **Write** functions with clear docstrings and no app‑level imports.
3. **Avoid circulars**: import DB session via `from .config import db` then `db_session = db.session`.
4. **(Optional) Expose top‑level**: update `data/db_operations/__init__.py` → add entries to `__all__` and `_EXPORTS`.

### Expose an existing function at the top level (so you can call `crud.fn()`)
1. Open `data/db_operations/__init__.py`.
2. Add the function name to `__all__`.
3. Add a mapping in `_EXPORTS = { "<public_name>": ("<submodule>", "<attr>"), ... }`.

---

---

## (`__init__.py`) – How It Works

- `__all__`: lists public names you can `from data.db_operations import *` or access via `crud.<name>`.
- `_EXPORTS`: maps **public name → (submodule, attribute)**. The façade uses this map to resolve `crud.<name>` to the actual function in a submodule, importing the submodule on demand.
- `__getattr__`: lazy resolver. On first access, it imports the submodule, fetches the attribute, **caches** it in module globals, and returns it.
- Special handling for `db_session`: we import `data.db_operations.config` using `importlib.import_module` and return `db.session`.

This design:
- Minimizes circular imports.
- Keeps the public surface **curated** and stable.
- Allows **namespaced access** as an escape hatch: `crud.patient_queries.<fn>`.

---

## Exposing Functions at the Top Level (`crud.fn`)

To make a function callable as `crud.<name>(...)`:

1. Open `data/db_operations/__init__.py`.
2. Add the function name to `__all__`:
   ```python
   __all__ = [
       # ...
       "read_my_feature_items",
   ]
   ```
3. Add a mapping in `_EXPORTS`:
   ```python
   _EXPORTS = {
       # ...
       "read_my_feature_items": ("my_feature_queries", "read_my_feature_items"),
   }
   ```
4. Save and test.

> **Collision policy:** If another module already exposes a function with the same public name, rename at the source or expose under a distinct name (e.g., `workflow_start`). Do not map two sources to the same public name.

---

## Keeping Helpers Private

- Do **not** export double‑underscore helpers (e.g., `__internal_util`). Even though Python doesn’t enforce privacy at module scope, the double underscore convention signals “private.”
- Only expose functions that are stable and intended for use by other layers.
- If a helper is needed outside its module, consider promoting it to a properly named, tested public function.

---

## Performance Notes

- **Startup is faster**: nothing imports until first use.
- **First access** to a function pays a small, one-time import; the result is cached in `globals()`.
- **Subsequent calls** are as fast as normal attribute lookups.

---

## Troubleshooting

### Name collision at the top level
**Symptom:** Wrong function is called because two submodules define the same public name.  
**Fix:** Choose one public representative or rename the exposed function (e.g., `workflow_start`). Update call sites if needed.

---

## Conventions & Style

- **File names:** snake_case; prefer `<feature>_queries.py` for read/query modules.
- **Function names:** verbs for actions (`create_*`, `read_*`, `update_*`, `delete_*`), nouns for computed aggregates (`get_*`, `count_*`).
- **Docstrings:** clear summaries + parameters/returns; note if function commits or requires a transaction.

---