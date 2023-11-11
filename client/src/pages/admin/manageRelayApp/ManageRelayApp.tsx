import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Input,
  TableCell,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  getAppFileAsync,
  getAppFileHeadAsync,
  uploadAppFileAsync,
} from 'src/shared/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Alert } from '@mui/material';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { UploadFile } from '@mui/icons-material';
import { formatBytes } from 'src/shared/utils';
import makeStyles from '@mui/styles/makeStyles';
import AdminTable from '../AdminTable';
import { useAdminStyles } from '../adminStyles';
import {
  Field, Form,
  Formik,
  FormikHelpers
} from 'formik';
import { IRelayNum } from 'src/shared/types';

export const ManageRelayApp = () => {

  //Styles
  const styles = useAdminStyles();
  const classes = useStyles();

  const [hasFile, setHasFile] = useState(false);
  const [fileSize, setFileSize] = useState<string>();
  const [fileLastModified, setFileLastModified] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [numFileUploaded, setNumFileUploaded] = useState(0);
  const [isUploadOk, setIsUploadOk] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [errorLoading, setErrorLoading] = useState(false);

  //Table
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<(string | number)[][]>([]);
  const [relayNums, setRelayNums] = useState<[]>([]);
  const isTransformed = useMediaQuery('(min-width:900px)');

  //Relay App Actions
  const [AppActionsPopup, openAppActionsPopup] = useState(false);
  const [NewNumberDialog, openAddNewNumberDialog] = useState(false);

  const filename = 'cradle_sms_relay.apk';

  enum RelayNumber {
    phoneNumber = 'phoneNumber',
    desc = 'desc',
  }

  const relayNumberTemplate = {
    [RelayNumber.phoneNumber]: '',
    [RelayNumber.desc]: '',
  };

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
      } catch (e: any) {
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
    const loadAppFile = async () => {
      try {
        const resp = await getAppFileHeadAsync();

        const size = resp.headers.get('Content-Length');
        size && setFileSize(formatBytes(parseInt(size)));

        const date = resp.headers.get('Last-Modified');
        date && setFileLastModified(date);

        setHasFile(true);
      } catch (e) {
        e !== 404 && setErrorLoading(true);
      }
    };

    loadAppFile();
  }, [numFileUploaded]);

  const handleSubmit = async (
    values: IRelayNum,
    { setSubmitting }: FormikHelpers<IRelayNum>
  ) => {
    try {
      //save relay number
      //onclose
    } catch (e) {
      // setSubmitting(false);
      // setSubmitError(true);
    }
  };

  const columns = [
    {
      name: 'Relay Number',
    },
    {
      name: 'Description',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Last Recieved',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Actions',
      options: {
        display: isTransformed ? true : false,
        sort: false,
      },
    },
  ];

  const Row = ({ row }: { row: (string | number)[] }) => {

    //const relayNumInfo = relayNums.find((num) => num.id === row[0]);

    console.log(relayNums);
    setLoading(true);
    setTableData([]);
    setRelayNums([]);

    return (
      <TableRow className={styles.row}>
        <TableCell>{'relayNumber Name'}</TableCell>
        <TableCell>{'relayNumber Description'}</TableCell>
        <TableCell>{'relayNumber Last Recieved'}</TableCell>
        <TableCell>{'Actions'}</TableCell>
      </TableRow>
    );
  };

  return (
    <div>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />

      <Dialog open={NewNumberDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Number</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={relayNumberTemplate}
            // validationSchema={getValidationSchema()}
            onSubmit={handleSubmit} >
            {({ isSubmitting, isValid }) => (
              <Form>
                <Field
                  component={TextField}
                  fullWidth
                  required
                  inputProps={{ maxLength: 50 }}
                  variant="outlined"
                  label="Phone Name"
                  name={RelayNumber.phoneNumber}
                //disabled={!creatingNew}
                />
                <br />
                <br />
                <Field
                  component={TextField}
                  fullWidth
                  inputProps={{ maxLength: 300 }}
                  variant="outlined"
                  label="Description"
                  name={RelayNumber.desc}
                />
                <br />
                <DialogActions>
                  <CancelButton type="button" onClick={() => {
                    openAddNewNumberDialog(false);
                  }}>
                    Cancel
                  </CancelButton>
                  <PrimaryButton
                    type="submit"
                    //disabled={isSubmitting || !isValid}
                    onClick={() => {
                      openAddNewNumberDialog(false);
                    }}
                  >
                    Save
                  </PrimaryButton>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
      {/*end*/}

      <Dialog open={AppActionsPopup} maxWidth="md" fullWidth>
        <DialogTitle>Relay App Actions</DialogTitle>
        <DialogContent>
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
              <PrimaryButton onClick={handleClickDownload}>
                Download
              </PrimaryButton>
            )}
          </Box>

          <Box p={3}>
            <Typography component="h6" variant="h6">
              Upload App
            </Typography>
            <Divider />
            <div className={classes.root}>
              <Button
                color="primary"
                aria-label="upload picture"
                component="label"
                endIcon={<UploadFile />}>
                <Input
                  type="file"
                  name="file"
                  inputProps={{
                    accept: 'application/vnd.android.package-archive',
                  }}
                  onChange={handleChange}
                />
              </Button>
            </div>
            <PrimaryButton onClick={handleClickUpload}>Upload</PrimaryButton>
            {uploadError ? (
              <Alert severity="error">Upload failed - {uploadError}</Alert>
            ) : (
              isUploadOk && (
                <Alert style={{ marginTop: '20px' }} severity="success">
                  Upload successful
                </Alert>
              )
            )}
          </Box>

          <DialogActions>
            <CancelButton
              type="button"
              onClick={() => {
                openAppActionsPopup(false);
              }}>
              Cancel
            </CancelButton>
            <PrimaryButton
              type="submit"
              disabled={false}
              onClick={() => {
                openAppActionsPopup(false); //redundant - rework ui
              }}>
              Done
            </PrimaryButton>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <AdminTable
        title="Relay App Information"
        columns={columns}
        Row={Row}
        data={tableData}
        loading={loading}
        isTransformed={isTransformed}
        newBtnLabel={'Add Number'}
        newBtnOnClick={() => {
          openAddNewNumberDialog(true);
        }}
        uploadBtnLabel={'Download App'}
        uploadBtnLabelOnClick={() => {
          openAppActionsPopup(true);
        }}
        search={search}
        setSearch={setSearch}
      />
    </div >
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
