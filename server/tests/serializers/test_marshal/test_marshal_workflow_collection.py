# ruff: noqa: SLF001
import data.marshal as m
from models import (
    WorkflowClassificationOrm,
    WorkflowCollectionOrm,
    WorkflowTemplateOrm,
)


def _make_template(tid: str) -> WorkflowTemplateOrm:
    wt = WorkflowTemplateOrm()
    wt.id = tid
    wt.name = f"Template {tid}"
    wt.description = "Reusable care pathway"
    wt.archived = False
    wt.date_created = 1_690_000_000
    wt.starting_step_id = None
    wt.last_edited = 1_690_000_100
    wt.version = "v1"
    wt._private = "nope"
    return wt


def _make_classification(
    cid: str, name: str, collection_id: str | None
) -> WorkflowClassificationOrm:
    wc = WorkflowClassificationOrm()
    wc.id = cid
    wc.name = name
    wc.collection_id = collection_id
    wc._scratch = "nope"

    wt1 = _make_template(f"{cid}-A")
    wt2 = _make_template(f"{cid}-B")

    wt1.classification = wc
    wt2.classification = wc
    wc.workflow_templates = [wt1, wt2]

    return wc


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

    out = m.marshal(coll)

    # preserved fields
    assert out["id"] == "wfc-001"
    assert out["name"] == "Maternal & Newborn"
    assert out["date_created"] == 1_689_000_000
    assert out["last_edited"] == 1_689_000_050
    # stripped fields
    assert "_secret" not in out

    # Classifications included
    assert "classifications" in out and isinstance(out["classifications"], list)
    assert {c["id"] for c in out["classifications"]} == {"wc-ANC", "wc-PNC"}

    # Classification 1 (has collection_id)
    c1_out = next(c for c in out["classifications"] if c["id"] == "wc-ANC")
    assert c1_out["name"] == "Antenatal"
    assert c1_out["collection_id"] == "wfc-001"

    # private field stripped
    assert "_scratch" not in c1_out

    # backref to templates removed by __marshal_workflow_classification
    assert "workflow_templates" not in c1_out

    # Classification 2 (collection_id=None -> stripped)
    c2_out = next(c for c in out["classifications"] if c["id"] == "wc-PNC")
    assert c2_out["name"] == "Postnatal"
    assert "collection_id" not in c2_out
    assert "_scratch" not in c2_out
    assert "workflow_templates" not in c2_out


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

    out = m.marshal(coll, shallow=True)

    # Preserved
    assert out["id"] == "wfc-010"
    assert out["name"] == "Child Health"
    assert out["date_created"] == 1_700_000_000
    assert out["last_edited"] == 1_700_000_111

    # Stripped
    assert "_tmp" not in out

    # Shallow => no classifications
    assert "classifications" not in out
