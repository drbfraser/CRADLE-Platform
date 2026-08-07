import {
  Box,
  Grid,
  Tooltip,
  FormControlLabel,
  Switch,
  Input,
  Typography,
  Stack,
  TextField,
} from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { ReactNode } from 'react';
import { getPrettyDateTime } from 'src/shared/utils';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';

interface WorkflowMetadataProps {
  classificationName?: string;
  description?: string;
  version?: string;
  lastEdited?: number;
  archived?: boolean;
  dateCreated?: number;
  isEditMode?: boolean;
  isClassificationEditable?: boolean;
  onFieldChange?: (field: keyof WorkflowTemplate, value: unknown) => void;
  languages?: string[];
  selectedLanguage?: string;
  onTranslatedFieldChange?: (field: 'name' | 'description', value: string) => void;
}

const InlineField = ({
  label,
  value,
  minLabelWidth = 108,
  tooltipTitle,
  isEditable = false,
  onChange,
  fieldName,
}: {
  label: string;
  value: string;
  minLabelWidth?: number;
  tooltipTitle?: ReactNode;
  isEditable?: boolean;
  onChange?: (value: string) => void;
  fieldName?: keyof WorkflowTemplate;
}) => {
  const dash = (v?: string) => (v && String(v).trim() ? v : '—');

  const inputEl = isEditable ? (
    <TextField
      value={dash(value)}
      onChange={(e) => onChange?.(e.target.value)}
      fullWidth
      size="small"
      variant="outlined"
      sx={{
        minWidth: 120,
        maxWidth: '100%',
      }}
    />
  ) : (
    <Input
      value={dash(value)}
      inputProps={{ readOnly: true }}
      onFocus={(e) => (e.target as HTMLInputElement).blur()}
      fullWidth
      sx={{
        '& .MuiInputBase-input': { cursor: 'default' },
        minWidth: 120,
        maxWidth: '100%',
      }}
    />
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="subtitle1" sx={{ minWidth: minLabelWidth }}>
        {label}
      </Typography>
      {tooltipTitle ? (
        <Tooltip title={tooltipTitle} placement="top">
          {inputEl}
        </Tooltip>
      ) : (
        inputEl
      )}
    </Box>
  );
};

export const WorkflowMetadata = ({
  classificationName,
  description,
  version,
  lastEdited,
  archived,
  dateCreated,
  isEditMode = false,
  isClassificationEditable = false,
  onFieldChange,
  languages = [],
  selectedLanguage,
  onTranslatedFieldChange,
}: WorkflowMetadataProps) => {
  const versionText = `${version ?? ''}`;
  const lastEditedDate = lastEdited
    ? getPrettyDateTime(new Date(lastEdited).getTime())
    : 'N/A';
  const isMultiLang = languages.length > 0;

  const handleFieldChange = (field: keyof WorkflowTemplate, value: unknown) => {
    onFieldChange?.(field, value);
  };

  const handleNameChange = (value: string) => {
    if (isMultiLang) {
      onTranslatedFieldChange?.('name', value);
    } else {
      handleFieldChange('name', value);
    }
  };

  const handleDescriptionChange = (value: string) => {
    if (isMultiLang) {
      onTranslatedFieldChange?.('description', value);
    } else {
      handleFieldChange('description', value);
    }
  };

  const nameMissing = isMultiLang && !classificationName?.trim();
  const descriptionMissing = isMultiLang && !description?.trim();

  return (
    <>
      {/* Row 1: Classification + Description */}
      <Grid
        container
        columnSpacing={6}
        rowSpacing={{ xs: 2, md: 0 }}
        justifyContent="flex-start"
        alignItems="flex-start"
        sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                Template Name{selectedLanguage ? ` (${selectedLanguage})` : ''}:{' '}
                {isClassificationEditable && (
                  <Typography component="span" color="error">
                    *
                  </Typography>
                )}
              </Typography>
              <TextField
                value={classificationName || ''}
                placeholder="Enter template name"
                fullWidth
                error={isEditMode && isClassificationEditable && nameMissing}
                helperText={
                  isEditMode && isClassificationEditable && nameMissing
                    ? `Required for ${selectedLanguage}`
                    : undefined
                }
                InputProps={{
                  readOnly: !isEditMode || !isClassificationEditable,
                }}
                onChange={
                  isEditMode && isClassificationEditable
                    ? (e) => handleNameChange(e.target.value)
                    : undefined
                }
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                Description{selectedLanguage ? ` (${selectedLanguage})` : ''}:
              </Typography>
              <TextField
                value={description || ''}
                placeholder="Enter description"
                multiline
                minRows={3}
                fullWidth
                helperText={
                  isEditMode && descriptionMissing
                    ? `No description added for ${selectedLanguage} yet`
                    : undefined
                }
                InputProps={{ readOnly: !isEditMode }}
                onChange={
                  isEditMode
                    ? (e) => handleDescriptionChange(e.target.value)
                    : undefined
                }
              />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      {/* Row 2: Version | Last Edited */}
      <Grid
        container
        columnSpacing={6}
        rowSpacing={{ xs: 2, md: 0 }}
        justifyContent="space-around"
        alignItems="center"
        sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <InlineField label="Version:" value={versionText} />
        </Grid>

        <Grid item xs={12} md={5}>
          <InlineField label="Last Edited:" value={lastEditedDate} />
        </Grid>
      </Grid>

      {/* Row 3: Archived | First Create */}
      <Grid
        container
        columnSpacing={6}
        rowSpacing={{ xs: 2, md: 0 }}
        justifyContent="space-around"
        alignItems="center">
        <Grid item xs={12} md={5}>
          <FormControlLabel
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span>Archived</span>
                <Tooltip
                  title="Archived workflows are read‑only and hidden from default lists."
                  placement="top">
                  <HelpOutlineOutlinedIcon fontSize="small" color="disabled" />
                </Tooltip>
              </Box>
            }
            control={
              <Switch
                checked={!!archived}
                readOnly={!isEditMode}
                onChange={
                  isEditMode
                    ? (e) => handleFieldChange('archived', e.target.checked)
                    : undefined
                }
              />
            }
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <InlineField
            label="First Create:"
            value={
              dateCreated
                ? getPrettyDateTime(new Date(dateCreated).getTime())
                : 'N/A'
            }
          />
        </Grid>
      </Grid>
    </>
  );
};
