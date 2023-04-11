import { Dialog, DialogActions } from '@mui/material';
import { CancelButton } from '../../../../shared/components/Button';

interface IProps {
  open: boolean;
  onClose: () => void;
  // users: IUser[];
  // editUser?: IUser;
}
const EditField = ({ open, onClose }: IProps) => {
  return (
    <>
      {/*<APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />*/}
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogActions>
          <CancelButton type="button" onClick={onClose}>
            Cancel
          </CancelButton>
          {/*<PrimaryButton*/}
          {/*    type="submit"*/}
          {/*    disabled={isSubmitting || !isValid}>*/}
          {/*    {creatingNew ? 'Create' : 'Save'}*/}
          {/*</PrimaryButton>*/}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditField;
