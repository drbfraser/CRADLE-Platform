import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Divider,
  DialogActions,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import SampleTemplateToast from './SampleTemplateToast';
interface IProps {
  open: boolean;
  onClose: () => void;
}

const CreateTemplate = ({ open, onClose }: IProps) => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isUploadOk, setIsUploadOk] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  const url = API_URL + EndpointEnum.FORM_TEMPLATES;
  const errorMessages: { [name: number]: string } = {
    413: 'File too large',
    422: 'Unsupported file type',
    500: 'Internal Server Error',
  };

  const handleChange = (event: React.ChangeEvent<any>) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleClickUpload = () => {
    if (selectedFile) {
      const data = new FormData();
      data.append('file', selectedFile);
      apiFetch(
        url,
        {
          method: 'POST',
          body: data,
        },
        true,
        true
      )
        .then(() => {
          setIsUploadOk(true);
          setTimeout(() => setIsUploadOk(false), 3000);
        })
        .catch((e) => {
          const status = e.status;
          const error_info: Promise<any> = e.json();
          if (status !== 404) {
            setUploadError(errorMessages[status]);
            setTimeout(() => setUploadError(''), 3000);
          } else {
            error_info.then((err) => {
              setUploadError(err.message);
              setTimeout(() => setUploadError(''), 3000);
            });
          }
        });
    }
  };

  return (
    <>
      <APIErrorToast
        open={uploadError !== undefined}
        onClose={() => setUploadError(undefined)}
      />
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>Create Form Template</DialogTitle>
        <DialogContent>
          <Box p={3}>
            <Typography component="h6" variant="h6">
              Upload Template File (.json)
            </Typography>
            <Divider />
            <div className={classes.root}>
              <input type="file" name="file" onChange={handleChange} />
            </div>
            <div className={classes.root}>
              <SampleTemplateToast />
            </div>
            <DialogActions>
              <Button
                color="primary"
                variant="contained"
                component="span"
                onClick={handleClickUpload}>
                Upload
              </Button>
              <Button
                color="primary"
                variant="contained"
                component="span"
                onClick={() => {
                  setSelectedFile(undefined);
                  onClose();
                }}>
                Cancel
              </Button>
            </DialogActions>
            {uploadError ? (
              <Alert severity="error">Upload failed - {uploadError}</Alert>
            ) : (
              isUploadOk && <Alert severity="success">Upload successful</Alert>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

export default CreateTemplate;
