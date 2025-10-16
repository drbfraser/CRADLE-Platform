import React, { useState, useMemo } from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import { TemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import { ID } from 'src/shared/constants';
import { WorkflowFlow } from './WorkflowFlow';
import { StepDetails } from './StepDetails';

interface WorkflowFlowViewProps {
  steps: TemplateStepWithFormAndIndex[];
  firstStepId: ID;
  isInstance?: boolean;
}

export const WorkflowFlowView: React.FC<WorkflowFlowViewProps> = ({
  steps,
  firstStepId,
  isInstance = false,
}) => {
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>();

  const selectedStep = useMemo(() => {
    if (!selectedStepId) return undefined;
    return steps.find((step) => step.id === selectedStepId);
  }, [selectedStepId, steps]);

  const handleStepSelect = (stepId: string) => {
    setSelectedStepId(stepId);
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
                onStepSelect={handleStepSelect}
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
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
