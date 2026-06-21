import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import CustomNumberField from 'src/shared/components/Form/CustomNumberField';
import {
  getQuestionGridProps,
  isQuestionFieldDisabled,
} from './formQuestionUtils';
import { QuestionFieldProps } from './types';

export const IntegerField = ({
  question,
  answer,
  renderState,
  text,
  qid,
  required,
  formContext,
}: QuestionFieldProps) => (
  <Grid item {...getQuestionGridProps(renderState)}>
    <CustomNumberField
      value={answer.val}
      label={text}
      variant="outlined"
      required={required}
      fullWidth
      error={!!formContext.numberErrors[qid]}
      helperText={formContext.numberErrors[qid]}
      onValueChange={(values) => {
        const value = values.floatValue;
        let errorMessage = '';

        if (value !== undefined) {
          if (
            question.numMin !== undefined &&
            question.numMin !== null &&
            value < question.numMin
          ) {
            errorMessage = `Value must be at least ${question.numMin}.`;
          }
          if (
            question.numMax !== undefined &&
            question.numMax !== null &&
            value > question.numMax
          ) {
            errorMessage = `Value must not exceed ${question.numMax}`;
          }
        }

        formContext.setNumberErrors((prevErrors) => ({
          ...prevErrors,
          [qid]: errorMessage,
        }));

        formContext.updateAnswersByValue(qid, value);
      }}
      disabled={isQuestionFieldDisabled(renderState)}
      slotProps={{
        input: {
          endAdornment: Boolean(question.units) &&
            Boolean(question.units!.trim().length > 0) && (
              <InputAdornment position="end">{question.units}</InputAdornment>
            ),
        },
      }}
    />
  </Grid>
);
