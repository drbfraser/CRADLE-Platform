import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import {
  getPrettyDateTime,
  getTimestampFromStringDate,
} from 'src/shared/utils';
import {
  getQuestionGridProps,
  isQuestionFieldDisabled,
} from './formQuestionUtils';
import { QuestionFieldProps } from './types';

export const DateTimeField = ({
  answer,
  renderState,
  text,
  qid,
  required,
  formContext,
}: QuestionFieldProps) => (
  <Grid item {...getQuestionGridProps(renderState)}>
    <TextField
      label={text}
      value={answer.val ? getPrettyDateTime(answer.val) : ''}
      fullWidth
      disabled={isQuestionFieldDisabled(renderState)}
      required={required}
      variant="outlined"
      type="datetime-local"
      inputProps={{ step: 1 }}
      placeholder="YYYY/MM/DD hh:mm:ss"
      InputLabelProps={{
        shrink: true,
      }}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        const timestamp = getTimestampFromStringDate(event.target.value);
        formContext.updateAnswersByValue(qid, timestamp);
      }}
    />
  </Grid>
);
