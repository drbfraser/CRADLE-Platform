import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import {
  getQuestionGridProps,
  isQuestionFieldDisabled,
} from './formQuestionUtils';
import { QuestionFieldProps } from './types';

export const StringField = ({
  question,
  answer,
  renderState,
  text,
  qid,
  required,
  formContext,
  setDisableSubmit,
}: QuestionFieldProps) => {
  const helperText = formContext.stringMaxLinesError[qid]
    ? 'Exceeds maximum number of lines'
    : question.stringMaxLines
      ? `Maximum ${question.stringMaxLines} line(s) allowed`
      : '';

  return (
    <Grid item {...getQuestionGridProps(renderState)}>
      <TextField
        label={text}
        value={answer.val ?? ''}
        required={required}
        variant="outlined"
        fullWidth
        disabled={isQuestionFieldDisabled(renderState)}
        multiline
        helperText={helperText}
        error={formContext.stringMaxLinesError[qid]}
        inputProps={{
          maxLength:
            question.stringMaxLength! > 0
              ? question.stringMaxLength
              : Number.MAX_SAFE_INTEGER,
        }}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const inputValue = event.target.value;
          const lines = inputValue.split(/\r*\n/);
          const exceedsMaxLines = question.stringMaxLines
            ? lines.length > question.stringMaxLines
            : false;

          const nextErrors = [...formContext.stringMaxLinesError];
          nextErrors[qid] = exceedsMaxLines;
          formContext.setStringMaxLinesError(nextErrors);

          if (setDisableSubmit) {
            setDisableSubmit(
              Object.values(nextErrors).some((value) => value === true)
            );
          }

          if (!exceedsMaxLines) {
            formContext.updateAnswersByValue(qid, inputValue);
          }
        }}
      />
    </Grid>
  );
};
