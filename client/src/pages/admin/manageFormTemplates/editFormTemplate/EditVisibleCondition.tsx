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
  questionsArr: TQuestion[];
  setVisibleCondition: Dispatch<SetStateAction<QCondition[]>>;
}

const EditVisibleCondition = ({
  currQuestion,
  questionsArr,
  setVisibleCondition,
}: IProps) => {
  const currVisCond =
    currQuestion && currQuestion.visibleCondition[0]
      ? currQuestion.visibleCondition[0]
      : null;
  // selectedQIndex is question.questionIndex
  const [selectedQIndex, setSelectedQIndex] = useState(
    currVisCond ? currVisCond.qidx.toString() : '0'
  );
  const [selectedConditional, setSelectedConditional] = useState(
    currVisCond ? currVisCond.relation : QRelationEnum.EQUAL_TO
  );
  const [selectedAnswer, setSelectedAnswer] = useState(
    currVisCond ? currVisCond.answers : null
  );
  const [formDirty, setFormDirty] = useState(false);
  const [question, setQuestion] = useState<Question[]>([
    {
      id: 'filteredQuestions[+selectedQIndex].questionId',
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
    if (
      selectedQIndex != null &&
      selectedConditional != null &&
      selectedAnswer != null
    ) {
      setVisibleCondition([
        {
          qidx: +selectedQIndex,
          relation: selectedConditional,
          answers: selectedAnswer,
        },
      ]);
    }
  }, [selectedQIndex, selectedConditional, selectedAnswer]);

  useEffect(() => {
    setQuestion((question) => {
      question[0].questionText =
        filteredQuestions[+selectedQIndex].questionLangVersions[0].questionText;
      question[0].mcOptions =
        filteredQuestions[+selectedQIndex].questionLangVersions[0].mcOptions;
      question[0].questionType =
        filteredQuestions[+selectedQIndex].questionType;
      return [...question];
    });
  }, [selectedQIndex]);

  const filteredQuestions = questionsArr.filter(
    (question) => question.questionType != QuestionTypeEnum.CATEGORY
  );

  const handleQuestionChange = (event: SelectChangeEvent) => {
    setSelectedQIndex(event.target.value);
    setFormDirty(!formDirty);
  };

  const handleConditionChange = (event: SelectChangeEvent) => {
    setSelectedConditional(event.target.value as QRelationEnum);
    setFormDirty(!formDirty);
  };

  return filteredQuestions.length > 0 ? (
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
                    defaultValue={
                      currQuestion && currQuestion.visibleCondition[0]
                        ? currQuestion.visibleCondition[0].qidx.toString()
                        : filteredQuestions[0].questionIndex.toString()
                    }
                    onChange={handleQuestionChange}>
                    {filteredQuestions.map((question, index) => {
                      return (
                        <MenuItem key={index} value={question.questionIndex}>
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
                  // filteredQuestions[+selectedQIndex]

                  renderState: FormRenderStateEnum.FIRST_SUBMIT,
                  language:
                    filteredQuestions[+selectedQIndex].questionLangVersions[0]
                      .lang,
                  handleAnswers: (answers) => {
                    const answer = answers[0];
                    switch (answer.anstype) {
                      case AnswerTypeEnum.TEXT:
                        setSelectedAnswer({ text: answer.val });
                        break;
                      case AnswerTypeEnum.NUM:
                        setSelectedAnswer({ number: answer.val });
                        break;
                      // case ...
                    }
                    setFormDirty(!formDirty);
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
