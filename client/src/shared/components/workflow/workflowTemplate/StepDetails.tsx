import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  TextField,
  Autocomplete,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getAllFormTemplatesAsync } from 'src/shared/api/modules/formTemplates';
import {
  WorkflowTemplateStepWithFormAndIndex,
  WorkflowTemplateStepBranch,
} from 'src/shared/types/workflow/workflowApiTypes';

interface StepDetailsProps {
  selectedStep?: WorkflowTemplateStepWithFormAndIndex;
  steps: WorkflowTemplateStepWithFormAndIndex[];
  isInstance?: boolean;
  isEditMode?: boolean;
  onStepChange?: (stepId: string, field: string, value: string) => void;
}

export const StepDetails: React.FC<StepDetailsProps> = ({
  selectedStep,
  steps,
  isInstance = false,
  isEditMode = false,
  onStepChange,
}) => {
  // Fetch all available form templates for the dropdown
  const formTemplatesQuery = useQuery({
    queryKey: ['formTemplates', false],
    queryFn: () => getAllFormTemplatesAsync(false),
    enabled: isEditMode, // Only fetch when in edit mode
  });

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
            {isEditMode ? (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={selectedStep.name}
                onChange={(e) =>
                  onStepChange?.(selectedStep.id, 'name', e.target.value)
                }
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {selectedStep.name}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>
            {isEditMode ? (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                multiline
                rows={3}
                value={selectedStep.description || ''}
                onChange={(e) =>
                  onStepChange?.(selectedStep.id, 'description', e.target.value)
                }
                placeholder="Enter step description..."
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {selectedStep.description || 'No description provided'}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Associated Form
            </Typography>
            {isEditMode ? (
              <Autocomplete
                fullWidth
                options={formTemplatesQuery.data || []}
                getOptionLabel={(option) => option.classification.name}
                value={
                  formTemplatesQuery.data?.find(
                    (form) => form.id === selectedStep.formId
                  ) || null
                }
                onChange={(_, newValue) => {
                  onStepChange?.(selectedStep.id, 'formId', newValue?.id || '');
                }}
                loading={formTemplatesQuery.isLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    placeholder="Select a form..."
                    sx={{ mt: 0.5 }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {/* TODO: update this type when form submissions are integrated */}
                {selectedStep.form.classification.name as any || 'No form associated'}
              </Typography>
            )}
          </Box>

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
              (branch: WorkflowTemplateStepBranch, index: number) => {
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
