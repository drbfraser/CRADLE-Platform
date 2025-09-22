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
import { getPrettyDate } from 'src/shared/utils';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowTypes';

interface WorkflowMetadataProps {
  description?: string;
  collectionName?: string;
  version?: number;
  lastEdited?: string;
  archived?: boolean;
  dateCreated?: string;
  isEditMode?: boolean;
  onFieldChange?: (field: keyof WorkflowTemplate, value: any) => void;
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
  description,
  collectionName,
  version,
  lastEdited,
  archived,
  dateCreated,
  isEditMode = false,
  onFieldChange,
}: WorkflowMetadataProps) => {
  const versionText = `V${version ?? '1'}`;
  const lastEditedDate = lastEdited
    ? getPrettyDate(new Date(lastEdited).getTime() / 1000)
    : '';

  const handleFieldChange = (field: keyof WorkflowTemplate, value: any) => {
    onFieldChange?.(field, value);
  };

  return (
    <>
      {/* Row 1: Description | Collection */}
      <Grid
        container
        columnSpacing={6}
        rowSpacing={{ xs: 2, md: 0 }}
        justifyContent="space-around"
        alignItems="flex-start"
        sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
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
                    const versionNum = parseInt(value.replace('V', '')) || 1;
                    handleFieldChange('version', versionNum);
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
                ? getPrettyDate(new Date(dateCreated).getTime() / 1000)
                : ''
            }
          />
        </Grid>
      </Grid>
    </>
  );
};
