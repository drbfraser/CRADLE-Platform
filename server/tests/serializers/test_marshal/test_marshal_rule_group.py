import data.marshal as m
from models import RuleGroupOrm


def test_rule_group_marshal_preserves_json_and_strips_private():
    """
    __marshal_rule_group should:
      - include id, rule, data_sources,
      - preserve JSON-typed fields (dicts/lists) as Python objects,
      - strip private attributes (starting with "_").
    """
    rg = RuleGroupOrm()
    rg.id = "rg-001"
    rg.rule = {
        "all": [
            {"qidx": 3, "op": ">", "value": 140},
            {"qidx": 4, "op": "<", "value": 90},
        ],
        "meta": {"logic": "AND"},
    }
    rg.data_sources = {
        "questions": ["bp_systolic", "bp_diastolic"],
        "source": "form_readings",
    }

    out = m.marshal(rg)

    assert set(out.keys()) == {"id", "rule", "data_sources"}
    assert out["id"] == "rg-001"

    assert out["rule"] == {
        "all": [
            {"qidx": 3, "op": ">", "value": 140},
            {"qidx": 4, "op": "<", "value": 90},
        ],
        "meta": {"logic": "AND"},
    }
    assert out["data_sources"] == {
        "questions": ["bp_systolic", "bp_diastolic"],
        "source": "form_readings",
    }


def test_rule_group_marshal_strips_none_values_for_optional_json_fields():
    """
    If an optional JSON column is None, __strip_none_values should remove it
    from the marshaled output.
    """
    rg = RuleGroupOrm()
    rg.id = "rg-002"
    rg.rule = {"any": [{"qidx": 7, "op": "EQUALS", "value": "YES"}]}
    rg.data_sources = None

    out = m.marshal(rg)

    assert set(out.keys()) == {"id", "rule"}
    assert out["id"] == "rg-002"
    assert out["rule"] == {"any": [{"qidx": 7, "op": "EQUALS", "value": "YES"}]}


def test_rule_group_marshal_allows_empty_structures():
    """
    Empty dicts/lists are not None and should be preserved.
    """
    rg = RuleGroupOrm()
    rg.id = "rg-003"
    rg.rule = {}
    rg.data_sources = []

    out = m.marshal(rg)

    assert set(out.keys()) == {"id", "rule", "data_sources"}
    assert out["id"] == "rg-003"
    assert out["rule"] == {}
    assert out["data_sources"] == []
