import {
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { QRelationEnum } from 'src/shared/enums';
import { QCondition, TQuestion } from 'src/shared/types';

interface IProps {
  questionsArr: TQuestion[];
  setVisibleCondition: Dispatch<SetStateAction<QCondition[]>>;
}

const EditVisibleCondition = ({
  questionsArr,
  setVisibleCondition,
}: IProps) => {
  const [selectedQIndex, setSelectedQIndex] = useState('');
  const [conditional, setConditional] = useState(QRelationEnum.EQUAL_TO);
  const [selectedAnswer, setSelectedAnswer] = useState('');

  useEffect(() => {
    if (
      selectedQIndex != null &&
      conditional != null &&
      selectedAnswer != null
    ) {
      setVisibleCondition([
        {
          qidx: selectedQIndex as unknown as number,
          relation: QRelationEnum.EQUAL_TO,
          answers: { comment: selectedAnswer },
        },
      ]);
    }
  }, [selectedQIndex, conditional, selectedAnswer]);

  const handleQuestionChange = (event: SelectChangeEvent) => {
    setSelectedQIndex(event.target.value);
  };

  const handleConditionChange = (event: SelectChangeEvent) => {
    setConditional(event.target.value as QRelationEnum);
  };

  const handleAnswerChange = (event: SelectChangeEvent) => {
    setSelectedAnswer(event.target.value);
  };

  return questionsArr.length > 0 ? (
    <>
      <Grid item sm={12} md={2} lg={2}>
        <FormLabel id="field-visibility-label">
          <Typography variant="h6">Control Visibility</Typography>
        </FormLabel>
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel id="question-select-label">Question</InputLabel>
          <Select
            labelId="question-select-label"
            value={selectedQIndex}
            label="Question"
            onChange={handleQuestionChange}>
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {questionsArr.map((question) => {
              return (
                <MenuItem
                  key={question.questionIndex}
                  value={question.questionIndex}>
                  {question.questionLangVersions[0].questionText}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel id="conditional-select-label">Conditional</InputLabel>
          <Select
            labelId="conditional-select-label"
            value={conditional}
            label="Condition"
            onChange={handleConditionChange}>
            <MenuItem value={QRelationEnum.EQUAL_TO}>Equal to</MenuItem>
            <MenuItem value={QRelationEnum.LARGER_THAN}>Larger than</MenuItem>
            <MenuItem value={QRelationEnum.SMALLER_THAN}>Smaller than</MenuItem>
            <MenuItem value={QRelationEnum.CONTAINS}>Contains</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel id="answer-select-label">Answer</InputLabel>
          <Select
            labelId="answer-select-label"
            value={selectedAnswer}
            label="Answer"
            onChange={handleAnswerChange}>
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </>
  ) : null;
};

export default EditVisibleCondition;
