// src/pages/patient/WorkflowInstanceDetails.tsx
import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Collapse,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { WorkflowMetadata } from 'src/shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { Tooltip, IconButton } from '@mui/material';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deleteFormResponseAsync } from 'src/shared/api';
import WorkflowStatus from './components/WorkflowStatus';
import WorkflowStepHistory from './components/WorkflowStepHistory';
import WorkflowPossibleSteps from './components/WorkflowPossibleSteps';
import WorkflowConfirmDialog, {
  ConfirmDialogData,
} from './components/WorkflowConfirmDialog';
import axios from 'axios';
import { useWorkflowInstanceDetails } from 'src/shared/hooks/patient/useWorkflowInstanceDetails';
import { useWorkflowFormModal } from 'src/shared/hooks/patient/useWorkflowFormModal';
import { SnackbarSeverity } from 'src/shared/enums';

export default function WorkflowInstanceDetailsPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const [openTemplateDetails, setOpenTemplateDetails] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: SnackbarSeverity.SUCCESS as SnackbarSeverity,
  });
  const { instanceDetails, currentStep, progressInfo, reload } =
    useWorkflowInstanceDetails('test-workflow-instance-1'); //TODO: To be updated with URL param when completed
  const {
    formModalState,
    handleOpenFormModal,
    handleCloseFormModal,
    onRefetchForm,
  } = useWorkflowFormModal(currentStep, reload);

  // TODO: add setCurrentStep function inside useWorkflowInstanceDetails
  const handleMakeCurrent = React.useCallback(
    (stepId: string, title: string) => {
      setConfirmDialog({
        open: true,
        title: 'Override Current Step',
        message: `Override current step and move to ${title}?`,
        onConfirm: () => {
          console.log('Make current step:', stepId);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    },
    []
  );

  const handleDeleteForm = async () => {
    try {
      if (!currentStep) {
        console.error('Error deleting form (no current step)');
        return false;
      }

      if (!currentStep.formId) {
        console.error('No form associated with current step');
        return false;
      }

      await deleteFormResponseAsync(currentStep.formId);
      console.log('Discarded form for current step successfully.');
      reload();
      setConfirmDialog((prev) => ({ ...prev, open: false }));
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Error deleting form for current step:',
          error.response?.status,
          error.message
        );
      } else {
        console.log('Unknown error deleting form:', error);
      }
      return false;
    }
  };

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      {/* Main Workflow Instance Name Heading */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Go back" placement="top">
            <IconButton onClick={() => navigate(-1)} size="medium">
              <ChevronLeftIcon color="inherit" fontSize="large" />
            </IconButton>
          </Tooltip>
          <Box sx={{ ml: 0.5 }}>
            <Typography variant="h4" component="h2">
              Workflow Instance Details
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {!instanceDetails ? (
          <Typography variant="h5" component="p">
            Loading workflow instance...
          </Typography>
        ) : (
          <>
            {/* Workflow Instance Name & Patient Heading */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                mx: 4,
              }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5">
                  {instanceDetails.studyTitle}
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  endIcon={
                    openTemplateDetails ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )
                  }
                  onClick={() => setOpenTemplateDetails((v) => !v)}
                  sx={{ textTransform: 'none' }}>
                  {openTemplateDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </Box>

              <Typography variant="h6" color="text.secondary">
                Patient: {instanceDetails.patientName} (ID:{' '}
                {instanceDetails.patientId})
              </Typography>
            </Box>

            {/* Collapsible Workflow Template Details */}
            <Collapse in={openTemplateDetails} unmountOnExit>
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
                    collectionName={instanceDetails.collection}
                    version={parseInt(instanceDetails.version) || 1}
                    lastEdited={instanceDetails.lastEditedOn}
                    dateCreated={instanceDetails.firstCreatedOn}
                  />
                </Box>
              </Box>
            </Collapse>
            {/* Section 2: Workflow Status */}
            <WorkflowStatus
              workflowInstance={instanceDetails}
              progressInfo={progressInfo}
            />

            {/* Section 3: Step history */}
            <WorkflowStepHistory
              workflowInstance={instanceDetails}
              expandedStep={expandedStep}
              setExpandedStep={setExpandedStep}
              expandAll={expandAll}
              setExpandAll={setExpandAll}
              setConfirmDialog={setConfirmDialog}
              handleMakeCurrent={handleMakeCurrent}
              handleOpenFormModal={handleOpenFormModal}
              handleCloseFormModal={handleCloseFormModal}
              formModalState={formModalState}
              onRefetchForm={onRefetchForm}
              handleDeleteForm={handleDeleteForm}
              currentStep={currentStep}
              showSnackbar={showSnackbar}
            />

            {/* Section 4: Possible Other Steps */}
            <WorkflowPossibleSteps
              workflowInstance={instanceDetails}
              handleMakeCurrent={handleMakeCurrent}
            />

            {/* Confirmation Dialog */}
            <WorkflowConfirmDialog
              confirmDialog={confirmDialog}
              setConfirmDialog={setConfirmDialog}
            />
          </>
        )}
      </Paper>

      {/* Snackbar for Confirmation Dialog */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
