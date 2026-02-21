import React, {useState} from 'react';
import { Typography, Paper, Button, Box} from '@mui/material';
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import { BranchConditionEditor } from './BranchConditionEditor';

interface BranchDetailsProps {
  selectedStep?: WorkflowTemplateStepWithFormAndIndex;
  selectedBranchIndex?: number;
  steps: WorkflowTemplateStepWithFormAndIndex[];
  isEditMode?: boolean;
  onBranchChange?: (
    stepId: string,
    branchIndex: number,
    conditionRule: string,
    conditionName?: string
  ) => void;
   onClose: () => void; 
}

export const BranchDetails: React.FC<BranchDetailsProps> = ({
  selectedStep,
  selectedBranchIndex,
  steps,
  isEditMode = false,
  onBranchChange,
  onClose,
}) => {
  const branch = selectedStep?.branches?.[selectedBranchIndex || 0];
  
  //For Manual Saving
  const [localConditionRule, setLocalConditionRule] = useState<string>(
    branch?.condition?.rule || ''
  );
  const [localConditionName, setLocalConditionName] = useState<string>(
    branch?.condition?.rule ? (() => {
      try {
        return JSON.parse(branch.condition.rule).name || '';
      } catch {
        return '';
      }
    })() : ''
  );
  const handleBranchChange = (
    stepId: string,
    branchIndex: number,
    conditionRule: string,
    conditionName?: string
  ) => {
    //onBranchChange?.(stepId, branchIndex, conditionRule, conditionName);
    setLocalConditionRule(conditionRule);
    setLocalConditionName(conditionName || '');
  };
  const handleCancel = () => {
    onClose();
  };
  const handleSave = () => {
    if (selectedStep && selectedBranchIndex !== undefined) {
      onBranchChange?.(
        selectedStep.id,
        selectedBranchIndex,
        localConditionRule,
        localConditionName
      );
    }
    onClose();
  };
  if (!selectedStep || selectedBranchIndex === undefined) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Branch Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click on a branch (+ button or condition) in the flow diagram to edit
          its conditions.
        </Typography>
      </Paper>
    );
  }
  
  if (!branch) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Branch Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Branch not found.
        </Typography>
      </Paper>
    );
  }

  const targetStep = steps.find((s) => s.id === branch.targetStepId);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}> 
      </Box>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
        {isEditMode ? 'Edit Branch Condition' : 'View Branch Condition'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        From: <strong>{selectedStep.name}</strong> → To:{' '}
        <strong>{targetStep?.name || 'Unknown Step'}</strong>
      </Typography>
      <BranchConditionEditor
        branch={branch}
        branchIndex={selectedBranchIndex}
        stepId={selectedStep.id}
        targetStepName={targetStep?.name}
        isEditMode={isEditMode}
        isSelected={true}
        showFullEditor={true}
        onChange={handleBranchChange}
        steps={steps}
      />
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={handleCancel} variant="outlined" color="primary">
          Cancel
        </Button>
        {isEditMode && (
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        )}
      </Box>
    </Box>
  );
};
