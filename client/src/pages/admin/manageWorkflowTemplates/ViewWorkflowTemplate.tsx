import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  Divider,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TemplateStep,
  TemplateStepWithFormAndIndex,
} from 'src/shared/types/workflow/workflowTypes';
import { listTemplateSteps } from 'src/shared/api/modules/workflowTemplates';
import { WorkflowMetadata } from '../../../shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { WorkflowSteps } from 'src/shared/components/workflow/WorkflowSteps';

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

  const dash = (v?: string) => (v && String(v).trim() ? v : '—');
  const collectionName = useMemo(
    () => dash(viewWorkflow?.classification?.name),
    [viewWorkflow]
  );

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

        {/* meta data display component */}
        <WorkflowMetadata
          description={viewWorkflow?.description}
          collectionName={collectionName}
          version={viewWorkflow?.version}
          lastEdited={viewWorkflow?.lastEdited}
          archived={viewWorkflow?.archived}
          dateCreated={viewWorkflow?.dateCreated}
        />

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
          <WorkflowSteps
            steps={viewWorkflowSteps as TemplateStepWithFormAndIndex[]}
            firstStep={viewWorkflow?.startingStepId}
          />
        )}
      </Paper>
    </>
  );
};
