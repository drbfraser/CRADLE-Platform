import { CategorySharp } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getQuestionGridProps } from './formQuestionUtils';
import { QuestionFieldProps } from './types';

export const CategoryField = ({ text, renderState }: QuestionFieldProps) => (
  <Grid item {...getQuestionGridProps(renderState, true)}>
    <Typography component="h3" variant="h5">
      <CategorySharp fontSize="large" /> &nbsp; {text}
    </Typography>
    <Divider style={{ width: '100%', marginBottom: '10px' }} />
  </Grid>
);
