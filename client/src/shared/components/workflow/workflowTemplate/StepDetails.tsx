import React, { useEffect, useRef } from 'react';
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

import { getAllFormTemplatesAsyncV2 } from 'src/shared/api/modules/formTemplates';
import StepDescription from 'src/shared/components/workflow/StepDescription';
import { FormTemplateList } from 'src/shared/types/form/formTemplateTypes';
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import DescriptionFormattingHelp from './DescriptionFormattingHelp';
import DescriptionDateInsertPicker from './DescriptionDateInsertPicker';

interface StepDetailsProps {
  selectedStep?: WorkflowTemplateStepWithFormAndIndex;
  isInstance?: boolean;
  isEditMode?: boolean;
  onStepChange?: (stepId: string, field: string, value: string) => void;
  onCaptureState?: () => void;
}

export const StepDetails: React.FC<StepDetailsProps> = ({
  selectedStep,
  isInstance: _isInstance = false,
  isEditMode = false,
  onStepChange,
  onCaptureState,
}) => {
  const formTemplatesQuery = useQuery({
    queryKey: ['workflowStepFormTemplatesV2', false],
    queryFn: async () => (await getAllFormTemplatesAsyncV2(false)).templates,
  });

  useEffect(() => {
    if (
      !selectedStep ||
      !isEditMode ||
      !formTemplatesQuery.data ||
      !selectedStep.formId
    )
      return;

    const classificationId = selectedStep.form?.classification?.id;
    if (!classificationId) return;

    if (!selectedStep.form?.archived) return;

    const latestForm = formTemplatesQuery.data.find((f: FormTemplateList) => {
      if (f.archived) return false;
      const fClassId = f.form_classification_id ?? f.formClassificationId;
      return fClassId === classificationId;
    });
    if (latestForm) {
      onStepChange?.(selectedStep.id, 'formId', latestForm.id);
    }
  }, [isEditMode, selectedStep?.id, formTemplatesQuery.data]);

  const descriptionInputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInsertDateToken = (token: string) => {
    if (!selectedStep) return;
    const textarea = descriptionInputRef.current;
    const currentValue = selectedStep.description || '';

    if (!textarea) {
      onStepChange?.(selectedStep.id, 'description', `${currentValue}${token}`);
      onCaptureState?.();
      return;
    }

    const start = textarea.selectionStart ?? currentValue.length;
    const end = textarea.selectionEnd ?? currentValue.length;
    const newValue =
      currentValue.slice(0, start) + token + currentValue.slice(end);

    onStepChange?.(selectedStep.id, 'description', newValue);
    onCaptureState?.();

    requestAnimationFrame(() => {
      const cursorPosition = start + token.length;
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

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

  const selectedFormOption = formTemplatesQuery.data?.find(
    (form: FormTemplateList) => form.id === selectedStep.formId
  );

  const isFormArchived =
    selectedFormOption?.archived ?? selectedStep.form?.archived ?? false;

  const resolvedFormName =
    selectedFormOption?.name ||
    (typeof selectedStep.form?.classification?.name === 'string'
      ? selectedStep.form.classification.name
      : undefined) ||
    (selectedStep.formId ? `Form ID: ${selectedStep.formId}` : undefined);

  const selectedFormName = resolvedFormName
    ? isFormArchived
      ? `${resolvedFormName} [OLD]`
      : resolvedFormName
    : undefined;

  // In edit mode, when the step's form is archived, resolve the latest non-archived form for the same classification so the dropdown defaults to it.
  const latestNonArchivedForm = isFormArchived
    ? ((formTemplatesQuery.data ?? []).find((f: FormTemplateList) => {
        if (f.archived) return false;
        const fClassId = f.form_classification_id ?? f.formClassificationId;
        return fClassId === selectedStep.form?.classification?.id;
      }) ?? null)
    : null;

  const autocompleteValue = isEditMode
    ? (latestNonArchivedForm ?? selectedFormOption ?? null)
    : (selectedFormOption ?? null);

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
                onBlur={() => onCaptureState?.()}
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {selectedStep.name}
              </Typography>
            )}
          </Box>

          <Box>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              {isEditMode && (
                <>
                  <DescriptionFormattingHelp />
                  <DescriptionDateInsertPicker
                    onInsertDate={handleInsertDateToken}
                  />
                </>
              )}
            </Stack>
            {isEditMode ? (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                multiline
                minRows={5}
                maxRows={20}
                inputRef={descriptionInputRef}
                value={selectedStep.description || ''}
                onChange={(e) =>
                  onStepChange?.(selectedStep.id, 'description', e.target.value)
                }
                onBlur={() => onCaptureState?.()}
                placeholder={`# Heading\n\nSupports **bold**, _italic_, and [links](https://example.com).\n\n- Bullet item\n- Another item\n\n1. First step\n2. Second step\n\nRecommend patient come back in 3 days ({{startDate+3d}}).`}
                helperText="Markdown supported"
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Box sx={{ mt: 0.5 }}>
                <StepDescription
                  description={selectedStep.description}
                  fallback="No description provided"
                />
              </Box>
            )}
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Associated Form
            </Typography>
            {isEditMode ? (
              <Autocomplete
                fullWidth
                options={(formTemplatesQuery.data ?? []).filter(
                  (f: FormTemplateList) => !f.archived
                )}
                getOptionLabel={(option) => option.name}
                value={autocompleteValue}
                onChange={(_, newValue) => {
                  onStepChange?.(selectedStep.id, 'formId', newValue?.id || '');
                  onCaptureState?.();
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
                isOptionEqualToValue={(option, value) =>
                  value != null && option.id === value.id
                }
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {selectedFormName || 'No form associated'}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};
