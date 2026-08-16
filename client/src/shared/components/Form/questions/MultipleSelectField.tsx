import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {
  getMultiSelectValidationMessage,
  getQuestionGridProps,
  isQuestionFieldDisabled,
} from './formQuestionUtils';
import { QuestionFieldProps } from './types';

export const MultipleSelectField = ({
  question,
  answer,
  renderState,
  text,
  qid,
  required,
  mcOptions,
  formContext,
  multiSelectValidationFailed,
}: QuestionFieldProps) => {
  const validationMessage =
    formContext.isQuestion(question) &&
    getMultiSelectValidationMessage(
      answer,
      question.questionType,
      multiSelectValidationFailed
    );

  return (
    <Grid item {...getQuestionGridProps(renderState)}>
      <FormLabel>
        <Typography variant="h6">
          {`${text}${required ? ' *' : ''}`}
          {validationMessage ? (
            <Typography
              component="span"
              variant="overline"
              style={{ color: '#FF0000', fontWeight: 600 }}>
              {' '}
              {validationMessage}
            </Typography>
          ) : null}
        </Typography>
      </FormLabel>
      {mcOptions?.map((mcOption) => {
        const selectedValues = Array.isArray(answer.val) ? answer.val : [];

        return (
          <FormControlLabel
            control={
              <Checkbox
                value={mcOption}
                checked={selectedValues.includes(mcOption)}
                onChange={(_event, checked) => {
                  // Guard against non-array defaults (e.g. createDefaultAnswer uses '').
                  const newValue = checked
                    ? [...selectedValues, mcOption]
                    : selectedValues.filter((val: unknown) => val !== mcOption);
                  formContext.updateAnswersByValue(qid, newValue);
                }}
              />
            }
            label={mcOption}
            key={mcOption}
            disabled={isQuestionFieldDisabled(renderState)}
          />
        );
      })}
    </Grid>
  );
};
