import React from 'react';
import { Typography, Paper } from '@mui/material';
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
}

export const BranchDetails: React.FC<BranchDetailsProps> = ({
  selectedStep,
  selectedBranchIndex,
  steps,
  isEditMode = false,
  onBranchChange,
}) => {
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

  const branch = selectedStep.branches?.[selectedBranchIndex];
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
    <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Branch Information
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
        onChange={onBranchChange}
      />
    </Paper>
  );
};
