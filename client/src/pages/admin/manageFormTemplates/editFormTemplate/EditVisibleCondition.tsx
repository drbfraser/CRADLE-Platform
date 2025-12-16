import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Form, Formik } from 'formik';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FormQuestions } from 'src/pages/customizedForm/components/FormQuestions';
import {
  AnswerTypeEnum,
  FormRenderStateEnum,
  QRelationEnum,
  QuestionTypeEnum,
} from 'src/shared/enums';
import { QCondition } from 'src/shared/types/form/formTypes';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';
import { initialState, validationSchema } from '../../../customizedForm/state';

interface IProps {
  currVisCond?: QCondition;
  disabled: boolean;
  filteredQs: TQuestion[];
  setVisibleCondition: Dispatch<SetStateAction<QCondition[]>>;
  setIsVisCondAnswered: Dispatch<SetStateAction<boolean>>;
  setFieldChanged: Dispatch<SetStateAction<boolean>>;
}

const EditVisibleCondition = ({
  currVisCond,
  disabled,
  filteredQs,
  setVisibleCondition,
  setIsVisCondAnswered,
  setFieldChanged,
}: IProps) => {
  // Find the index of the current question in filteredQs
  const [selectedQIndex, setSelectedQIndex] = useState<string>(() => {
    if (currVisCond) {
      const index = filteredQs.findIndex(
        (q) => q.order === currVisCond.questionIndex
      );
      return index >= 0 ? String(index) : '0';
    }
    return '0';
  });

  const [selectedConditional, setSelectedConditional] = useState(
    currVisCond ? currVisCond.relation : QRelationEnum.EQUAL_TO
  );

  const [selectedAnswer, setSelectedAnswer] = useState(
    currVisCond ? currVisCond.answers : undefined
  );

  // Get the current language (first available language from the first question)
  const currentLanguage =
    filteredQs.length > 0
      ? Object.keys(filteredQs[0].questionText)[0] || 'english'
      : 'english';

  // Build a question object for FormQuestions component
  const [question, setQuestion] = useState<TQuestion[]>([
    {
      id: undefined,
      order: 0,
      questionText: { [currentLanguage]: '' },
      questionType: QuestionTypeEnum.STRING,
      required: true,
      allowFutureDates: true,
      allowPastDates: true,
      numMin: null,
      numMax: null,
      stringMaxLength: null,
      stringMaxLines: null,
      units: null,
      visibleCondition: [],
      categoryIndex: null,
      hasCommentAttached: false,
      questionStringId: undefined,
      userQuestionId: undefined,
      mcOptions: [],
    },
  ]);

  useEffect(() => {
    setFieldChanged((bool) => !bool);
  }, [selectedAnswer]);

  // Update visible condition whenever any dependency changes
  useEffect(() => {
    if (
      selectedQIndex !== null &&
      selectedConditional !== null &&
      selectedAnswer !== undefined
    ) {
      // Check if answer has valid data
      const hasValidAnswer =
        (selectedAnswer.comment !== undefined &&
          selectedAnswer.comment !== null) ||
        (selectedAnswer.mcIdArray !== undefined &&
          selectedAnswer.mcIdArray !== null &&
          selectedAnswer.mcIdArray.length > 0) ||
        (selectedAnswer.number !== undefined &&
          selectedAnswer.number !== null) ||
        (selectedAnswer.text !== undefined && selectedAnswer.text !== null);

      setIsVisCondAnswered(hasValidAnswer);

      setVisibleCondition([
        {
          questionIndex: filteredQs[+selectedQIndex].order,
          relation: selectedConditional,
          answers: selectedAnswer,
        },
      ]);
    }
  }, [selectedQIndex, selectedConditional, selectedAnswer, filteredQs]);

  // Update question display when selected question changes
  useEffect(() => {
    if (selectedQIndex === '' || filteredQs.length === 0) return;

    const selectedQuestion = filteredQs[+selectedQIndex];
    if (!selectedQuestion) return;

    setQuestion([
      {
        ...selectedQuestion,
        questionText: selectedQuestion.questionText,
        mcOptions: selectedQuestion.mcOptions || [],
        order: 0, // For the FormQuestions component, use order 0
      },
    ]);
  }, [selectedQIndex, filteredQs]);

  const handleQuestionChange = (event: SelectChangeEvent) => {
    setFieldChanged((bool) => !bool);
    setSelectedQIndex(event.target.value);
    // Reset answer when question changes
    setSelectedAnswer(undefined);
  };

  const handleConditionChange = (event: SelectChangeEvent) => {
    setFieldChanged((bool) => !bool);
    setSelectedConditional(event.target.value as QRelationEnum);
  };

  return filteredQs.length > 0 ? (
    <>
      <Formik
        initialValues={initialState as any}
        validationSchema={validationSchema}
        onSubmit={() => {
          // pass
        }}>
        {() => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel id="question-select-label">Question</InputLabel>
                  <Select
                    labelId="question-select-label"
                    disabled={disabled}
                    value={selectedQIndex}
                    label="Question"
                    onChange={handleQuestionChange}>
                    {filteredQs.map((question, index) => {
                      // Get text in current language, fallback to first available
                      const questionText =
                        question.questionText[currentLanguage] ||
                        Object.values(question.questionText)[0] ||
                        'Untitled Question';

                      return (
                        <MenuItem key={index} value={index}>
                          {questionText}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel id="conditional-select-label">
                    Conditional
                  </InputLabel>
                  <Select
                    labelId="conditional-select-label"
                    disabled={disabled}
                    value={selectedConditional}
                    label="Condition"
                    onChange={handleConditionChange}>
                    <MenuItem value={QRelationEnum.EQUAL_TO}>Equal to</MenuItem>
                    <MenuItem value={QRelationEnum.LARGER_THAN}>
                      Larger than
                    </MenuItem>
                    <MenuItem value={QRelationEnum.SMALLER_THAN}>
                      Smaller than
                    </MenuItem>
                    <MenuItem value={QRelationEnum.CONTAINS}>Contains</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                {FormQuestions({
                  questions: question,
                  renderState: disabled
                    ? FormRenderStateEnum.VIS_COND_DISABLED
                    : FormRenderStateEnum.VIS_COND,
                  language: currentLanguage,
                  handleAnswers: (answers) => {
                    const answer = answers[0];
                    if (!answer) return;

                    switch (answer.answerType) {
                      case AnswerTypeEnum.TEXT:
                        setSelectedAnswer({ text: answer.val });
                        break;
                      case AnswerTypeEnum.NUM:
                        setSelectedAnswer({ number: answer.val });
                        break;
                      case AnswerTypeEnum.MC_ID_ARRAY: {
                        const selectedQ = filteredQs[+selectedQIndex];
                        if (selectedQ.mcOptions) {
                          const matchingOptionIndex =
                            selectedQ.mcOptions.findIndex((opt) => {
                              // Check if any translation matches the answer value
                              return Object.values(opt.translations || {}).some(
                                (translation) => translation === answer.val
                              );
                            });

                          if (matchingOptionIndex !== -1) {
                            setSelectedAnswer({
                              mcIdArray: [matchingOptionIndex],
                            });
                          }
                        }
                        break;
                      }
                      default:
                        break;
                    }
                  },
                })}
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  ) : null;
};

export default EditVisibleCondition;
