import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { formatBytes } from 'src/shared/utils';
import { Paper, Typography, Divider, Box, Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';

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

  const url = API_URL + EndpointEnum.UPLOAD_ADMIN;
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
        true
      )
        .then(() => {
          setNumFileUploaded(numFileUploaded + 1);
          setIsUploadOk(true);
          setTimeout(() => setIsUploadOk(false), 3000);
        })
        .catch((e) => {
          setUploadError(errorMessages[e]);
          setTimeout(() => setUploadError(''), 3000);
        });
    }
  };

  const handleClickDownload = () => {
    apiFetch(url + '?' + Date.now())
      .then((resp) => resp.blob())
      .then((file) => {
        const objectURL = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = objectURL;
        link.setAttribute('download', filename);
        link.click();
      })
      .catch(() => {
        setErrorLoading(true);
      });
  };

  useEffect(() => {
    apiFetch(API_URL + EndpointEnum.UPLOAD_ADMIN + '?' + Date.now(), {
      method: 'HEAD',
    })
      .then((resp) => {
        const size = resp.headers.get('Content-Length');
        if (size) {
          setFileSize(formatBytes(parseInt(size)));
        }
        const date = resp.headers.get('Last-Modified');
        if (date) {
          setFileLastModified(date);
        }
        setHasFile(true);
      })
      .catch((e) => {
        if (e !== 404) {
          setErrorLoading(true);
        }
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
          <Button
            color="primary"
            variant="contained"
            component="span"
            onClick={handleClickDownload}>
            Download
          </Button>
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
        <Button
          color="primary"
          variant="contained"
          component="span"
          onClick={handleClickUpload}>
          Upload
        </Button>
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
