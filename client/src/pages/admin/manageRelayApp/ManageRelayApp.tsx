import {
  ChangeEvent,
  useCallback,
  // useEffect,
  useState,
} from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Input,
  Stack,
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
import EditRelayNumDialog from './EditRelayNumDialog';
import DeleteRelayNumDialog from './DeleteRelayNumDialog';
import AddRelayNumDialog from './AddRelayNumDialog';

const FILE_NAME = 'cradle_sms_relay.apk';

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

  const [appActionsOpen, setAppActionsOpen] = useState(false);

  // Relay Number Actions
  const [newNumberDialogOpen, setNewNumberDialogOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [popupRelayNum, setPopupRelayNum] = useState<RelayNum>();
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);

  const relayNumbersQuery = useQuery({
    queryKey: ['relayNumbers'],
    queryFn: getRelayServerPhones,
  });

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
            setNewNumberDialogOpen(true);
          }}>
          {'Add Number'}
        </Button>
        <Button
          variant={'contained'}
          startIcon={<DownloadIcon />}
          onClick={() => {
            setAppActionsOpen(true);
          }}>
          {'Download App'}
        </Button>
      </Stack>
    );
  };

  const isError = relayNumbersQuery.isError || appFileQuery.isError;
  return (
    <>
      {isError && <APIErrorToast />}

      <AddRelayNumDialog
        open={newNumberDialogOpen}
        onClose={() => setNewNumberDialogOpen(false)}
      />

      <Dialog open={appActionsOpen} maxWidth="md" fullWidth>
        <DialogTitle>Relay App Actions</DialogTitle>
        <DialogContent>
          <Box>
            <Typography component="h6" variant="h6">
              Download App
            </Typography>
            <Divider />
            <Box>
              {hasFile ? (
                <>
                  <div>Filename: {FILE_NAME}</div>
                  <div>File size: {fileSize}</div>
                  <div>Last modified: {fileLastModified}</div>
                </>
              ) : (
                <>No File Available</>
              )}
            </Box>
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
            <Box>
              <Button
                color="primary"
                aria-label="upload android package archive"
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
                setAppActionsOpen(false);
              }}>
              Cancel
            </CancelButton>
            <PrimaryButton
              type="submit"
              disabled={false}
              onClick={() => {
                setAppActionsOpen(false); //redundant - rework ui
              }}>
              Done
            </PrimaryButton>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <EditRelayNumDialog
        open={editPopupOpen}
        onClose={() => {
          setEditPopupOpen(false);
          relayNumbersQuery.refetch();
        }}
        relayNums={relayNumbersQuery?.data ?? []}
        editRelayNum={popupRelayNum}
      />
      <DeleteRelayNumDialog
        open={deletePopupOpen}
        onClose={() => {
          setDeletePopupOpen(false);
          relayNumbersQuery.refetch();
        }}
        relayNumToDelete={popupRelayNum}
      />

      <DataTableHeader title={'Relay App Servers'}>
        <HeaderButtons />
      </DataTableHeader>
      <DataTable columns={tableColumns} rows={tableRows} />
    </>
  );
};
