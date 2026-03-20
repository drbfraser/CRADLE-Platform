from service.workflow.evaluate.rules_engine import RulesEngineFacade, RuleStatus


def test_rules_engine_allows_top_level_name_metadata():
    rule = '{"<=": [{"var": "patient.age"}, 17], "name": "isChild"}'
    engine = RulesEngineFacade(rule=rule, args={})

    result = engine.evaluate({"patient.age": 17})
    assert result.status == RuleStatus.TRUE

    result2 = engine.evaluate({"patient.age": 18})
    assert result2.status == RuleStatus.FALSE

