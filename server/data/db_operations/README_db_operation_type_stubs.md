Type stub for `data.db_operations` facade.

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