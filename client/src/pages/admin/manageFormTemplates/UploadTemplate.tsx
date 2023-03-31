import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Dropzone, FileItem, FileValidated } from '@dropzone-ui/react';
import { useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { OrNull } from 'src/shared/types';
import SampleTemplateLink from './SampleTemplateLink';
import { Toast } from 'src/shared/components/toast';
import { isString } from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import { saveFormTemplateWithFileAsync } from 'src/shared/api';

interface IProps {
  open: boolean;
  onClose: () => void;
}

const UploadTemplate = ({ open, onClose }: IProps) => {
  const classes = useStyles();
  const [fileObject, setFileObject] = useState<OrNull<FileValidated>>(null);

  const [uploadError, setUploadError] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);

  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const errorMessages: { [name: number]: string } = {
    413: 'File too large',
    422: 'Unsupported file type',
    500: 'Internal Server Error',
  };

  const handleClickUpload = async (fileObj: FileValidated) => {
    if (fileObj) {
      try {
        await saveFormTemplateWithFileAsync(fileObj.file);

        setUploadSuccess(`${fileObj.file.name} uploaded successfully`);
        setShowSuccess(true);

        onClose();
      } catch (e: any) {
        let message = '';

        if (e.status && errorMessages[e.status]) {
          message = errorMessages[e.status];
        } else if (!isString(e)) {
          const err = e.json();
          message = err.message;
        }

        setUploadError(message);
        setShowError(true);
      }
    }
  };

  useEffect(() => {
    !open && setFileObject(null);
  }, [open]);

  return (
    <>
      <Toast
        severity="success"
        message={uploadSuccess}
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <APIErrorToast
        open={showError}
        onClose={() => setShowError(false)}
        errorMessage={uploadError}
      />

      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Form Template</DialogTitle>
        <DialogContent>
          <div className={classes.root}>
            <Dropzone
              maxFiles={1}
              behaviour="replace"
              accept={['application/json', 'text/csv'].join(',')}
              value={fileObject ? [fileObject] : []}
              onChange={(files: FileValidated[]) =>
                setFileObject(files.pop() ?? null)
              }
              header={false}
              footer={false}>
              {fileObject && (
                <FileItem
                  {...fileObject}
                  onDelete={() => setFileObject(null)}
                  info
                />
              )}
            </Dropzone>
          </div>
          <div className={classes.root}>
            <SampleTemplateLink />
          </div>
          <DialogActions>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
            <PrimaryButton
              disabled={!fileObject}
              onClick={() => fileObject && handleClickUpload(fileObject)}>
              Upload
            </PrimaryButton>
          </DialogActions>
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
  dropzone: {
    border: '1px dashed #ccc',
    borderRadius: 4,
    cursor: 'pointer',
    padding: theme.spacing(2),
    textAlign: 'center',
  },
}));

export default UploadTemplate;
