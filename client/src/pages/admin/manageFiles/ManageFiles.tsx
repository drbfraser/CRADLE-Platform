import React, { useEffect, useState } from 'react';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { formatBytes } from 'src/shared/utils';
import { Paper, Typography, Divider, Box, Button } from '@material-ui/core';

export const ManageFiles = () => {
  const [hasFile, setHasFile] = useState(false);
  const [fileSize, setFileSize] = useState<string>();
  const [fileLastModified, setFileLastModified] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [numFileUploaded, setNumFileUploaded] = useState(0);

  const url = API_URL + EndpointEnum.UPLOAD_ADMIN;
  const filename = 'cradle_sms_relay.apk';

  const handleChange = (event: React.ChangeEvent<any>) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleClickUpload = () => {
    if (selectedFile) {
      const data = new FormData();
      data.append('file', selectedFile);
      apiFetch(url, {
        method: 'POST',
        body: data,
      })
        .then(() => setNumFileUploaded(numFileUploaded + 1))
        .catch(() => {});
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
      .catch(() => {});
  };

  useEffect(() => {
    apiFetch(url + '?' + Date.now(), {
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
      .catch(() => {});
  }, [numFileUploaded]);

  return (
    <Paper>
      <Box p={3}>
        <Typography component="h6" variant="h6">
          Download Files
        </Typography>
        <Divider />
        <br />
        {hasFile ? (
          <>
            <div>Filename: {filename}</div>
            <div>File size: {fileSize}</div>
            <div>Last modified: {fileLastModified}</div>
          </>
        ) : (
          <div>No file available.</div>
        )}
        <br />
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
          Upload Files
        </Typography>
        <Divider />
        <br />
        <div>
          <input type="file" name="file" onChange={handleChange} />
        </div>
        <br />
        <Button
          color="primary"
          variant="contained"
          component="span"
          onClick={handleClickUpload}>
          Upload
        </Button>
      </Box>
    </Paper>
  );
};
