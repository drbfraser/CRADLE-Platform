from json_logic import jsonLogic

# jsonLogic evaluate expression can only have 1 operator (and, or, etc.) at a time
# so we need to call it many times
#   or figure a way in grouping conditions as a rule -> brackets?
# defining outer primary operator
# 

res = jsonLogic( { "==" : [1, 1] } )

'''
(1 == 1) 
and 
( (1 >= 2) 
    or (1 != 3)
    or ((1 == 1) 
            and ( (1 >= 2) 
                    or (1 != 3) 
                    or (...) 
                ) 
            and (...)
        ) 
) 
and 
(...)
'''
res1 = jsonLogic(
    { "and" : [
        { "==" : [1,1] }, 
        { "or" : [
            { ">=" : [1,2] },
            { "!=" : [1,3] },
            { "and" : [
                { "==" : [1,1] }, 
                { "or" : [
                    { ">=" : [1,2] },
                    { "!=" : [1,3] }
                ] }
            ] }
        ] }
    ], "id": 123 }
)

# res2 = jsonLogic(
# {
# 	"if": [
#         # if
# 		{"==": [ { "%": [ { "var": "i" }, 15 ] }, 0]},
# 		"fizzbuzz",
#         # elseif   
# 		{"==": [ { "%": [ { "var": "i" }, 3 ] }, 0]},
# 		"fizz",
#         # elseif
# 		{"==": [ { "%": [ { "var": "i" }, 5 ] }, 0]},
# 		"buzz",
#         # else
#         # "nonee"
# 		# { "none" }
# 	]
# },
# {"i":1}
# )

print(res1)