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
  Stack,
  SxProps,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
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
import { formatBytes } from 'src/shared/utils';
import {
  AdminTable,
  AdminTableActionButtonsContainer,
  AdminTableToolbar,
  AdminToolBarButton,
} from '../AdminTable';
import { Field, Form, Formik } from 'formik';
import { IRelayNum } from 'src/shared/types';
import EditRelayNum from './editRelayNum';
import DeleteRelayNum from './DeleteRelayNum';
import {
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import { DataTableHeader } from 'src/shared/components/DataTable/DataTableHeader';
import { DataTable } from 'src/shared/components/DataTable/DataTable';

export const ManageRelayApp = () => {
  const [hasFile, setHasFile] = useState(false);
  const [fileSize, setFileSize] = useState<string>();
  const [fileLastModified, setFileLastModified] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [numFileUploaded, setNumFileUploaded] = useState(0);
  const [isUploadOk, setIsUploadOk] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [errorLoading, setErrorLoading] = useState(false);

  // Table
  const [relayNums, setRelayNums] = useState<IRelayNum[]>([]);

  // Relay App Actions
  const [AppActionsPopup, openAppActionsPopup] = useState(false);
  const [NewNumberDialog, openAddNewNumberDialog] = useState(false);

  // Relay Number Actions
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [popupRelayNum, setPopupRelayNum] = useState<IRelayNum>();
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);

  const [rows, setRows] = useState<GridRowsProp>([]);
  const updateRowData = (relayNums: IRelayNum[]) => {
    setRows(
      relayNums.map((relayNum, index) => ({
        id: index,
        phoneNumber: relayNum.phone,
        description: relayNum.description,
        lastReceived: relayNum.lastReceived,
        takeAction: relayNum,
      }))
    );
  };

  const filename = 'cradle_sms_relay.apk';

  const relayNumberTemplate = {
    phone: '',
    description: '',
    lastReceived: 0,
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
      const nums: IRelayNum[] = await getRelayServerPhones();
      if (nums) {
        setRelayNums(nums);
      }
    } catch (e) {
      if (e !== 404) setErrorLoading(true);
    }
  };

  useEffect(() => {
    getRelayNums();
  }, []);

  useEffect(() => {
    const loadAppFile = async () => {
      try {
        const resp = await getAppFileHeadAsync();

        const size = resp.headers.get('Content-Length');
        if (size) setFileSize(formatBytes(parseInt(size)));

        const date = resp.headers.get('Last-Modified');
        if (date) setFileLastModified(date);

        setHasFile(true);
      } catch (e) {
        if (e !== 404) setErrorLoading(true);
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

  const ActionButtons = useCallback(
    ({ relayNum }: { relayNum?: IRelayNum }) => {
      const actions: TableAction[] = [
        {
          tooltip: 'Edit',
          Icon: Edit,
          onClick: () => {
            setPopupRelayNum(relayNum);
            setEditPopupOpen(true);
          },
        },
        {
          tooltip: 'Delete',
          Icon: DeleteForever,
          onClick: () => {
            setPopupRelayNum(relayNum);
            setDeletePopupOpen(true);
          },
        },
        {
          tooltip: 'Download Logs',
          Icon: CloudDownloadOutlined,
          onClick: () => {
            // TODO
          },
        },
      ];
      return <TableActionButtons actions={actions} />;
    },
    []
  );

  const columns: GridColDef[] = [
    { flex: 1, field: 'phoneNumber', headerName: 'Phone Number' },
    { flex: 1, field: 'description', headerName: 'Description' },
    {
      flex: 1,
      field: 'lastReceived',
      headerName: 'Last Received',
    },
    {
      flex: 1,
      field: 'takeAction',
      headerName: 'Take Action',
      filterable: false,
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, IRelayNum>) => (
        <ActionButtons relayNum={params.value} />
      ),
    },
  ];

  const HeaderButtons = () => {
    return (
      <Stack direction={'row'} gap={'8px'} flexWrap={'wrap'}>
        <Button
          variant={'contained'}
          startIcon={<AddIcon />}
          onClick={() => {
            openAddNewNumberDialog(true);
          }}>
          {'Add Number'}
        </Button>
        <Button
          variant={'contained'}
          startIcon={<DownloadIcon />}
          onClick={() => {
            openAppActionsPopup(true);
          }}>
          {'Download App'}
        </Button>
      </Stack>
    );
  };

  const boxSx: SxProps<Theme> = (theme) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  });

  return (
    <>
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
          <Box>
            <Typography component="h6" variant="h6">
              Download App
            </Typography>
            <Divider />
            {hasFile ? (
              <Box sx={boxSx}>
                <div>Filename: {filename}</div>
                <div>File size: {fileSize}</div>
                <div>Last modified: {fileLastModified}</div>
              </Box>
            ) : (
              <Box sx={boxSx}>No file available.</Box>
            )}
            {hasFile && (
              <PrimaryButton onClick={handleClickDownload}>
                Download
              </PrimaryButton>
            )}
          </Box>

          <Box>
            <Typography component="h6" variant="h6">
              Upload App
            </Typography>
            <Divider />
            <Box sx={boxSx}>
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
            </Box>
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

      <DeleteRelayNum
        open={deletePopupOpen}
        onClose={() => {
          setDeletePopupOpen(false);
          getRelayNums();
        }}
        deleteRelayNum={popupRelayNum}
      />
      <DataTableHeader title={'Relay App Servers'}>
        <HeaderButtons />
      </DataTableHeader>
      <DataTable columns={columns} rows={rows} />
    </>
  );
};
