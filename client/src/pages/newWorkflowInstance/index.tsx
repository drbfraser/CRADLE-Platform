import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PatientHeader from 'src/shared/components/patientHeader/PatientHeader';
import usePatient from 'src/shared/hooks/patient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';

import { createInstance } from 'src/shared/api/modules/workflowInstance';
import { getAllWorkflowTemplatesAsync } from 'src/shared/api/modules/workflowTemplates';
import {
  InstanceInput,
  WorkflowTemplate,
} from 'src/shared/types/workflow/workflowApiTypes';

type RouteParams = {
  patientId: string;
};

export const NewWorkflowInstancePage: React.FC = () => {
  const { patientId } = useParams() as RouteParams;
  const { patient } = usePatient(patientId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const {
    data: templates = [],
    isLoading: templatesLoading,
    isError: templatesError,
  } = useQuery<WorkflowTemplate[]>({
    queryKey: ['workflowTemplates', false],
    queryFn: () => getAllWorkflowTemplatesAsync(false),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!patientId) {
        throw new Error('Missing patientId in route.');
      }
      if (!selectedTemplateId) {
        throw new Error('Please select a workflow template.');
      }

      const payload: InstanceInput = {
        workflowTemplateId: selectedTemplateId,
        patientId,
        name,
        description,
        // formResponses: [], // add later if needed
      };

      return createInstance(payload);
    },
    onSuccess: (_instance) => {
      // Refresh instances for this patient
      queryClient.invalidateQueries({
        queryKey: ['workflowInstances', patientId],
      });

      // Redirect back to patient summary with toast
      navigate(`/patients/${patientId}`, {
        state: {
          toast: {
            severity: 'success',
            message: 'Workflow instance created successfully',
          },
        },
      });
    },
  });

  const handleSubmit = () => {
    createMutation.mutate();
  };

  const isSubmitting = createMutation.isPending;
  const isStartDisabled =
    isSubmitting ||
    templatesLoading ||
    !selectedTemplateId ||
    templates.length === 0;

  return (
    <Box
      sx={{
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}>
      <PatientHeader title="New Workflow" patient={patient} />

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Page header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center">
            <Box>
              <Typography variant="h5" gutterBottom>
                Start a new workflow
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a workflow template and optionally provide a name and
                description to help identify this instance later.
              </Typography>
            </Box>

            {templatesLoading && <CircularProgress size={24} />}
          </Box>

          {/* Templates error / empty states */}
          {templatesError && (
            <Alert severity="error">
              Failed to load workflow templates. Please try again or contact
              support if the problem persists.
            </Alert>
          )}

          {!templatesLoading && !templatesError && templates.length === 0 && (
            <Alert severity="info">
              No workflow templates are available. Create a template first
              before starting a new workflow instance.
            </Alert>
          )}

          {/* Template selection */}
          <FormControl
            fullWidth
            required
            disabled={
              templatesLoading || isSubmitting || templates.length === 0
            }>
            <InputLabel id="workflow-template-label">
              Workflow Template
            </InputLabel>
            <Select
              labelId="workflow-template-label"
              label="Workflow Template"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value as string)}>
              <MenuItem value="">
                <em>Select a template</em>
              </MenuItem>
              {templates.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name ?? t.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Optional metadata */}
          <TextField
            label="Instance Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            placeholder="e.g., Follow-up - March 2025"
          />

          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            placeholder="Add any notes that will help distinguish this workflow instance."
          />

          {/* Create error */}
          {createMutation.isError && (
            <Alert severity="error">
              {(createMutation.error as Error)?.message ||
                'Failed to create workflow instance. Please try again.'}
            </Alert>
          )}

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1.5,
              mt: 1,
            }}>
            <Button
              variant="text"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isStartDisabled}>
              {isSubmitting ? 'Starting…' : 'Start Workflow'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};
