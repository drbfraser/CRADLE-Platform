import { Box, Typography, Modal, Paper, Button } from '@mui/material';
import NextStepSelector from './NextStepSelector';

export interface NextStepModalState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface IProps {
  open: boolean;
  handleCloseNextStepModal: () => void;
}

export default function WorkflowSelectStepModal({
  open,
  handleCloseNextStepModal,
}: IProps) {
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
              minWidth: '60vw',
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

              <NextStepSelector />

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

                <Button variant="contained" onClick={handleCloseNextStepModal}>
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
