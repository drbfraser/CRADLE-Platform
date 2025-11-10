from typing import Dict, Any, List, Set, Optional


from service.workflow.evaluate.jsonlogic_parser import extract_variables_from_rule


class WorkflowDataResolver:
    """
    Resolves data needed for workflow branch evaluation.
    """
    
    def __init__(self, catalogue: Optional[Dict[str, Any]] = None):
        """Initialize the resolver."""
        self._catalogue = catalogue
    
    @property
    def catalogue(self):
        """Lazy-load the catalogue only when needed."""
        if self._catalogue is None:
            from service.workflow.datasourcing.data_catalogue import get_catalogue
            self._catalogue = get_catalogue()
        return self._catalogue
    
    def extract_variables_from_branches(self, branches: List[Dict[str, Any]]) -> Set[str]:
        """Extract all unique variables from a list of branches."""
        all_variables = set()
        
        for branch in branches:
            if "rule" not in branch:
                continue
            
            rule = branch["rule"]
            variables = extract_variables_from_rule(rule)
            all_variables.update(variables)
        
        return all_variables
    
    def resolve_data_for_branches(
        self, 
        patient_id: str, 
        branches: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Extract variables from branches and resolve their data."""
        from service.workflow.datasourcing.data_sourcing import resolve_variables
        
        variables = self.extract_variables_from_branches(branches)
        variables_list = list(variables)
        resolved_data = resolve_variables(patient_id, variables_list, self.catalogue)
        
        return resolved_data
    
    def evaluate_workflow_branches(
        self,
        patient_id: str,
        branches: List[Dict[str, Any]],
        additional_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Complete workflow: extract variables, fetch data, evaluate branches.
        """
        from service.workflow.evaluate.rules_engine import evaluate_branches
        
        resolved_data = self.resolve_data_for_branches(patient_id, branches)
        
        if additional_data:
            resolved_data.update(additional_data)
        
        result = evaluate_branches(
            branches=branches,
            data=resolved_data
        )
        
        return result


def evaluate_workflow_step(
    patient_id: str,
    branches: List[Dict[str, Any]],
    additional_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Function to evaluate workflow branches."""
    resolver = WorkflowDataResolver()
    return resolver.evaluate_workflow_branches(patient_id, branches, additional_data)