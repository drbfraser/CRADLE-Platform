import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { QRelationEnum } from 'src/shared/enums';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';

type VisibilityQuestionSelectProps = {
  disabled: boolean;
  selectedQIndex: string;
  filteredQs: TQuestion[];
  currentLanguage: string;
  onChange: (event: SelectChangeEvent) => void;
};

export const VisibilityQuestionSelect = ({
  disabled,
  selectedQIndex,
  filteredQs,
  currentLanguage,
  onChange,
}: VisibilityQuestionSelectProps) => (
  <Grid item xs={4}>
    <FormControl fullWidth>
      <InputLabel id="question-select-label">Question</InputLabel>
      <Select
        labelId="question-select-label"
        disabled={disabled}
        value={selectedQIndex}
        label="Question"
        onChange={onChange}>
        {filteredQs.map((question, index) => {
          const questionText =
            question.questionText[currentLanguage] ||
            Object.values(question.questionText)[0] ||
            'Untitled Question';

          return (
            <MenuItem key={index} value={String(index)}>
              {questionText}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  </Grid>
);

type VisibilityRelationSelectProps = {
  disabled: boolean;
  selectedConditional: QRelationEnum;
  onChange: (event: SelectChangeEvent) => void;
};

export const VisibilityRelationSelect = ({
  disabled,
  selectedConditional,
  onChange,
}: VisibilityRelationSelectProps) => (
  <Grid item xs={4}>
    <FormControl fullWidth>
      <InputLabel id="conditional-select-label">Conditional</InputLabel>
      <Select
        labelId="conditional-select-label"
        disabled={disabled}
        value={selectedConditional}
        label="Condition"
        onChange={onChange}>
        <MenuItem value={QRelationEnum.EQUAL_TO}>Equal to</MenuItem>
        <MenuItem value={QRelationEnum.LARGER_THAN}>Larger than</MenuItem>
        <MenuItem value={QRelationEnum.SMALLER_THAN}>Smaller than</MenuItem>
        <MenuItem value={QRelationEnum.CONTAINS}>Contains</MenuItem>
      </Select>
    </FormControl>
  </Grid>
);
