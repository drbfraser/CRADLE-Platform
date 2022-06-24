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
  form?: IFormTemplate;
}

const ArchiveTemplateDialog = ({ open, onClose, form }: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const archiveForm = async () => {
    if (!form?.id) {
      return;
    }

    try {
      form.archived = true;
      const url = API_URL + EndpointEnum.FORM_TEMPLATES + '/' + String(form.id);
      await apiFetch(
        url,
        {
          method: 'PUT',
          body: JSON.stringify(form),
        },
        true
      );

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
        message="Form Template Archived!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Archive Form Template</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to archive this form template?</p>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={archiveForm}>Archive</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ArchiveTemplateDialog;

const useStyles = makeStyles((theme) => ({
  actions: {
    padding: theme.spacing(2),
  },
}));
