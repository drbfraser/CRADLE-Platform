import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';
import { useUnarchiveWorkflowTemplate } from './mutations';

interface IProps {
  open: boolean;
  onClose: () => void;
  template?: WorkflowTemplate;
}

const UnarchiveTemplateDialog = ({ open, onClose, template }: IProps) => {
  const unarchiveMutation = useUnarchiveWorkflowTemplate();

  const unarchiveTemplate = () => {
    if (!template?.id) return;
    unarchiveMutation.mutate(template.id, { onSuccess: () => onClose() });
  };

  return (
    <>
      <Toast
        severity="success"
        message="Workflow Unarchived!"
        open={unarchiveMutation.isSuccess}
        onClose={() => unarchiveMutation.reset()}
      />
      <APIErrorToast
        open={unarchiveMutation.isError}
        onClose={() => unarchiveMutation.reset()}
      />

      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Unarchive Workflow </DialogTitle>
        <DialogContent>
          <p>Are you sure you want to unarchive this workflow?</p>
        </DialogContent>
        <DialogActions
          sx={(theme) => ({
            padding: theme.spacing(2),
          })}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={unarchiveTemplate}>Unarchive</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UnarchiveTemplateDialog;
