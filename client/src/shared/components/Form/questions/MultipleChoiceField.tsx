import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import { RadioGroup } from '@mui/material';
import Typography from '@mui/material/Typography';
import {
  getQuestionGridProps,
  isQuestionFieldDisabled,
} from './formQuestionUtils';
import { QuestionFieldProps } from './types';

export const MultipleChoiceField = ({
  question,
  answer,
  renderState,
  text,
  qid,
  required,
  mcOptions,
  formContext,
}: QuestionFieldProps) => (
  <Grid item {...getQuestionGridProps(renderState)}>
    <FormLabel id={`question_${qid}`}>
      <Typography variant="h6">
        {`${text}`}
        {required ? ' *' : ''}
      </Typography>
    </FormLabel>

    <RadioGroup
      row
      aria-labelledby={`question_${qid}`}
      value={answer.val ? answer.val[0] : ''}
      key={answer.val}
      onChange={function (_, value) {
        formContext.updateAnswersByValue(qid, [value]);
      }}>
      {mcOptions?.map((McOption, index) => (
        <FormControlLabel
          key={index}
          value={McOption}
          control={
            <Radio
              color="primary"
              disabled={isQuestionFieldDisabled(renderState)}
            />
          }
          label={McOption}
        />
      ))}
    </RadioGroup>
  </Grid>
);
