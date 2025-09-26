
# Type Stub for `data/db_operations` (`__init__.pyi`)

This project uses a **runtime facade** in `data/db_operations/__init__.py` to re-export
functions dynamically (via `__getattr__`) so call sites can do:

```python
import data.db_operations as crud
crud.create(...)
```

Static analyzers (VS Code/Pylance, pyright) can’t follow dynamic re-exports, which breaks
hover docs, “Go to Definition/References,” and CodeLens usage counts for `crud.*`.
The **type stub** `__init__.pyi` provides a static map of the public API, restoring those features.

---

## Where to put it

Place the file at:
```
server/data/db_operations/__init__.pyi
```

After adding/updating it, in VS Code:
- **Command Palette → “Python: Restart Language Server”** or **Reload Window**.

---

## When to update it

Whenever you **add/remove/rename** a top-level export in the facade’s `__init__.py`:
1. Add/remove the same name(s) in the stub with a `from .<module> import <name>` line.
2. (Optional) Add a namespaced submodule re-export if you want completion on `crud.<module>`.
3. Commit both changes together.

> Tip: Keep the stub and the facade changes in the same PR to avoid drift.

---

## Example: exposing a new function

You added `read_my_feature_items` in `my_feature_queries.py` and exposed it in the facade.
Update the stub too:

```diff
 # server/data/db_operations/__init__.pyi
-from .patient_queries import (
-    read_admin_patient, read_patient_list,
-)
+from .my_feature_queries import (
+    read_my_feature_items,
+)
```

Restart the language server; hovering `crud.read_my_feature_items` will now resolve to the
real function in `my_feature_queries.py`.

---

## Common pitfalls

- **Forgetting the stub update**: runtime works, but editor won’t show refs/hovers.
- **Putting runtime code in `.pyi`**: stubs should only include types/imports.