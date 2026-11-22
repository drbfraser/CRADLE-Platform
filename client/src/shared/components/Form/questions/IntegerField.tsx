import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import CustomNumberField from 'src/shared/components/Form/CustomNumberField';
import { FormRenderStateEnum } from 'src/shared/enums';
import {
  getQuestionGridProps,
  isQuestionFieldDisabled,
} from './formQuestionUtils';
import { QuestionFieldProps } from './types';

// Generate a number to determine which group the patient is allocated to (revealed or concealed) in PAPAGAIO Study.
// TODO: May need a more robust randomisation method in the future (live in the server rather than allow user to generate a number in the form).
export const RANDOMISATION_USER_QUESTION_ID = 'randomisation_number';

const DEFAULT_RANDOM_MIN = 0;
const DEFAULT_RANDOM_MAX = 679;

export const generateRandomInteger = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const IntegerField = ({
  question,
  answer,
  renderState,
  text,
  qid,
  required,
  formContext,
}: QuestionFieldProps) => {
  const isRandomisation =
    question.userQuestionId === RANDOMISATION_USER_QUESTION_ID;
  const hasValue = answer.val !== undefined && answer.val !== null;
  const showGenerateButton =
    isRandomisation && renderState === FormRenderStateEnum.FIRST_SUBMIT;

  const handleGenerate = () => {
    const min = question.numMin ?? DEFAULT_RANDOM_MIN;
    const max = question.numMax ?? DEFAULT_RANDOM_MAX;
    formContext.setNumberErrors((prevErrors) => ({
      ...prevErrors,
      [qid]: '',
    }));
    formContext.updateAnswersByValue(qid, generateRandomInteger(min, max));
  };

  return (
    <Grid item {...getQuestionGridProps(renderState)}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
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
              readOnly: isRandomisation,
              endAdornment: Boolean(question.units) &&
                Boolean(question.units!.trim().length > 0) && (
                  <InputAdornment position="end">
                    {question.units}
                  </InputAdornment>
                ),
            },
          }}
        />
        {showGenerateButton && (
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={hasValue}
            sx={{ flexShrink: 0, height: 56 }}>
            Generate
          </Button>
        )}
      </Box>
    </Grid>
  );
};
