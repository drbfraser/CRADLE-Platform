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
import {
  FormModalState,
  InstanceStep,
} from 'src/shared/types/workflow/workflowUiTypes';
import { InstanceStepUpdate } from 'src/shared/types/workflow/workflowApiTypes';
import { useState } from 'react';

interface IProps {
  currentStep: InstanceStep | null;
  formModalState: FormModalState;
  onRefetchForm: () => void;
  patientId: string;
  handleCloseFormModal: () => void;
}

export default function WorkflowFormModal({
  currentStep,
  formModalState,
  onRefetchForm,
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
          onRefetchForm();
        },
      }
    );
  };

  let successMessage: string;
  switch (formModalState.renderState) {
    case FormRenderStateEnum.EDIT:
      successMessage = 'Form Edit Submitted Successfully!';
      break;
    default:
      successMessage = 'Form Submitted Successfully!';
      break;
  }

  return (
    <>
      <Modal open={formModalState.open}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}>
          {formModalState.form && currentStep ? (
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
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      height: '100%',
                      width: '100%',
                    }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      {currentStep.title} Form
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}>
                      <CustomizedForm
                        patientId={patientId}
                        fm={formModalState.form}
                        renderState={formModalState.renderState}
                        isFormModal={true}
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
                    {successMessage}
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
      </Modal>
    </>
  );
}
