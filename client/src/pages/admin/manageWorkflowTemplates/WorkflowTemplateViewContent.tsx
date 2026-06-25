import {
  Box,
  Button,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import {
  WorkflowTemplate,
  WorkflowTemplateStepWithFormAndIndex,
} from 'src/shared/types/workflow/workflowApiTypes';
import { WorkflowViewMode } from 'src/shared/types/workflow/workflowEnums';
import { WorkflowMetadata } from 'src/shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { WorkflowSteps } from 'src/shared/components/workflow/WorkflowSteps';
import { WorkflowFlowView } from 'src/shared/components/workflow/workflowTemplate/WorkflowFlowView';

type WorkflowTemplateViewContentProps = {
  workflow: WorkflowTemplate | undefined;
  isLoading: boolean;
  viewMode: WorkflowViewMode;
  onViewModeChange: (mode: WorkflowViewMode) => void;
  classificationName?: string;
};

export const WorkflowTemplateViewContent = ({
  workflow,
  isLoading,
  viewMode,
  onViewModeChange,
  classificationName,
}: WorkflowTemplateViewContentProps) => (
  <>
    <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>
      Workflow Template Basic Info
    </Typography>

    <WorkflowMetadata
      classificationName={classificationName}
      description={workflow?.description}
      version={workflow?.version}
      lastEdited={workflow?.lastEdited}
      archived={workflow?.archived}
      dateCreated={workflow?.dateCreated}
      isEditMode={false}
      isClassificationEditable={false}
    />

    <Divider sx={{ my: 3 }} />

    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
      }}>
      <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
        {`Workflow Template Steps${
          typeof workflow?.steps?.length === 'number'
            ? ` (${workflow.steps.length})`
            : ''
        }`}
      </Typography>

      <Stack direction="row" spacing={1}>
        <Button
          variant={
            viewMode === WorkflowViewMode.FLOW ? 'contained' : 'outlined'
          }
          size="small"
          onClick={() => onViewModeChange(WorkflowViewMode.FLOW)}>
          Flow View
        </Button>
        <Button
          variant={
            viewMode === WorkflowViewMode.LIST ? 'contained' : 'outlined'
          }
          size="small"
          onClick={() => onViewModeChange(WorkflowViewMode.LIST)}>
          List View
        </Button>
      </Stack>
    </Box>

    {isLoading ? (
      <Skeleton variant="rectangular" height={400} />
    ) : viewMode === WorkflowViewMode.FLOW ? (
      <WorkflowFlowView
        steps={workflow?.steps as WorkflowTemplateStepWithFormAndIndex[]}
        firstStepId={workflow?.startingStepId || ''}
        isInstance={false}
        isEditMode={false}
      />
    ) : (
      <WorkflowSteps
        steps={workflow?.steps as WorkflowTemplateStepWithFormAndIndex[]}
        firstStep={workflow?.startingStepId}
        isInstance={false}
      />
    )}
  </>
);
