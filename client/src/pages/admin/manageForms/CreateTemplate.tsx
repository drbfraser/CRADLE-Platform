import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from '@material-ui/core';
import { DropzoneAreaBase, FileObject } from 'material-ui-dropzone';
import React, { useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { OrNull } from 'src/shared/types';
import SampleTemplateLink from './SampleTemplateLink';
import { Toast } from 'src/shared/components/toast';
import { isString } from 'lodash';
import { saveFormTemplateWithFileAsync } from 'src/shared/api';

interface IProps {
  open: boolean;
  onClose: () => void;
}

const CreateTemplate = ({ open, onClose }: IProps) => {
  const classes = useStyles();
  const [fileObject, setFileObject] = useState<OrNull<FileObject>>(null);

  const [uploadError, setUploadError] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);

  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const errorMessages: { [name: number]: string } = {
    413: 'File too large',
    422: 'Unsupported file type',
    500: 'Internal Server Error',
  };

  const handleClickUpload = async (fileObj: FileObject) => {
    if (fileObj) {
      try {
        await saveFormTemplateWithFileAsync(fileObj.file);

        setUploadSuccess(`${fileObj.file.name} uploaded successfully`);
        setShowSuccess(true);

        onClose();
      } catch (e) {
        let message = '';

        if (e.status && errorMessages[e.status]) {
          message = errorMessages[e.status];
        } else if (!isString(e)) {
          const err = await e.json();
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
        <DialogTitle>Create Form Template</DialogTitle>
        <DialogContent>
          <div className={classes.root}>
            <DropzoneAreaBase
              acceptedFiles={['application/json', 'text/csv']}
              fileObjects={fileObject ? [fileObject] : []}
              onAdd={(newFileObjs: FileObject[]) =>
                setFileObject(newFileObjs.pop() ?? null)
              }
              onDelete={() => setFileObject(null)}
              onDropRejected={() => setFileObject(null)}
              onAlert={(message: string, varient: string) => {
                switch (varient) {
                  case 'info':
                    setUploadSuccess(message);
                    setShowSuccess(true);
                    break;
                  case 'error':
                    setUploadError(message);
                    setShowError(true);
                    break;
                }
              }}
              showPreviews={true}
              showFileNamesInPreview={true}
              showPreviewsInDropzone={false}
              useChipsForPreview
              previewGridProps={{
                container: { spacing: 1, direction: 'row' },
              }}
              showAlerts={false}
              inputProps={{
                multiple: false,
              }}
              dropzoneClass={classes.dropzone}
            />
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

export default CreateTemplate;
