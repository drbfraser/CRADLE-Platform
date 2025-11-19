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
        patientId: patientId,
        name: name,
        description: description,
        // formResponses: [], // add later?
      };

      return createInstance(payload);
    },
    onSuccess: (instance) => {
      queryClient.invalidateQueries({
        queryKey: ['workflowInstances', patientId],
      });

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

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          margin: '0 auto',
          maxWidth: '1250px',
        }}>
        <PatientHeader title="New Workflow" patient={patient} />

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <FormControl
              fullWidth
              disabled={templatesLoading || createMutation.isPending}>
              <InputLabel id="workflow-template-label">
                Workflow Template
              </InputLabel>
              <Select
                labelId="workflow-template-label"
                label="Workflow Template"
                value={selectedTemplateId}
                onChange={(e) =>
                  setSelectedTemplateId(e.target.value as string)
                }>
                {templates.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name ?? t.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {templatesError && (
              <Typography color="error">
                Failed to load workflow templates.
              </Typography>
            )}

            <TextField
              label="Instance Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />

            {createMutation.isError && (
              <Typography color="error">
                {(createMutation.error as Error)?.message ||
                  'Failed to create workflow'}
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={
                  createMutation.isPending ||
                  templatesLoading ||
                  !selectedTemplateId
                }>
                {createMutation.isPending ? 'Starting…' : 'Start Wrokflow'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </>
  );
};
