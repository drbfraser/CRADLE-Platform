# ruff: noqa: SLF001
from __future__ import annotations

import data.orm_serializer as orm_seralizer
from models import (
    WorkflowClassificationOrm,
    WorkflowCollectionOrm,
    WorkflowTemplateOrm,
)


def _make_workflow_template(tid: str) -> WorkflowTemplateOrm:
    """
    Construct a minimal WorkflowTemplateOrm instance with the given ID.

    :param id: ID of the WorkflowTemplateOrm to create.
    :return: Minimal WorkflowTemplateOrm instance with the given ID.
    """
    workflow_template = WorkflowTemplateOrm()
    workflow_template.id = tid
    workflow_template.name = f"Template {tid}"
    workflow_template.description = "Reusable care pathway"
    workflow_template.archived = False
    workflow_template.date_created = 1_690_000_000
    workflow_template.starting_step_id = None
    workflow_template.last_edited = 1_690_000_100
    workflow_template.version = "v1"
    workflow_template._private = "nope"
    return workflow_template


def _make_classification(
    cid: str, name: str, collection_id: str | None
) -> WorkflowClassificationOrm:
    """
    Construct a minimal WorkflowClassificationOrm instance with the given id, name, and collection id.

    :param cid: ID of the WorkflowClassificationOrm to create.
    :param name: Name of the WorkflowClassificationOrm to create.
    :param collection_id: The ID of a WorkflowCollectionOrm associated with this classification or None.
    :return: Minimal WorkflowClassificationOrm instance with the given id, name, and collection id.
    """
    workflow_classification = WorkflowClassificationOrm()
    workflow_classification.id = cid
    workflow_classification.name = name
    workflow_classification.collection_id = collection_id
    workflow_classification._scratch = "nope"

    workflow_temp_1 = _make_workflow_template(f"{cid}-A")
    workflow_temp_2 = _make_workflow_template(f"{cid}-B")

    workflow_temp_1.classification = workflow_classification
    workflow_temp_2.classification = workflow_classification
    workflow_classification.workflow_templates = [workflow_temp_1, workflow_temp_2]

    return workflow_classification


def test_workflow_collection_marshal_full_includes_classifications_and_cleans_nested():
    """
    __marshal_workflow_collection (shallow=False) should:
      - copy non-None top-level fields (id, name, date_created, last_edited),
      - strip private fields,
      - include 'classifications' (list),
      - for each classification: include id/name, strip private fields and
        remove 'workflow_templates' (backref) while preserving other scalars,
      - respect None stripping inside nested classifications (e.g., collection_id=None).
    """
    coll = WorkflowCollectionOrm()
    coll.id = "wfc-001"
    coll.name = "Maternal & Newborn"
    coll.date_created = 1_689_000_000
    coll.last_edited = 1_689_000_050
    coll._secret = "nope"  # should be stripped

    # Two classifications: one with collection_id set, one left as None
    c1 = _make_classification("wc-ANC", "Antenatal", collection_id=coll.id)
    c2 = _make_classification("wc-PNC", "Postnatal", collection_id=None)

    # Attach to the collection using the ORM backref list
    coll.workflow_classifications = [c1, c2]

    marshalled = orm_seralizer.marshal(coll)

    # preserved fields
    assert marshalled["id"] == "wfc-001"
    assert marshalled["name"] == "Maternal & Newborn"
    assert marshalled["date_created"] == 1_689_000_000
    assert marshalled["last_edited"] == 1_689_000_050
    # stripped fields
    assert "_secret" not in marshalled

    # Classifications included
    assert "classifications" in marshalled and isinstance(
        marshalled["classifications"], list
    )
    assert {c["id"] for c in marshalled["classifications"]} == {"wc-ANC", "wc-PNC"}

    # Classification 1 (has collection_id)
    c1_marshalled = next(
        c for c in marshalled["classifications"] if c["id"] == "wc-ANC"
    )
    assert c1_marshalled["name"] == "Antenatal"
    assert c1_marshalled["collection_id"] == "wfc-001"

    # private field stripped
    assert "_scratch" not in c1_marshalled

    # backref to templates removed by __marshal_workflow_classification
    assert "workflow_templates" not in c1_marshalled

    # Classification 2 (collection_id=None -> stripped)
    c2_marshalled = next(
        c for c in marshalled["classifications"] if c["id"] == "wc-PNC"
    )
    assert c2_marshalled["name"] == "Postnatal"
    assert "collection_id" not in c2_marshalled
    assert "_scratch" not in c2_marshalled
    assert "workflow_templates" not in c2_marshalled


def test_workflow_collection_marshal_shallow_omits_classifications_and_strips_private():
    """
    With shallow=True:
      - 'classifications' MUST be omitted,
      - top-level non-None fields preserved,
      - private attributes stripped.
    """
    coll = WorkflowCollectionOrm()
    coll.id = "wfc-010"
    coll.name = "Child Health"
    coll.date_created = 1_700_000_000
    coll.last_edited = 1_700_000_111
    coll._tmp = "nope"

    # Even if classifications exist, shallow mode should omit them.
    coll.workflow_classifications = [
        _make_classification("wc-IMCI", "IMCI", collection_id=coll.id)
    ]

    marshalled = orm_seralizer.marshal(coll, shallow=True)

    # Preserved
    assert marshalled["id"] == "wfc-010"
    assert marshalled["name"] == "Child Health"
    assert marshalled["date_created"] == 1_700_000_000
    assert marshalled["last_edited"] == 1_700_000_111

    # Stripped
    assert "_tmp" not in marshalled

    # Shallow => no classifications
    assert "classifications" not in marshalled
