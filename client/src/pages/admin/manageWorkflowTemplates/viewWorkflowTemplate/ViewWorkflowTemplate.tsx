import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  FormControlLabel,
  Divider,
  TextField,
  Stack,
  Input,
  Switch,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { useEffect, useMemo, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TemplateStep,
  TemplateStepWithFormAndIndex,
} from 'src/shared/types/workflow/workflowTypes';
import { listTemplateSteps } from 'src/shared/api/modules/workflowTemplates';
import { ViewTemplateSteps } from './ViewTemplateSteps';

export const ViewWorkflowTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewWorkflow = location.state?.viewWorkflow;

  const [viewWorkflowSteps, setViewWorkflowSteps] = useState<
    TemplateStep[] | undefined
  >(undefined);

  const workflowTemplateStepsQuery = useQuery({
    queryKey: ['workflowTemplateSteps', viewWorkflow?.id],
    queryFn: async (): Promise<TemplateStep[]> => {
      const result = await listTemplateSteps(viewWorkflow.id);
      return Array.isArray(result)
        ? result
        : (result as { items: TemplateStep[] }).items || [];
    },
    enabled: !!viewWorkflow?.id,
  });

  useEffect(() => {
    setViewWorkflowSteps(workflowTemplateStepsQuery.data);
  }, [workflowTemplateStepsQuery.data]);

  const isLoading = workflowTemplateStepsQuery.isPending;

  const formatDate = (d?: string) => {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const dash = (v?: string) => (v && String(v).trim() ? v : '—');
  const collectionName = useMemo(
    () => dash(viewWorkflow?.classification?.name),
    [viewWorkflow]
  );
  const InlineField = ({
    label,
    value,
    minLabelWidth = 108,
    tooltipTitle,
  }: {
    label: string;
    value: string;
    minLabelWidth?: number;
    tooltipTitle?: ReactNode;
  }) => {
    const inputEl = (
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
            <Box sx={{ width: '100%' }}>{inputEl}</Box>
          </Tooltip>
        ) : (
          inputEl
        )}
      </Box>
    );
  };

  const versionText = `V${viewWorkflow?.version ?? '1'}`;
  const lastEditedDate = formatDate(viewWorkflow?.lastEdited);

  return (
    <>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Go back" placement="top">
            <IconButton
              onClick={() => navigate(`/admin/workflow-templates`)}
              size="medium">
              <ChevronLeftIcon color="inherit" fontSize="large" />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h2" sx={{ ml: 0.5 }}>
            Workflow Template: {dash(viewWorkflow?.name)}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>
          Workflow Template Basic Info
        </Typography>

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
                value={viewWorkflow?.description ?? ''}
                placeholder="Enter description"
                multiline
                minRows={3}
                fullWidth
                InputProps={{ readOnly: true }}
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
                    <HelpOutlineOutlinedIcon
                      fontSize="small"
                      color="disabled"
                    />
                  </Tooltip>
                </Box>
              }
              control={<Switch checked={!!viewWorkflow?.archived} readOnly />}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <InlineField
              label="First Create:"
              value={formatDate(viewWorkflow?.dateCreated)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" component="h2" sx={{ ml: 1, mb: 2 }}>
          {`Workflow Template Steps${
            typeof viewWorkflowSteps?.length === 'number'
              ? ` (${viewWorkflowSteps.length})`
              : ''
          }`}
        </Typography>

        {isLoading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : (
          <ViewTemplateSteps
            steps={viewWorkflowSteps as TemplateStepWithFormAndIndex[]}
            firstStep={viewWorkflow?.startingStepId}
          />
        )}
      </Paper>
    </>
  );
};
