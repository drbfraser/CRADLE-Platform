import { ChangeEvent } from 'react';
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
  Typography,
} from '@mui/material';
import UploadFile from '@mui/icons-material/UploadFile';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';

const FILE_NAME = 'cradle_sms_relay.apk';

type RelayAppActionsDialogProps = {
  open: boolean;
  onClose: () => void;
  hasFile: boolean;
  fileSize?: string;
  fileLastModified?: string;
  onDownload: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  uploadError?: string;
  uploadSuccess: boolean;
};

export const RelayAppActionsDialog = ({
  open,
  onClose,
  hasFile,
  fileSize,
  fileLastModified,
  onDownload,
  onFileChange,
  onUpload,
  uploadError,
  uploadSuccess,
}: RelayAppActionsDialogProps) => (
  <Dialog open={open} maxWidth="md" fullWidth onClose={onClose}>
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
          <PrimaryButton onClick={onDownload}>Download</PrimaryButton>
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
              onChange={onFileChange}
            />
          </Button>
        </Box>
        <PrimaryButton onClick={onUpload}>Upload</PrimaryButton>
        {uploadError ? (
          <Alert severity="error">Upload failed - {uploadError}</Alert>
        ) : (
          uploadSuccess && (
            <Alert style={{ marginTop: '20px' }} severity="success">
              Upload successful
            </Alert>
          )
        )}
      </Box>

      <DialogActions>
        <CancelButton type="button" onClick={onClose}>
          Cancel
        </CancelButton>
        <PrimaryButton type="submit" onClick={onClose}>
          Done
        </PrimaryButton>
      </DialogActions>
    </DialogContent>
  </Dialog>
);
