import React from 'react';
import { Box, Typography, Paper, Divider, Stack } from '@mui/material';
import {
  TemplateStepWithFormAndIndex,
  TemplateStepBranch,
} from '../../../../types/workflow/workflowTypes';

interface StepDetailsProps {
  selectedStep?: TemplateStepWithFormAndIndex;
  steps: TemplateStepWithFormAndIndex[];
  isInstance?: boolean;
}

export const StepDetails: React.FC<StepDetailsProps> = ({
  selectedStep,
  steps,
  isInstance = false,
}) => {
  if (!selectedStep) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Step Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click on a step in the flow diagram to view its details.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Step Information
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Stack spacing={1}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Step Name
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              {selectedStep.name}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              {selectedStep.description || 'No description provided'}
            </Typography>
          </Box>

          {selectedStep.form && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Associated Form
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {selectedStep.form.classification.name}
              </Typography>
            </Box>
          )}

          {selectedStep.expectedCompletion && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Expected Completion
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {new Date(selectedStep.expectedCompletion).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {selectedStep.branches && selectedStep.branches.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Branches
          </Typography>
          <Stack spacing={1}>
            {selectedStep.branches.map(
              (branch: TemplateStepBranch, index: number) => {
                const targetStep = steps.find(
                  (s) => s.id === branch.targetStepId
                );
                return (
                  <Box
                    key={index}
                    sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Branch {index + 1}
                    </Typography>
                    <Typography variant="body1">
                      → {targetStep?.name || 'Unknown Step'}
                    </Typography>
                    {branch.condition && (
                      <Typography variant="caption" color="text.secondary">
                        {/*TODO: parse the raw condition string into a readable format*/}
                        Condition: {JSON.stringify(branch.condition)}
                      </Typography>
                    )}
                  </Box>
                );
              }
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};
