import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { WorkflowTemplate } from 'src/shared/types/workflow/workflowTypes';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';
import { useEditWorkflowTemplate } from './mutations';

interface IProps {
  open: boolean;
  onClose: () => void;
  template?: WorkflowTemplate;
}

const UnarchiveTemplateDialog = ({ open, onClose, template }: IProps) => {
  const editTemplate = useEditWorkflowTemplate();

  const unarchiveTemplate = () => {
    if (!template?.id) {
      return;
    }

    editTemplate.mutate(
      { ...template, archived: false },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <>
      <Toast
        severity="success"
        message="Workflow Unarchived!"
        open={editTemplate.isSuccess}
        onClose={() => editTemplate.reset()}
      />
      <APIErrorToast
        open={editTemplate.isError}
        onClose={() => editTemplate.reset()}
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
