import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Input,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  addRelayServerPhone,
  getAppFileAsync,
  getAppFileHeadAsync,
  getRelayServerPhones,
  uploadAppFileAsync,
} from 'src/shared/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Alert } from '@mui/material';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  CloudDownloadOutlined,
  DeleteForever,
  Edit,
  UploadFile,
} from '@mui/icons-material';
import * as yup from 'yup';
import { formatBytes, getPrettyDateTime } from 'src/shared/utils';
import makeStyles from '@mui/styles/makeStyles';
import AdminTable from '../AdminTable';
import { useAdminStyles } from '../adminStyles';
import { Field, Form, Formik } from 'formik';
import { IRelayNum } from 'src/shared/types';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import EditRelayNum from './editRelayNum';

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
  const [relayNums, setRelayNums] = useState<IRelayNum[]>([]);
  const isTransformed = useMediaQuery('(min-width:900px)');

  //Relay App Actions
  const [AppActionsPopup, openAppActionsPopup] = useState(false);
  const [NewNumberDialog, openAddNewNumberDialog] = useState(false);

  //Relay Number Actions
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [popupRelayNum, setPopupRelayNum] = useState<IRelayNum>();

  const filename = 'cradle_sms_relay.apk';

  const relayNumberTemplate = {
    phone: '',
    description: '',
    lastReceived: 0,
    archived: false
  };

  const validationSchema = yup.object({
    phone: yup.string().required('Required').max(20),
    description: yup.string().max(250),
  });

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


  const getRelayNums = async () => {
    try {
      const resp: IRelayNum[] = await getRelayServerPhones();
      if (resp) {
        setRelayNums(resp);
      }
    } catch (e) {
      e !== 404 && setErrorLoading(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    getRelayNums();
  }, []);

  useEffect(() => {
    setTableData(
      relayNums.map((num) => [
        num['phone'],
        num['description'],
        num['lastReceived'],
      ])
    );
  }, [relayNums]);

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

  const handleSubmit = async (values: IRelayNum) => {
    try {
      await addRelayServerPhone(values.phone, values.description);
      const resp = await getRelayServerPhones();
      if (resp) {
        setRelayNums(resp);
      }
    } catch (e: any) {
      setErrorLoading(true);
    }
  };

  const columns = [
    {
      name: 'Phone Number',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Description',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Last Received',
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

  const rowActions = [
    {
      tooltip: 'Edit',
      Icon: Edit,
      onClick: (relayNum: IRelayNum) => {
        console.log("edit pop up open:", editPopupOpen);
        console.log("pop up relay num", popupRelayNum);
        console.log("onclick sending", relayNum);
        setPopupRelayNum(relayNum);
        setEditPopupOpen(true);
      },
    },
    {
      tooltip: 'Delete',
      Icon: DeleteForever,
      onClick: (relayNum: IRelayNum) => {
        // to do
      },
    },
    {
      tooltip: 'Download Logs',
      Icon: CloudDownloadOutlined,
      onClick: (relayNum: IRelayNum) => {
        // to do
      },
    },
  ];

  const Row = ({ row }: { row: (string | number)[] }) => {
    const relayNumInfo = relayNums.find((num) => num.phone === row[0]);

    return relayNumInfo ? (
      <TableRow className={styles.row}>
        <TableCell label="Phone Number" isTransformed={isTransformed}>
          {relayNumInfo.phone}
        </TableCell>
        <TableCell label="Description" isTransformed={isTransformed}>
          {relayNumInfo.description}
        </TableCell>
        <TableCell label="Last Received" isTransformed={isTransformed}>
          {getPrettyDateTime(relayNumInfo.lastReceived)}
        </TableCell>
        <TableCell label="Actions" isTransformed={isTransformed}>
          {rowActions.map((action) => (
            <Tooltip
              key={action.tooltip}
              placement="top"
              title={action.tooltip}>
              <IconButton
                onClick={() => {
                  action.onClick(relayNumInfo);
                }}
                size="large">
                <action.Icon />
              </IconButton>
            </Tooltip>
          ))}
        </TableCell>
      </TableRow>
    ) : (
      <TableRow>
        <TableCell label="" isTransformed={false}>
          Invalid Phone
        </TableCell>
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
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
            {({ isSubmitting, isValid, errors, dirty }) => (
              <Form>
                <Grid container spacing={3} sx={{ paddingTop: 1 }}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      inputProps={{ maxLength: 50 }}
                      variant="outlined"
                      label="Phone Number"
                      name={'phone'}
                      error={errors.phone !== undefined}
                      helperText={errors.phone}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      inputProps={{ maxLength: 300 }}
                      variant="outlined"
                      label="Description"
                      name={'description'}
                      error={errors.description !== undefined}
                      helperText={errors.description}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DialogActions>
                      <CancelButton
                        type="button"
                        onClick={() => {
                          openAddNewNumberDialog(false);
                        }}>
                        Cancel
                      </CancelButton>
                      <PrimaryButton
                        type="submit"
                        disabled={isSubmitting || !isValid || !dirty}
                        onClick={() => {
                          openAddNewNumberDialog(false);
                        }}>
                        Save
                      </PrimaryButton>
                    </DialogActions>
                  </Grid>
                </Grid>
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

      <EditRelayNum
        open={editPopupOpen}
        onClose={() => {
          setEditPopupOpen(false);
          getRelayNums();
        }}
        relayNums={relayNums}
        editRelayNum={popupRelayNum}
      />

      <AdminTable
        title="Relay App Servers"
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
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
