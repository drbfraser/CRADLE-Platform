from typing import NamedTuple, Optional


class Node(NamedTuple):
    is_category: bool
    qindex: int
    cindex: Optional[int]


def is_dfs_order(question_list: list[dict]) -> Optional[str]:
    """
    return None if questions in the question list are in the reasonable
    question tree dfs order. Else, return error.
    -------------------------------------------------------------------
    Currently, each question has a category index field that points to 
    another question. If this field is None, it means this question is a
    root normal question or a root category (depending on the questionType
    ), else it means this question is a normal question with category or
    a sub-category.
    
    For example, below is an example form template (C is category, Q is normal
    question):

    ├── C1
    |   ├── C3
    |   |   ├── Q3
    |   |   └── Q4
    |   └── Q2
    ├── C2
    |   ├── Q5
    |   └── Q6
    └── Q1

    The corresponding question tree is:

             root
            /  \  \
           C1  C2 Q1
          / \  / \
         C3 Q2 Q5 Q6
        / \
       Q3 Q4 

    Then the question order should be in the strict dfs order:
    [C1,C3,Q3,Q4,Q2,C2,Q5,Q6,Q1]
    """
    node_list = [
        Node(q["questionType"] == "CATEGORY", q["questionIndex"], q["categoryIndex"])
        for q in question_list
    ]

    category_index_set = set()
    tree_stack = ["root"]

    for node in node_list:
        top_node = tree_stack[-1]
        if top_node == "root":
            if node.cindex is not None:
                return f"root question {node.qindex} should have categoryIndex = null"
            else:
                if node.is_category:
                    # push category node into stack
                    category_index_set.add(node.qindex)
                    tree_stack.append(node)
        else:
            top_node: Node = top_node
            if node.cindex is None:
                # initial stack with root only, clear set
                tree_stack = ["root"]
                category_index_set.clear()
            else:
                if top_node.qindex != node.cindex:
                    if not node.cindex in category_index_set:
                        # detect node with invalid category index ahead
                        return f"internal question {node.qindex}'s category index doesn't point to an available question"
                    while len(tree_stack) > 1 and tree_stack[-1].qindex != node.cindex:
                        # pop stack nodes and set index and until cur node's cindex equal to top node's qid
                        category_index_set.remove(tree_stack.pop().qindex)

            if node.is_category:
                # push category node into stack
                category_index_set.add(node.qindex)
                tree_stack.append(node)

    return None
