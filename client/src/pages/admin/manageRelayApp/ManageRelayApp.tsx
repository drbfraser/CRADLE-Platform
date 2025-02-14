import {
  ChangeEvent,
  useCallback,
  // useEffect,
  useState,
} from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as yup from 'yup';
import { Field, Form, Formik } from 'formik';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Input,
  Stack,
  SxProps,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  CloudDownloadOutlined,
  DeleteForever,
  Edit,
  UploadFile,
} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';

// import { formatBytes } from 'src/shared/utils';
import { RelayNum } from 'src/shared/types';
import {
  addRelayServerPhone,
  getAppFileAsync,
  // getAppFileHeadAsync,
  getRelayServerPhones,
  uploadAppFileAsync,
} from 'src/shared/api/api';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import { DataTableHeader } from 'src/shared/components/DataTable/DataTableHeader';
import { DataTable } from 'src/shared/components/DataTable/DataTable';
import EditRelayNum from './editRelayNum';
import DeleteRelayNum from './DeleteRelayNum';

const FILE_NAME = 'cradle_sms_relay.apk';

const RELAY_NUMBER_TEMPLATE = {
  phoneNumber: '',
  description: '',
  lastReceived: 0,
};

const NEW_NUMBER_VALIDATION_SCHEMA = yup.object({
  phone: yup.string().required('Required').max(20),
  description: yup.string().max(250),
});

const ERROR_MESSAGES: { [name: number]: string } = {
  400: 'Invalid file',
  413: 'File too large',
  422: 'Unsupported file type',
  500: 'Internal Server Error',
};

export const ManageRelayApp = () => {
  const [hasFile, setHasFile] = useState(false);
  const [fileSize, setFileSize] = useState<string>();
  const [fileLastModified, setFileLastModified] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [numFileUploaded, setNumFileUploaded] = useState(0);

  // Relay App Actions
  const [AppActionsPopup, openAppActionsPopup] = useState(false);
  const [NewNumberDialog, openAddNewNumberDialog] = useState(false);

  // Relay Number Actions
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [popupRelayNum, setPopupRelayNum] = useState<RelayNum>();
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);

  const relayNumbersQuery = useQuery({
    queryKey: ['relayNumbers'],
    queryFn: getRelayServerPhones,
    staleTime: 0,
  });
  console.log(relayNumbersQuery.data);

  const appFileQuery = useQuery<Blob>({
    queryKey: ['appFile'],
    queryFn: getAppFileAsync,
    enabled: hasFile,
  });

  const handleAppFileChange = (event: ChangeEvent<any>) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadAppFile = useMutation({
    mutationFn: (file: File) =>
      uploadAppFileAsync(file).catch((e) => {
        throw new Error(ERROR_MESSAGES[e]);
      }),
  });
  const handleClickUpload = async () => {
    if (selectedFile) {
      uploadAppFile.mutate(selectedFile, {
        onSuccess: () => setNumFileUploaded(numFileUploaded + 1),
        onSettled: () => setTimeout(() => uploadAppFile.reset(), 3000),
      });
    }
  };

  const handleClickDownload = async () => {
    if (!appFileQuery.data) {
      return;
    }

    const objectURL = URL.createObjectURL(appFileQuery.data);
    const link = document.createElement('a');
    link.href = objectURL;
    link.setAttribute('download', FILE_NAME);
    link.click();
  };

  // TODO: This does not work at the moment... also not sure what this is supposed to do...
  // useEffect(() => {
  //   const loadAppFile = async () => {
  //     try {
  //       const resp = await getAppFileHeadAsync();

  //       const size = resp.headers.get('Content-Length');
  //       if (size) setFileSize(formatBytes(parseInt(size)));

  //       const date = resp.headers.get('Last-Modified');
  //       if (date) setFileLastModified(date);

  //       setHasFile(true);
  //     } catch (e) {
  //       console.error(e);
  //       if (e !== 404) setErrorLoading(true);
  //     }
  //   };

  //   loadAppFile();
  // }, [numFileUploaded]);

  const addNewRelayServerPhone = useMutation({
    mutationFn: ({ phoneNumber, description }: RelayNum) =>
      addRelayServerPhone(phoneNumber, description),
  });
  const handleNewNumberSubmit = async (values: RelayNum) => {
    addNewRelayServerPhone.mutate(values, {
      onSuccess: () => relayNumbersQuery.refetch(),
    });
  };

  const ActionButtons = useCallback(({ relayNum }: { relayNum?: RelayNum }) => {
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
  }, []);

  const tableColumns: GridColDef[] = [
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
      renderCell: (params: GridRenderCellParams<any, RelayNum>) => (
        <ActionButtons relayNum={params.value} />
      ),
    },
  ];
  const tableRows =
    relayNumbersQuery.data?.map((relayNum, index) => ({
      id: index,
      phoneNumber: relayNum.phoneNumber,
      description: relayNum.description,
      lastReceived: relayNum.lastReceived,
      takeAction: relayNum,
    })) ?? [];

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

  const isError =
    relayNumbersQuery.isError ||
    addNewRelayServerPhone.isError ||
    appFileQuery.isError;
  return (
    <>
      {isError && <APIErrorToast />}

      <Dialog open={NewNumberDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Number</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={RELAY_NUMBER_TEMPLATE}
            validationSchema={NEW_NUMBER_VALIDATION_SCHEMA}
            onSubmit={handleNewNumberSubmit}>
            {({ isValid, errors, dirty }) => (
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
                      error={errors.phoneNumber !== undefined}
                      helperText={errors.phoneNumber}
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
                        disabled={
                          addNewRelayServerPhone.isPending || !isValid || !dirty
                        }
                        onClick={() => {
                          openAddNewNumberDialog(false);
                          relayNumbersQuery.refetch();
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
                <div>Filename: {FILE_NAME}</div>
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
                aria-label="upload androud package archive"
                component="label"
                endIcon={<UploadFile />}>
                <Input
                  type="file"
                  name="file"
                  inputProps={{
                    accept: 'application/vnd.android.package-archive',
                  }}
                  onChange={handleAppFileChange}
                />
              </Button>
            </Box>
            <PrimaryButton onClick={handleClickUpload}>Upload</PrimaryButton>
            {uploadAppFile.isError ? (
              <Alert severity="error">
                Upload failed - {uploadAppFile.error.message}
              </Alert>
            ) : (
              uploadAppFile.isSuccess && (
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
          relayNumbersQuery.refetch();
        }}
        relayNums={relayNumbersQuery?.data ?? []}
        editRelayNum={popupRelayNum}
      />

      <DeleteRelayNum
        open={deletePopupOpen}
        onClose={() => {
          setDeletePopupOpen(false);
          relayNumbersQuery.refetch();
        }}
        deleteRelayNum={popupRelayNum}
      />
      <DataTableHeader title={'Relay App Servers'}>
        <HeaderButtons />
      </DataTableHeader>
      <DataTable columns={tableColumns} rows={tableRows} />
    </>
  );
};
