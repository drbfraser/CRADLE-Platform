import {
  Autocomplete,
  Box,
  Chip,
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
import { getLanguages, getPrettyDateTime } from 'src/shared/utils';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';

interface WorkflowMetadataProps {
  name?: string;
  description?: string;
  collectionName?: string;
  version?: string;
  lastEdited?: number;
  archived?: boolean;
  dateCreated?: number;
  isEditMode?: boolean;
  onFieldChange?: (field: keyof WorkflowTemplate, value: any) => void;
  selectedLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  availableLanguages?: string[];
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
  name,
  description,
  collectionName,
  version,
  lastEdited,
  archived,
  dateCreated,
  isEditMode = false,
  onFieldChange,
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
}: WorkflowMetadataProps) => {
  const versionText = `${version ?? ''}`;
  const lastEditedDate = lastEdited
    ? getPrettyDateTime(new Date(lastEdited).getTime())
    : 'N/A';

  const handleFieldChange = (field: keyof WorkflowTemplate, value: any) => {
    onFieldChange?.(field, value);
  };

  return (
    <>
      {/* Row 0: Language selector - shown in edit mode */}
      {isEditMode && onLanguageChange && (
        <Grid
          container
          columnSpacing={6}
          rowSpacing={{ xs: 2, md: 0 }}
          justifyContent="space-around"
          alignItems="center"
          sx={{ mb: 3 }}>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: 108 }}>
                Language:
              </Typography>
              <Autocomplete
                value={selectedLanguage || 'English'}
                onChange={(_event, newValue) => {
                  if (newValue) onLanguageChange(newValue);
                }}
                options={getLanguages().filter(
                  (lang): lang is string => typeof lang === 'string'
                )}
                disableClearable
                size="small"
                sx={{ minWidth: 200, flex: 1 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Language"
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={5} />
        </Grid>
      )}

      {/* Row 0a: Read-only language display - shown in view mode */}
      {!isEditMode && availableLanguages && availableLanguages.length > 0 && (
        <Grid
          container
          columnSpacing={6}
          rowSpacing={{ xs: 2, md: 0 }}
          justifyContent="space-around"
          alignItems="center"
          sx={{ mb: 3 }}>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: 108 }}>
                Language:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {availableLanguages.map((lang) => (
                  <Chip
                    key={lang}
                    label={lang}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={5} />
        </Grid>
      )}

      {/* Row 1: Left (Name + Description) | Right (Collection) */}
      <Grid
        container
        columnSpacing={6}
        rowSpacing={{ xs: 2, md: 0 }}
        justifyContent="space-around"
        alignItems="flex-start"
        sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">Name:</Typography>
              <TextField
                value={name || ''}
                placeholder="Enter name"
                fullWidth
                InputProps={{ readOnly: !isEditMode }}
                onChange={
                  isEditMode
                    ? (e) => handleFieldChange('name', e.target.value)
                    : undefined
                }
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">Description:</Typography>
              <TextField
                value={description || ''}
                placeholder="Enter description"
                multiline
                minRows={3}
                fullWidth
                InputProps={{ readOnly: !isEditMode }}
                onChange={
                  isEditMode
                    ? (e) => handleFieldChange('description', e.target.value)
                    : undefined
                }
              />
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1">Collection:</Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
              {collectionName}
            </Typography>
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
          <InlineField
            label="Version:"
            value={versionText}
            isEditable={isEditMode}
            onChange={
              isEditMode
                ? (value) => {
                    if (value) {
                      handleFieldChange('version', value);
                    } else {
                      handleFieldChange('version', 'V');
                    }
                  }
                : undefined
            }
            fieldName="version"
          />
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
