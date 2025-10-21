import { CheckCircle, Close } from '@mui/icons-material';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Paper,
  CircularProgress,
  Divider,
  Button,
} from '@mui/material';
import { red } from '@mui/material/colors';
import { CustomizedForm } from 'src/pages/customizedForm/components/CustomizedForm';
import { FormRenderStateEnum } from 'src/shared/enums';
import { CForm } from 'src/shared/types/form/formTypes';
import { useSubmitCustomForm } from 'src/pages/customizedForm/mutations';
import { PostBody } from 'src/pages/customizedForm/handlers';
import { updateInstanceStepById } from 'src/shared/api';
import { InstanceStep } from 'src/shared/types/workflow/workflowUiTypes';
import { InstanceStepUpdate } from 'src/shared/types/workflow/workflowApiTypes';
import { useState } from 'react';

interface IProps {
  currentStep: InstanceStep | null;
  isFormModalOpen: boolean;
  formTemplate: CForm;
  patientId: string;
  handleCloseFormModal: () => void;
}

export default function WorkflowFormModal({
  currentStep,
  isFormModalOpen,
  formTemplate,
  patientId,
  handleCloseFormModal: handleCloseFormModal,
}: IProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const submitCustomForm = useSubmitCustomForm();

  const handleSubmit = (form: CForm, postBody: PostBody) => {
    submitCustomForm.mutate(
      { formId: form.id, postBody: postBody },
      {
        onSuccess: (response) => {
          const formId = response.data.id;
          const instanceStepUpdate: InstanceStepUpdate = {
            formId: formId,
          };
          setFormSubmitted(true);
          updateInstanceStepById(currentStep!.id, instanceStepUpdate);
        },
      }
    );
  };

  return (
    <>
      <Modal open={isFormModalOpen}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}>
          <Box
            sx={{
              minWidth: '60vw',
              maxWidth: '90vw',
              flexDirection: 'column',
            }}>
            {formTemplate && currentStep ? (
              <Paper
                sx={{
                  height: '100%',
                  p: 8,
                  pt: 6,
                }}>
                {!formSubmitted ? (
                  <>
                    {/* Close Modal Button */}
                    <Box sx={{ position: 'relative' }}>
                      <IconButton
                        onClick={handleCloseFormModal}
                        sx={{ position: 'absolute', top: -30, right: -30 }}>
                        <Close sx={{ color: red[500], fontSize: 30 }} />
                      </IconButton>
                    </Box>

                    {/* Form Component */}
                    <Box sx={{}}>
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        {currentStep.title} Form
                      </Typography>
                      <Divider sx={{ mb: 4 }} />
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                        }}>
                        <CustomizedForm
                          patientId={patientId}
                          fm={formTemplate}
                          renderState={FormRenderStateEnum.FIRST_SUBMIT}
                          customSubmitHandler={handleSubmit}
                        />
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <CheckCircle sx={{ fontSize: 60, color: 'green', mb: 2 }} />
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      Form Submitted Successfully!
                    </Typography>
                    <Button variant="contained" onClick={handleCloseFormModal}>
                      Close
                    </Button>
                  </Box>
                )}
              </Paper>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress /> Loading...
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
}
