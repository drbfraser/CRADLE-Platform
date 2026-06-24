import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { getPrettyDate, getTimestampFromStringDate } from 'src/shared/utils';
import {
  getQuestionGridProps,
  isQuestionFieldDisabled,
} from './formQuestionUtils';
import { QuestionFieldProps } from './types';

export const DateField = ({
  question,
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
      value={answer.val ? getPrettyDate(answer.val) : ''}
      fullWidth
      disabled={isQuestionFieldDisabled(renderState)}
      required={required}
      variant="outlined"
      type="date"
      InputLabelProps={{
        shrink: true,
      }}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        const timestamp = getTimestampFromStringDate(event.target.value);
        formContext.updateAnswersByValue(qid, timestamp);
      }}
      inputProps={{
        ...(!question.allowFutureDates
          ? { max: formContext.getCurrentDate() }
          : {}),
        ...(!question.allowPastDates
          ? { min: formContext.getCurrentDate() }
          : {}),
      }}
    />
  </Grid>
);
