import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForever from '@mui/icons-material/DeleteForever';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';

type WorkflowTemplatePageHeaderProps = {
  title: string;
  onBack: () => void;
  workflow?: WorkflowTemplate;
  isEditMode?: boolean;
  onEdit?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
};

const dash = (v?: string) => (v && String(v).trim() ? v : '—');

export const WorkflowTemplatePageHeader = ({
  title,
  onBack,
  workflow,
  isEditMode = false,
  onEdit,
  onArchive,
  onUnarchive,
}: WorkflowTemplatePageHeaderProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title="Go back" placement="top">
        <IconButton onClick={onBack} size="medium">
          <ChevronLeftIcon color="inherit" fontSize="large" />
        </IconButton>
      </Tooltip>
      <Typography variant="h4" component="h2" sx={{ ml: 0.5 }}>
        {title}
      </Typography>
    </Box>

    {!isEditMode && workflow && (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={onEdit}
          disabled={workflow.archived}>
          Edit
        </Button>

        {!workflow.archived ? (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForever />}
            onClick={onArchive}>
            Archive Workflow
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<UnarchiveIcon />}
            onClick={onUnarchive}>
            Unarchive Workflow
          </Button>
        )}
      </Stack>
    )}
  </Box>
);

export { dash };
