"""
Resolves ``{{variable}}`` tokens used in workflow step descriptions, reusing the
same variable catalogue and resolution logic as the rule engine
(see ``data_sourcing.py`` / ``data_catalogue.py``) so description authors and
rule authors share one variable vocabulary instead of two.

This resolves *current* values only (the "floating" behavior) -- freezing
values at some point (e.g. step completion) is a separate, not-yet-built
feature: it would mean calling this once at the freeze point and persisting
the result, rather than anything this module needs to do differently itself.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel

import data.db_operations as crud
from data import orm_serializer
from models import PregnancyOrm
from service.workflow.datasourcing.data_catalogue import ObjectCatalogue, get_catalogue
from service.workflow.datasourcing.data_sourcing import (
    MISSING,
    WORKFLOW_VARIABLE_NAMESPACE,
    ResolverContext,
    VariablePath,
    resolve_collection_variables,
    resolve_object_variable_paths,
    resolve_workflow_namespace_variables,
)

# Collections whose backing query is still a stub (see data_catalogue.py TODOs
# on __query_referrals_collection / __query_assessments_collection). Kept
# separate from "no data" so callers can render something like
# "(not yet available)" instead of a silent blank.
#
# TODO: remove an entry here once its __query_*_collection() is actually implemented.
NOT_YET_IMPLEMENTED_NAMESPACES: frozenset[str] = frozenset({"referrals", "assessments"})


class VariableOutcomeStatus(str, Enum):
    RESOLVED = "RESOLVED"
    NO_DATA = "NO_DATA"  # Value genuinely absent (e.g. patient has no allergy on file).
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED"  # Backing data source is a stub, not real data.
    INVALID_VARIABLE = "INVALID_VARIABLE"  # Couldn't parse / unknown namespace.


class ResolvedVariable(BaseModel):
    """One resolved (or explicitly unresolved) variable for a description."""

    var: str
    value: Any | None = None
    status: VariableOutcomeStatus


def _catalogue_with_pinned_pregnancy(
    catalogue: dict[str, ObjectCatalogue], pregnancy_id: str
) -> dict[str, ObjectCatalogue]:
    """
    Override the ``pregnancies`` collection so ``pregnancies[latest]...`` (and
    any explicit index) resolves against *only* the pinned pregnancy, instead
    of the patient's actual most-recent one.

    Note this only affects the ``pregnancies`` collection namespace used in
    description tokens. The singular ``pregnancy.*`` object namespace already
    prefers a ``pregnancy_id`` in context over ``patient_id`` (see
    ``data_sourcing._resolve_object``), so it's pinned automatically without
    needing this override.
    """
    pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)
    pinned_items = [orm_serializer.marshal(pregnancy)] if pregnancy else []

    return {
        **catalogue,
        "pregnancies": {
            "query": lambda _patient_id: pinned_items,
            "collection": True,
        },
    }


def resolve_description_variables(
    context: ResolverContext,
    raw_variable_tags: list[str],
) -> dict[str, ResolvedVariable]:
    """
    Resolve the variable tags referenced by a step description's ``{{...}}`` tokens.

    :param context: IDs needed for resolution, e.g.
        ``{"patient_id": "...", "workflow_instance_id": "..."}``.
    :param raw_variable_tags: e.g. ["patient.age", "pregnancies[latest].start_date"].
        Extracted from the description text by the caller (client-side today --
        see descriptionVariables.ts's token regex). Duplicate tags, and
        different tags that normalize to the same canonical path, are only
        resolved once.
    :returns: dict keyed by the *original* tag string (not the canonicalized
        VariablePath string) so the caller can match resolved values back
        against the exact tokens found in the description text.
    """
    catalogue = get_catalogue()
    pinned_pregnancy_id = context.get("pregnancy_id")
    if pinned_pregnancy_id:
        catalogue = _catalogue_with_pinned_pregnancy(catalogue, pinned_pregnancy_id)

    results: dict[str, ResolvedVariable] = {}

    # Group by namespace kind first so each of the three resolvers below is
    # called once for *all* requested variables of that kind, instead of once
    # per tag -- avoids the DB-query fan-out a step description referencing
    # several variables (or a page rendering several steps) would otherwise cause.
    wf_paths: dict[str, VariablePath] = {}
    collection_paths: dict[str, VariablePath] = {}
    object_paths: dict[str, VariablePath] = {}
    tag_to_canonical: dict[str, str] = {}

    for tag in raw_variable_tags:
        vp = VariablePath.from_string(tag)
        if vp is None:
            results[tag] = ResolvedVariable(
                var=tag, status=VariableOutcomeStatus.INVALID_VARIABLE
            )
            continue

        if vp.namespace in NOT_YET_IMPLEMENTED_NAMESPACES:
            results[tag] = ResolvedVariable(
                var=tag, status=VariableOutcomeStatus.NOT_IMPLEMENTED
            )
            continue

        canonical = vp.to_string()
        tag_to_canonical[tag] = canonical

        if vp.namespace == WORKFLOW_VARIABLE_NAMESPACE:
            wf_paths.setdefault(canonical, vp)
        elif catalogue.get(vp.namespace, {}).get("collection"):
            collection_paths.setdefault(canonical, vp)
        else:
            object_paths.setdefault(canonical, vp)

    # use_missing_sentinel=True so a genuinely-unresolvable variable (MISSING)
    # can be told apart from a real field whose value is explicitly null
    # (None) -- without this both collapse to None and NO_DATA never fires.
    resolved: dict[str, Any] = {}
    if wf_paths:
        resolved.update(
            resolve_workflow_namespace_variables(
                context, list(wf_paths.values()), use_missing_sentinel=True
            )
        )
    if collection_paths:
        resolved.update(
            resolve_collection_variables(
                context,
                list(collection_paths.values()),
                catalogue,
                use_missing_sentinel=True,
            )
        )
    if object_paths:
        resolved.update(
            resolve_object_variable_paths(
                context,
                list(object_paths.values()),
                catalogue,
                use_missing_sentinel=True,
            )
        )

    for tag, canonical in tag_to_canonical.items():
        value = resolved.get(canonical, MISSING)
        if value is MISSING:
            results[tag] = ResolvedVariable(
                var=tag, status=VariableOutcomeStatus.NO_DATA
            )
        else:
            results[tag] = ResolvedVariable(
                var=tag, value=value, status=VariableOutcomeStatus.RESOLVED
            )

    return results
