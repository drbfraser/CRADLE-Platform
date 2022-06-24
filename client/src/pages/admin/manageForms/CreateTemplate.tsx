import { API_URL, apiFetch } from 'src/shared/api';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from '@material-ui/core';
import { DropzoneAreaBase, FileObject } from 'material-ui-dropzone';
import React, { useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { EndpointEnum } from 'src/shared/enums';
import { OrNull } from 'src/shared/types';
import SampleTemplateLink from './SampleTemplateLink';
import { Toast } from 'src/shared/components/toast';
import { isString } from 'lodash';

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

  const url = API_URL + EndpointEnum.FORM_TEMPLATES;
  const errorMessages: { [name: number]: string } = {
    413: 'File too large',
    422: 'Unsupported file type',
    500: 'Internal Server Error',
  };

  const handleClickUpload = async (fileObj: FileObject) => {
    if (fileObj) {
      const data = new FormData();
      console.log(fileObj.file);
      data.append('file', fileObj.file);
      try {
        await apiFetch(
          url,
          {
            method: 'POST',
            body: data,
          },
          true,
          true
        );

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
              acceptedFiles={['application/json', 'plain/text']}
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
            <Button onClick={onClose}>Cancel</Button>
            <Button
              disabled={!fileObject}
              color="primary"
              onClick={() => fileObject && handleClickUpload(fileObject)}>
              Upload
            </Button>
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
