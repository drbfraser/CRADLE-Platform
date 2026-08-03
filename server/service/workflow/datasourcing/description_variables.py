"""
Resolves ``{{variable}}`` tokens used in workflow step descriptions, reusing the
same variable catalogue and resolution logic as the rule engine
(see ``data_sourcing.py`` / ``data_catalogue.py``) so description authors and
rule authors share one variable vocabulary instead of two.

SKELETON: wiring below is stubbed out. See TODOs before relying on this.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel

from service.workflow.datasourcing.data_catalogue import get_catalogue
from service.workflow.datasourcing.data_sourcing import (
    MISSING,
    WORKFLOW_VARIABLE_NAMESPACE,
    ResolverContext,
    VariablePath,
    resolve_collection_variables,
    resolve_object_variable_paths,
    resolve_workflow_namespace_variables,
)

# Collections whose backing query is still a stub (see data_catalogue.py TODOs).
# Kept separate from "no data" so callers can render something like
# "(not yet available)" instead of a silent blank, per the referrals/assessments
# discussion.
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
    value: Optional[Any] = None
    status: VariableOutcomeStatus


def resolve_description_variables(
    context: ResolverContext,
    raw_variable_tags: list[str],
) -> dict[str, ResolvedVariable]:
    """
    Resolve the variable tags referenced by a step description's ``{{...}}`` tokens.

    :param context: IDs needed for resolution, e.g.
        ``{"patient_id": "...", "workflow_instance_id": "..."}``.
        TODO: decide what "as of" timestamp goes in here (e.g. the step's
        start_date) so age/latest-style values freeze relative to step start
        rather than to wall-clock "now" -- see custom_lookup.patient_age and
        the pregnancy "latest" discussion. Likely needs a new
        ``resolve_variables_as_of(context, ..., reference_time=...)`` variant,
        or threading reference_time through the catalogue's custom resolvers.
    :param raw_variable_tags: e.g. ["patient.age", "pregnancies[latest].start_date"],
        parsed out of the description text by the caller (see
        client descriptionTemplate.ts's token regex for the equivalent client-side
        parsing -- TODO: keep the two token-extraction implementations in sync,
        or move extraction here and have the client just send description text).
    :returns: dict keyed by the *original* tag string (not the canonicalized
        VariablePath string) so the caller can match resolved values back
        against the exact tokens found in the description text.
    """
    catalogue = get_catalogue()
    results: dict[str, ResolvedVariable] = {}

    # TODO: this per-tag dispatch is O(n) catalogue/DB round trips in the worst
    # case; batch by namespace like resolve_variables() does before this sees
    # real traffic (a step description can reference several variables at once,
    # and a step-history page can render several steps' descriptions together --
    # see the "possible query fan-out" concern raised in review).
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

        # TODO: this branch dispatch duplicates logic already implicit in
        # rule_evaluator.py's handling of collection vs. object vs. wf
        # namespaces. Consider extracting a shared "classify and resolve one
        # VariablePath" helper in data_sourcing.py that both the rule
        # evaluator and this module call, instead of reimplementing the
        # if/elif here.
        if vp.namespace == WORKFLOW_VARIABLE_NAMESPACE:
            resolved = resolve_workflow_namespace_variables(context, [vp])
        elif catalogue.get(vp.namespace, {}).get("collection"):
            resolved = resolve_collection_variables(context, [vp], catalogue)
        else:
            resolved = resolve_object_variable_paths(context, [vp], catalogue)

        value = resolved.get(vp.to_string(), MISSING)
        if value is MISSING:
            results[tag] = ResolvedVariable(var=tag, status=VariableOutcomeStatus.NO_DATA)
        else:
            results[tag] = ResolvedVariable(
                var=tag, value=value, status=VariableOutcomeStatus.RESOLVED
            )

    return results


def extract_variable_tags(description: str) -> list[str]:
    """
    Pull every ``{{...}}`` token's inner text out of a step description.

    TODO: this needs to agree byte-for-byte with the client's token regex
    (client/src/shared/components/workflow/descriptionTemplate.ts) including
    how offsets (``+3d``) are stripped before treating the remainder as a
    variable tag. Consider defining the grammar once (e.g. a shared regex
    string or a tiny spec doc) rather than maintaining matching regexes in
    Python and TypeScript independently.
    """
    raise NotImplementedError("TODO: implement token extraction (see docstring)")
