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
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';

interface StepDetailsProps {
  selectedStep?: WorkflowTemplateStepWithFormAndIndex;
  isInstance?: boolean;
  isEditMode?: boolean;
  onStepChange?: (stepId: string, field: string, value: string) => void;
}

export const StepDetails: React.FC<StepDetailsProps> = ({
  selectedStep,
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
                {selectedStep.form?.classification.name || 'No form associated'}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};
