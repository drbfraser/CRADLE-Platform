from typing import NamedTuple, Optional


class Node(NamedTuple):
    is_category: bool
    question_index: int
    category_index: Optional[int]


def is_dfs_order(question_list: list[dict]) -> Optional[str]:
    r"""
    return None if questions in the question list are in the reasonable
    question tree dfs order. Else, return error.
    -------------------------------------------------------------------
    Currently, each question has a category index field that points to
    another question. If this field is None, it means this question is a
    root normal question or a root category (depending on the question_type
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
            /  \\  \
           C1  C2 Q1
          / \\  / \
         C3 Q2 Q5 Q6
        / \
       Q3 Q4

    Then the question order should follow dfs preorder traversal
    (with their corresponding category_index, with n indicating null):
    [C1,C3,Q3,Q4,Q2,C2,Q5,Q6,Q1]
    [ n  0  1  1  0  n  5  5  n]
    """
    node_list = [
        Node(q["question_type"] == "CATEGORY", q["question_index"], q["category_index"])
        for q in question_list
    ]

    category_index_set = set()
    tree_stack = ["root"]

    for node in node_list:
        top_node: Node = tree_stack[-1]
        if top_node == "root":
            if node.category_index is not None:
                return f"root question {node.question_index} should have category_index = null"
            if node.is_category:
                # push category node into stack
                category_index_set.add(node.question_index)
                tree_stack.append(node)
        else:
            if node.category_index is None:
                # initial stack with root only, clear set
                tree_stack = ["root"]
                category_index_set.clear()
            elif top_node.question_index != node.category_index:
                if node.category_index not in category_index_set:
                    # detect node with invalid category index ahead
                    return f"internal question {node.question_index}'s category index doesn't point to an available question"
                while (
                    len(tree_stack) > 1
                    and tree_stack[-1].question_index != node.category_index
                ):
                    # pop stack nodes and set index and until cur node's category_index equal to top node's qid
                    category_index_set.remove(tree_stack.pop().question_index)

            if node.is_category:
                # push category node into stack
                category_index_set.add(node.question_index)
                tree_stack.append(node)

    return None
