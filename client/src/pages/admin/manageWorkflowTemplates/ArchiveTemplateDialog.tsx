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
import { useArchiveWorkflowTemplate } from './mutations';

interface IProps {
  open: boolean;
  onClose: () => void;
  template?: WorkflowTemplate;
}

const ArchiveTemplateDialog = ({ open, onClose, template }: IProps) => {
  const archiveTemplate = useArchiveWorkflowTemplate();

  const handleArchiveForm = async () => {
    if (!template?.id) {
      return;
    }

    archiveTemplate.mutate(template.id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <>
      <Toast
        severity="success"
        message="Workflow Archived!"
        open={archiveTemplate.isSuccess}
        onClose={() => archiveTemplate.reset()}
      />
      <APIErrorToast
        open={archiveTemplate.isError}
        onClose={() => archiveTemplate.reset()}
      />

      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Archive Workflow </DialogTitle>
        <DialogContent>
          <p>Are you sure you want to archive this Workflow?</p>
        </DialogContent>
        <DialogActions sx={(theme) => ({ padding: theme.spacing(2) })}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={handleArchiveForm}>Archive</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ArchiveTemplateDialog;
