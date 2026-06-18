import { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { WorkflowMetadata } from 'src/shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { InstanceDetails } from 'src/shared/types/workflow/workflowUiTypes';

type WorkflowTemplateDetailsCollapseProps = {
  instanceDetails: InstanceDetails;
};

export default function WorkflowTemplateDetailsCollapse({
  instanceDetails,
}: WorkflowTemplateDetailsCollapseProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          mx: 4,
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5">{instanceDetails.studyTitle}</Typography>

          <Button
            size="small"
            variant="outlined"
            endIcon={open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            onClick={() => setOpen((v) => !v)}
            sx={{ textTransform: 'none' }}>
            {open ? 'Hide Details' : 'Show Details'}
          </Button>
        </Box>

        <Typography variant="h6" color="text.secondary">
          Patient: {instanceDetails.patientName} (ID:{' '}
          {instanceDetails.patientId})
        </Typography>
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ mx: 4, mb: 3 }}>
          <Box
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              mb: 2,
            }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Workflow Template Details
            </Typography>
            <WorkflowMetadata
              description={instanceDetails.description}
              version={instanceDetails.version}
              lastEdited={new Date(instanceDetails.lastEditedOn).getTime()}
              dateCreated={new Date(instanceDetails.firstCreatedOn).getTime()}
            />
          </Box>
        </Box>
      </Collapse>
    </>
  );
}
