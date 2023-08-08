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
import { FormQuestions } from 'src/pages/customizedForm/FormQuestions';
import {
  AnswerTypeEnum,
  FormRenderStateEnum,
  QRelationEnum,
  QuestionTypeEnum,
} from 'src/shared/enums';
import { QCondition, Question, TQuestion } from 'src/shared/types';
import {
  initialState,
  validationSchema,
} from '../../../customizedForm/customizedEditForm/state';

interface IProps {
  currQuestion?: TQuestion;
  filteredQs: TQuestion[];
  setVisibleCondition: Dispatch<SetStateAction<QCondition[]>>;
  setFieldChanged: Dispatch<SetStateAction<boolean>>;
  origFieldChanged: boolean;
}

const EditVisibleCondition = ({
  currQuestion,
  filteredQs: filteredQs,
  setVisibleCondition,
  setFieldChanged,
  origFieldChanged,
}: IProps) => {
  const currVisCond =
    currQuestion && currQuestion.visibleCondition[0]
      ? currQuestion.visibleCondition[0]
      : null;
  const [childFieldChanged, setChildFieldChanged] = useState(origFieldChanged);
  // selectedQIndex is filteredQs[index]
  const [selectedQIndex, setSelectedQIndex] = useState<string>(
    currVisCond
      ? '' +
          filteredQs.indexOf(
            filteredQs.find((q) => {
              return q.questionIndex === currVisCond.qidx;
            }) ?? filteredQs[0]
          )
      : '0'
  );
  const [selectedConditional, setSelectedConditional] = useState(
    currVisCond ? currVisCond.relation : QRelationEnum.EQUAL_TO
  );
  const [selectedAnswer, setSelectedAnswer] = useState(
    currVisCond ? currVisCond.answers : undefined
  );
  // this is the array of questions we will pass to FormQuestions
  const [question, setQuestion] = useState<Question[]>([
    {
      id: '',
      isBlank: false,
      questionIndex: 0,
      questionText: '',
      questionType: QuestionTypeEnum.CATEGORY,
      required: true,
      numMin: null,
      numMax: null,
      stringMaxLength: null,
      units: null,
      answers: selectedAnswer ? selectedAnswer : undefined,
      visibleCondition: [],
      formTemplateId: '',
      mcOptions: [],
      hasCommentAttached: false,
      shouldHidden: null,
      dependencies: null,
    },
  ]);

  useEffect(() => {
    setFieldChanged(!childFieldChanged);
    setChildFieldChanged(!childFieldChanged);
  }, [selectedAnswer]);

  useEffect(() => {
    if (
      selectedQIndex != null &&
      selectedConditional != null &&
      selectedAnswer != null
    ) {
      setVisibleCondition([
        {
          qidx: filteredQs[+selectedQIndex].questionIndex,
          relation: selectedConditional,
          answers: selectedAnswer,
        },
      ]);
    }
  }, [selectedQIndex, selectedConditional, selectedAnswer]);

  useEffect(() => {
    setQuestion((question) => {
      question[0].questionText =
        filteredQs[+selectedQIndex].questionLangVersions[0].questionText;
      question[0].mcOptions =
        filteredQs[+selectedQIndex].questionLangVersions[0].mcOptions;
      question[0].questionType = filteredQs[+selectedQIndex].questionType;
      return [...question];
    });
  }, [selectedQIndex]);

  const handleQuestionChange = (event: SelectChangeEvent) => {
    setFieldChanged(!childFieldChanged);
    setChildFieldChanged(!childFieldChanged);
    setSelectedQIndex(event.target.value);
  };

  const handleConditionChange = (event: SelectChangeEvent) => {
    setFieldChanged(!childFieldChanged);
    setChildFieldChanged(!childFieldChanged);
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
        {({ isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel id="question-select-label">Question</InputLabel>
                  <Select
                    labelId="question-select-label"
                    value={selectedQIndex}
                    label="Question"
                    defaultValue={selectedQIndex}
                    onChange={handleQuestionChange}>
                    {filteredQs.map((question, index) => {
                      return (
                        <MenuItem key={index} value={index}>
                          {question.questionLangVersions[0].questionText}
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
                  renderState: FormRenderStateEnum.EDIT,
                  language:
                    filteredQs[+selectedQIndex].questionLangVersions[0].lang,
                  handleAnswers: (answers) => {
                    const answer = answers[0];
                    switch (answer.anstype) {
                      case AnswerTypeEnum.TEXT:
                        setSelectedAnswer({ text: answer.val });
                        break;
                      case AnswerTypeEnum.NUM:
                        setSelectedAnswer({ number: answer.val });
                        break;
                      case AnswerTypeEnum.MCID_ARRAY:
                        filteredQs[
                          +selectedQIndex
                        ].questionLangVersions[0].mcOptions.forEach(
                          (option) => {
                            if (option.opt == answer.val) {
                              setSelectedAnswer({ mcidArray: [option.mcid] });
                            }
                          }
                        );
                        break;
                      // case ...
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
