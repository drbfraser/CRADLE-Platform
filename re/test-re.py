from jsonlogic import JSONLogicExpression
from jsonlogic.operators import operator_registry
from jsonlogic.evaluation import evaluate
from jsonlogic.resolving import DotReferenceParser

expr = JSONLogicExpression.from_json(
    {"==" : [
	  { ">" : [3,1] },
	  { "<" : [1,3] }
	] }
    # {">": [{"var": "my_int"}, 2]}
)
print(expr.expression)

root_op = expr.as_operator_tree(operator_registry)
root_op

# # input has to be type JSON (a deserialized json object, not a json string)
# input = {"my_int": 3}

# return_value = evaluate(
#     root_op,
#     data=input,
#     data_schema=None,   # Optional, For converting input objects into a user-defined type 
#     settings={          # Optional
#         "reference_parser": DotReferenceParser(),
#     },
# )

# print(return_value)