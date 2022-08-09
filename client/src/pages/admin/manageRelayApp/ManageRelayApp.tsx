import { Box, Divider, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  getAppFileAsync,
  getAppFileHeadAsync,
  uploadAppFileAsync,
} from 'src/shared/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Alert } from '@mui/material';
import { PrimaryButton } from 'src/shared/components/Button';
import { formatBytes } from 'src/shared/utils';
import makeStyles from '@mui/styles/makeStyles';

export const ManageRelayApp = () => {
  const classes = useStyles();
  const [hasFile, setHasFile] = useState(false);
  const [fileSize, setFileSize] = useState<string>();
  const [fileLastModified, setFileLastModified] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [numFileUploaded, setNumFileUploaded] = useState(0);
  const [isUploadOk, setIsUploadOk] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [errorLoading, setErrorLoading] = useState(false);

  const filename = 'cradle_sms_relay.apk';
  const errorMessages: { [name: number]: string } = {
    400: 'Invalid file',
    413: 'File too large',
    422: 'Unsupported file type',
    500: 'Internal Server Error',
  };

  const handleChange = (event: React.ChangeEvent<any>) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleClickUpload = async () => {
    if (selectedFile) {
      try {
        await uploadAppFileAsync(selectedFile);

        setNumFileUploaded(numFileUploaded + 1);
        setIsUploadOk(true);
        setTimeout(() => setIsUploadOk(false), 3000);
      } catch (e) {
        setUploadError(errorMessages[e]);
        setTimeout(() => setUploadError(''), 3000);
      }
    }
  };

  const handleClickDownload = async () => {
    try {
      const file = await getAppFileAsync();

      const objectURL = URL.createObjectURL(file);

      const link = document.createElement('a');
      link.href = objectURL;
      link.setAttribute('download', filename);
      link.click();
    } catch (e) {
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    getAppFileHeadAsync()
      .then((resp) => {
        const size = resp.headers.get('Content-Length');
        size && setFileSize(formatBytes(parseInt(size)));

        const date = resp.headers.get('Last-Modified');
        date && setFileLastModified(date);

        setHasFile(true);
      })
      .catch((e) => {
        e !== 404 && setErrorLoading(true);
      });
  }, [numFileUploaded]);

  return (
    <Paper>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <Box p={3}>
        <Typography component="h6" variant="h6">
          Download App
        </Typography>
        <Divider />
        {hasFile ? (
          <div className={classes.root}>
            <div>Filename: {filename}</div>
            <div>File size: {fileSize}</div>
            <div>Last modified: {fileLastModified}</div>
          </div>
        ) : (
          <div className={classes.root}>No file available.</div>
        )}
        {hasFile && (
          <PrimaryButton onClick={handleClickDownload}>Download</PrimaryButton>
        )}
      </Box>
      <Box p={3}>
        <Typography component="h6" variant="h6">
          Upload App
        </Typography>
        <Divider />
        <div className={classes.root}>
          <input type="file" name="file" onChange={handleChange} />
        </div>
        <PrimaryButton onClick={handleClickUpload}>Upload</PrimaryButton>
        {uploadError ? (
          <Alert severity="error">Upload failed - {uploadError}</Alert>
        ) : (
          isUploadOk && <Alert severity="success">Upload successful</Alert>
        )}
      </Box>
    </Paper>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
