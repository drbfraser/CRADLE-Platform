import { API_URL, apiFetch } from 'src/shared/api';
import { DropzoneDialogBase, FileObject } from 'material-ui-dropzone';
import React, { useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { EndpointEnum } from 'src/shared/enums';
import { OrNull } from 'src/shared/types';
import { Toast } from 'src/shared/components/toast';
import { isString } from 'lodash';
import { makeStyles } from '@material-ui/core';

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
      <DropzoneDialogBase
        dialogTitle="Create Form Template"
        acceptedFiles={['application/json', 'plain/text']}
        fileObjects={fileObject ? [fileObject] : []}
        cancelButtonText={'Cancel'}
        submitButtonText={'Upload'}
        open={open}
        onAdd={(newFileObjs) => {
          setFileObject(newFileObjs.pop() ?? null);
        }}
        onClose={() => {
          setFileObject(null);
          onClose();
        }}
        onDelete={() => {
          setFileObject(null);
        }}
        onSave={() => {
          console.log('onSave', fileObject);
          fileObject && handleClickUpload(fileObject);
        }}
        onAlert={(message, varient) => {
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
        useChipsForPreview
        previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
        showAlerts={false}
        inputProps={{
          multiple: false,
        }}
        dropzoneClass={classes.root}
      />
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

export default CreateTemplate;
