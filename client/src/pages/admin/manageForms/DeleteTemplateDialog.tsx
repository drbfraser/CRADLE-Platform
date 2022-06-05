import { API_URL, apiFetch } from 'src/shared/api';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from '@material-ui/core';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { EndpointEnum } from 'src/shared/enums';
import { IFormTemplate } from './state';
import React from 'react';
import { Toast } from 'src/shared/components/toast';

interface IProps {
  open: boolean;
  onClose: () => void;
  deleteForm?: IFormTemplate;
}

const DeleteTemplateDialog = ({ open, onClose, deleteForm }: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const handleDelete = async () => {
    if (!deleteForm?.id) {
      return;
    }

    try {
      const url =
        API_URL + EndpointEnum.FORM_TEMPLATES + '/' + String(deleteForm.id);
      await apiFetch(url, {
        method: 'DELETE',
      });
      setSubmitSuccess(true);
      onClose();
    } catch (e) {
      setSubmitError(true);
      console.log(e);
    }
  };

  return (
    <>
      <Toast
        severity="success"
        message="Form Template deleted!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Delete Form Template</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this form template?</p>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteTemplateDialog;

const useStyles = makeStyles((theme) => ({
  actions: {
    padding: theme.spacing(2),
  },
}));
