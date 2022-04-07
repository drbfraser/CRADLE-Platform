from typing import NamedTuple, Union

class Node(NamedTuple):
    question: dict
    children: list

def bfs_order(question_list: list) -> Union[list, str]:
    """
    return a list of questions with reasonable insert order. If error
    occurs in the process, return the error message.

    ----------------------------------------------------------------
    Currently, each question has a self-reference field categoryId
    that points to the category question. For a template post, if
    we insert all questions attached to the template regardless of
    the insertion order, the insertion process might fail due to 
    the foreign key constraint.

    To solve this problem, here we construct a question inmemory 
    tree. The linkage of tree nodes indicates the dependency between
    questions. The example below shows q1 is the category of q2 and 
    q4, so q1 should be inserted before q2 and q4.
    e.g.   
              head
              / \
             q1 q3 
             / \
            q2 q4  
    
    After the tree is constructed, we'd use BFS to output a list of
    questions with reasonable insert order. This logic could be used
    in the future when sub-category (or sub-sub-category...) involves.
    """
    # head is the dummy node
    question_tree_map = {"head": []}

    for question in question_list:
        question_tree_map[question.get("id")] = Node(question, [])
    
    for qid in question_tree_map:
        if qid == "head":
            continue
        node: Node = question_tree_map[qid]
        cid = None
        if "categoryId" in node.question and node.question.get("categoryId") != None:
            cid = node.question.get("categoryId")
        
        if cid == None:
            # node is at the top-level
            question_tree_map["head"].append(node)
        else:
            if cid in question_tree_map:
                question_tree_map["cid"].children.append(node)
            else:
                return "question(id=" + qid + ") points to a nonexistent category id"
    
    # run bfs to get the output list
    fifo_queue = question_tree_map["head"]
    output_question_list = []
    while len(fifo_queue):
        cur: Node = fifo_queue.pop(0)
        output_question_list.append(cur.question)
        for child in cur.children:
            fifo_queue.append(child)
    
    # check circular dependency
    # if there are circular dependency occurs, the circle must be a 
    # isolated one from the head node which would never be visited, 
    # as each node only has one pointer so only need to check the 
    # length of output_list
    if len(output_question_list) != len(question_list):
        return "there are circular dependencies in the question list"
    
    return output_question_list



