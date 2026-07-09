import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import { PrimaryButton } from 'src/shared/components/Button';

type FormEditorFooterProps = {
  onAddCategory: () => void;
  onSubmit: () => void;
  submitDisabled: boolean;
};

export const FormEditorFooter = ({
  onAddCategory,
  onSubmit,
  submitDisabled,
}: FormEditorFooterProps) => (
  <Grid item container justifyContent="space-between">
    <Grid item xs={6}>
      <div style={{ display: 'inline-block' }}>
        <PrimaryButton onClick={onAddCategory}>
          <AddIcon />
          Add Category
        </PrimaryButton>
      </div>
    </Grid>
    <Grid item container xs={6} justifyContent="flex-end">
      <PrimaryButton onClick={onSubmit} type="button" disabled={submitDisabled}>
        Submit Template
      </PrimaryButton>
    </Grid>
  </Grid>
);
