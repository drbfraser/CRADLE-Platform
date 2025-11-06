import React, { useState, useMemo } from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import { ID } from 'src/shared/constants';
import { WorkflowFlow } from './WorkflowFlow';
import { StepDetails } from './StepDetails';

interface WorkflowFlowViewProps {
  steps: WorkflowTemplateStepWithFormAndIndex[];
  firstStepId: ID;
  isInstance?: boolean;
  isEditMode?: boolean;
  selectedStepId?: string;
  onStepChange?: (stepId: string, field: string, value: string) => void;
  onStepSelect?: (stepId: string) => void;
  onInsertNode?: (stepId: string) => void;
  onAddBranch?: (stepId: string) => void;
}

export const WorkflowFlowView: React.FC<WorkflowFlowViewProps> = ({
  steps,
  firstStepId,
  isInstance = false,
  isEditMode = false,
  selectedStepId: controlledSelectedStepId,
  onStepChange,
  onStepSelect,
  onInsertNode,
  onAddBranch,
}) => {
  const [internalSelectedStepId, setInternalSelectedStepId] = useState<
    string | undefined
  >();

  // Use controlled prop if provided, otherwise use internal state
  const selectedStepId =
    controlledSelectedStepId !== undefined
      ? controlledSelectedStepId
      : internalSelectedStepId;

  const selectedStep = useMemo(() => {
    if (!selectedStepId) return undefined;
    return steps.find((step) => step.id === selectedStepId);
  }, [selectedStepId, steps]);

  const handleStepSelect = (stepId: string) => {
    if (onStepSelect) {
      onStepSelect(stepId);
    } else {
      setInternalSelectedStepId(stepId);
    }
  };

  return (
    <Box sx={{ height: '600px', width: '100%', overflow: 'hidden' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Left side - Flow Diagram */}
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <Paper
            sx={{
              height: '100%',
              p: 1,
              overflow: 'hidden',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
            }}>
            <Typography variant="h6" sx={{ mb: 2, px: 2 }}>
              Workflow Flow Diagram
            </Typography>
            <Box sx={{ height: 'calc(100% - 60px)', overflow: 'hidden' }}>
              <WorkflowFlow
                steps={steps}
                firstStepId={firstStepId}
                selectedStepId={selectedStepId}
                isEditMode={isEditMode}
                onStepSelect={handleStepSelect}
                onInsertNode={onInsertNode}
                onAddBranch={onAddBranch}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Step Details */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Box
            sx={{
              height: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden',
            }}>
            <StepDetails
              selectedStep={selectedStep}
              steps={steps}
              isInstance={isInstance}
              isEditMode={isEditMode}
              onStepChange={onStepChange}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
