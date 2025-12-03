import { Box, Typography, Modal, Paper, Button } from '@mui/material';
import NextStepSelector from './NextStepSelector';
import { useState } from 'react';
import { WorkflowNextStepOption } from 'src/shared/types/workflow/workflowUiTypes';

export interface NextStepModalState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface IProps {
  open: boolean;
  nextStep: string | null;
  setNextStep: React.Dispatch<React.SetStateAction<string | null>>;
  handleCloseNextStepModal: () => void;
  handleCompleteFinalStep: () => void;
  handleCompleteAndStartNextStep: (stepId: string) => Promise<void>;
  options: WorkflowNextStepOption[];
}

export default function WorkflowSelectStepModal({
  open,
  handleCloseNextStepModal,
  handleCompleteFinalStep,
  handleCompleteAndStartNextStep,
  options,
}: IProps) {
  const [selectedId, setSelectedId] = useState('');

  if (!open) return null;

  const handleOnConfirm = async () => {
    try {
      await handleCompleteAndStartNextStep(selectedId);
    } catch (e) {
      console.error('Error completing/starting next step', e);
    }
  };

  const handleOnFinalConfirm = async () => {
    try {
      await handleCompleteFinalStep();
    } catch (e) {
      console.error('Error completing final step', e);
    }
  };

  return (
    <>
      <Modal open={open}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}>
          <Paper
            sx={{
              minHeight: '15vw',
              maxHeight: '50vw',
              minWidth: '50vw',
              maxWidth: '90vw',
              p: 8,
              pt: 6,
              borderRadius: 3,
            }}>
            {options.length > 0 ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Select next step
                </Typography>

                <NextStepSelector
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  // setNextStep={setNextStep}
                  options={options}
                />

                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                  }}>
                  <Button onClick={handleCloseNextStepModal}>Cancel</Button>

                  <Button variant="contained" onClick={handleOnConfirm}>
                    Confirm
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 4,
                }}>
                <Typography variant="h6">Complete Workflow?</Typography>

                <Typography variant="body1" sx={{ textAlign: 'center' }}>
                  This is the final step. Completing this will finish the
                  workflow. Do you want to proceed?
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                  }}>
                  <Button onClick={handleCloseNextStepModal}>Cancel</Button>
                  <Button variant="contained" onClick={handleOnFinalConfirm}>
                    Complete Workflow
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Modal>
    </>
  );
}
