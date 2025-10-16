import { Close } from '@mui/icons-material';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import { pink, red } from '@mui/material/colors';
import { CustomizedForm } from 'src/pages/customizedForm/components/CustomizedForm';
import { FormRenderStateEnum } from 'src/shared/enums';
import { FormTemplateWithQuestions } from 'src/shared/types/form/formTemplateTypes';
import { CForm } from 'src/shared/types/form/formTypes';
import { useSubmitCustomForm } from 'src/pages/customizedForm/mutations';
import { PostBody } from 'src/pages/customizedForm/handlers';
import { updateInstanceStepById } from 'src/shared/api';
import { InstanceStep } from 'src/shared/types/workflow/workflowUiTypes';
import { InstanceStepUpdate } from 'src/shared/types/workflow/workflowApiTypes';

interface IProps {
  currentStep: InstanceStep | null;
  openFormModal: boolean;
  formTemplate: CForm;
  patientId: string;
  handleCloseForm: () => void;
}

export default function WorkflowFormModal({
  currentStep,
  openFormModal,
  formTemplate,
  patientId,
  handleCloseForm,
}: IProps) {
  const submitCustomForm = useSubmitCustomForm();

  const handleClose = () => {
    handleCloseForm();
  };

  const handleSubmit = (form: CForm, postBody: PostBody) => {
    submitCustomForm.mutate(
      { formId: form.id, postBody: postBody },
      {
        onSuccess: (response) => {
          const formId = response.data.id;
          const instanceStepUpdate: InstanceStepUpdate = {
            formId: formId,
          };

          updateInstanceStepById(currentStep!.id, instanceStepUpdate);
          handleCloseForm();
        },
      }
    );
  };

  return (
    <>
      <Modal open={openFormModal} onClose={handleClose}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}>
          <Box
            sx={{
              minWidth: '50vw',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
            {formTemplate && currentStep ? (
              <CustomizedForm
                patientId={patientId}
                fm={formTemplate}
                renderState={FormRenderStateEnum.FIRST_SUBMIT}
                isModalView={true}
                handleCloseModal={handleClose}
                customSubmitHandler={handleSubmit}
              />
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
