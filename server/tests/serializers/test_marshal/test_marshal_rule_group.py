import data.orm_serializer as orm_seralizer
from models import RuleGroupOrm


def test_rule_group_marshal_preserves_json_and_strips_private():
    """
    __marshal_rule_group should:
      - include id, rule, data_sources,
      - preserve JSON-typed fields (dicts/lists) as Python objects,
      - strip private attributes (starting with "_").
    """
    rule_group = RuleGroupOrm()
    rule_group.id = "rg-001"
    rule_group.rule = {
        "all": [
            {"qidx": 3, "op": ">", "value": 140},
            {"qidx": 4, "op": "<", "value": 90},
        ],
        "meta": {"logic": "AND"},
    }
    rule_group.data_sources = {
        "questions": ["bp_systolic", "bp_diastolic"],
        "source": "form_readings",
    }

    marshalled = orm_seralizer.marshal(rule_group)

    assert set(marshalled.keys()) == {"id", "rule", "data_sources"}
    assert marshalled["id"] == "rg-001"

    assert marshalled["rule"] == {
        "all": [
            {"qidx": 3, "op": ">", "value": 140},
            {"qidx": 4, "op": "<", "value": 90},
        ],
        "meta": {"logic": "AND"},
    }
    assert marshalled["data_sources"] == {
        "questions": ["bp_systolic", "bp_diastolic"],
        "source": "form_readings",
    }


def test_rule_group_marshal_strips_none_values_for_optional_json_fields():
    """
    If an optional JSON column is None, __strip_none_values should remove it
    from the marshaled output.
    """
    rule_group = RuleGroupOrm()
    rule_group.id = "rg-002"
    rule_group.rule = {"any": [{"qidx": 7, "op": "EQUALS", "value": "YES"}]}
    rule_group.data_sources = None

    marshalled = orm_seralizer.marshal(rule_group)

    assert set(marshalled.keys()) == {"id", "rule"}
    assert marshalled["id"] == "rg-002"
    assert marshalled["rule"] == {"any": [{"qidx": 7, "op": "EQUALS", "value": "YES"}]}


def test_rule_group_marshal_allows_empty_structures():
    """
    Empty dicts/lists are not None and should be preserved.
    """
    rule_group = RuleGroupOrm()
    rule_group.id = "rg-003"
    rule_group.rule = {}
    rule_group.data_sources = []

    marshalled = orm_seralizer.marshal(rule_group)

    assert set(marshalled.keys()) == {"id", "rule", "data_sources"}
    assert marshalled["id"] == "rg-003"
    assert marshalled["rule"] == {}
    assert marshalled["data_sources"] == []
