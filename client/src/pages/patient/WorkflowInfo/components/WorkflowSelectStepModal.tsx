import { Box, Typography, Modal, Paper, Button } from '@mui/material';
import NextStepSelector from './NextStepSelector';
import { useState } from 'react';

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
  handleSelectNextStep: (stepId: string) => Promise<void>;
  handleCompleteStep: () => void;
  handleCompleteAndStartNext: (stepId: string) => Promise<void>;
}

export default function WorkflowSelectStepModal({
  open,
  handleCloseNextStepModal,
  handleSelectNextStep,
  handleCompleteStep,
  handleCompleteAndStartNext,
}: IProps) {
  const [selectedId, setSelectedId] = useState('');

  const handleOnConfirm = async () => {
    try {
      await handleCompleteAndStartNext(selectedId);
    } catch (e) {
      console.error('Error completing/starting next step', e);
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
          </Paper>
        </Box>
      </Modal>
    </>
  );
}
