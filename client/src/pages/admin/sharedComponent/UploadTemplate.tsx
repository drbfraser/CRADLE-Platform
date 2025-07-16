import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SxProps,
  Theme,
} from '@mui/material';
import { Dropzone, FileMosaic, ExtFile } from '@files-ui/react';
import { useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import SampleTemplateLink from './SampleTemplateLink';
import { Toast } from 'src/shared/components/toast';
//update workflow apis in here
import { saveFormTemplateWithFileAsync } from 'src/shared/api';

interface IProps {
  open: boolean;
  onClose: () => void;
  type?: 'form' | 'workflow';
}

const UploadTemplate = ({ open, onClose, type = 'workflow' }: IProps) => {
  const [files, setFiles] = useState<ExtFile[]>([]);

  const [uploadError, setUploadError] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);

  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const errorMessages: { [name: number]: string } = {
    413: 'File too large',
    422: 'Unsupported file type',
    500: 'Internal Server Error',
  };

  const updateFiles = (incomingFiles: ExtFile[]) => {
    setFiles(incomingFiles);
  };

  const handleClickUpload = async (extFiles: ExtFile[]) => {
    if (extFiles.length < 1) {
      return;
    }
    const extFile: ExtFile = extFiles[0];
    if (!extFile) {
      return;
    }
    const file = extFile.file;
    if (!file) {
      return;
    }
    try {
      await saveFormTemplateWithFileAsync(file);

      setUploadSuccess(`${file.name} uploaded successfully`);
      setShowSuccess(true);

      onClose();
    } catch (e: unknown) {
      let message = '';
      if (!(e instanceof Response)) {
        // Show generic error message.
        setShowError(true);
        return;
      }

      if (e.status && errorMessages[e.status]) {
        message = errorMessages[e.status];
      } else {
        const err = await e.json();
        message = err.message;
        console.error(message);
      }

      setUploadError(message);
      setShowError(true);
    }
  };

  useEffect(() => {
    if (!open) setFiles([]);
  }, [open]);

  const boxSx: SxProps<Theme> = (theme) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  });

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
        <DialogTitle>
          {type === 'form'
            ? 'Upload Form Template'
            : 'Upload Workflow Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={boxSx}>
            <Dropzone
              maxFiles={1}
              behaviour="replace"
              accept={['application/json', 'text/csv'].join(',')}
              value={files}
              onChange={updateFiles}
              header={false}
              footer={false}>
              {files.map((file) => (
                <FileMosaic
                  {...file}
                  key={file.id}
                  onDelete={() => setFiles([])}
                  info
                />
              ))}
            </Dropzone>
          </Box>
          <Box sx={boxSx}>
            <SampleTemplateLink type={type} />
          </Box>
          <DialogActions>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
            <PrimaryButton
              disabled={files.length < 1}
              onClick={() => {
                if (files.length >= 1) handleClickUpload(files);
              }}>
              Upload
            </PrimaryButton>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadTemplate;
