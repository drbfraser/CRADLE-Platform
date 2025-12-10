import { useEffect, useState } from 'react';
import {
  AnswerTypeEnum,
  QuestionTypeEnum,
  QRelationEnum,
} from 'src/shared/enums';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';
import {
  QAnswer,
  Question,
  QCondition,
  McOption,
} from 'src/shared/types/form/formTypes';

export const useFormQuestions = (
  questions: Question[] | TQuestion[],
  handleAnswers: (a: QAnswer[]) => void
) => {
  const [answers, setAnswers] = useState<QAnswer[]>([]);
  const [stringMaxLinesError, setStringMaxLinesError] = useState<boolean[]>([]);
  const [numberErrors, setNumberErrors] = useState<{ [key: number]: string }>(
    {}
  );

  const getCurrentDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    let month: number | string = today.getMonth() + 1;
    let day: number | string = today.getDate();

    if (month < 10) {
      month = '0' + month;
    }
    if (day < 10) {
      day = '0' + day;
    }

    return `${year}-${month}-${day}`;
  };

  const isQuestion = (x: Question | TQuestion): x is Question => {
    if (x) {
      return 'questionText' in x;
    }
    return false;
  };

  const isQuestionArr = (x: Question[] | TQuestion[]): x is Question[] => {
    if (x && x[0]) {
      return 'questionText' in x[0];
    }
    return false;
  };

  const handleNumericTypeVisCondition = (
    parentAnswer: QAnswer,
    condition: QCondition
  ): boolean => {
    switch (condition.relation) {
      case QRelationEnum.EQUAL_TO:
        return Number(parentAnswer.val) === Number(condition.answers.number);
      case QRelationEnum.SMALLER_THAN:
        return Number(parentAnswer.val) < Number(condition.answers.number);
      case QRelationEnum.LARGER_THAN:
        return Number(parentAnswer.val) > Number(condition.answers.number);
      case QRelationEnum.CONTAINS:
        return String(parentAnswer.val).includes(
          String(condition.answers.number)
        );
      default:
        return true;
    }
  };

  useEffect(() => {
    const getValuesFromIDs = (
      question: Question,
      mcIdArray: number[] | undefined
    ): string[] => {
      const res: string[] = [];

      // TODO: update this logic for new form question type
      const mcOptions: McOption[] = question.mcOptions ?? [];
      mcIdArray?.forEach((optionIndex) => {
        res.push('');
        // res.push(mcOptions[optionIndex]);
      });

      return res;
    };

    const getAnswerFromQuestion = (question: Question): QAnswer => {
      const answer: QAnswer = {
        questionIndex: question.questionIndex,
        questionType: null,
        answerType: null,
        val: null,
      };

      answer.questionType = question.questionType;

      switch (question.questionType) {
        case QuestionTypeEnum.MULTIPLE_CHOICE:
        case QuestionTypeEnum.MULTIPLE_SELECT:
          answer.answerType = AnswerTypeEnum.MC_ID_ARRAY;
          answer.val = getValuesFromIDs(question, question.answers?.mcIdArray);
          break;

        case QuestionTypeEnum.INTEGER:
        case QuestionTypeEnum.DATE:
        case QuestionTypeEnum.DATETIME:
          answer.answerType = AnswerTypeEnum.NUM;
          answer.val = question.answers?.number ?? null;
          break;

        case QuestionTypeEnum.STRING:
          answer.answerType = AnswerTypeEnum.TEXT;
          answer.val = question.answers?.text ?? null;
          break;

        case QuestionTypeEnum.CATEGORY:
          answer.answerType = AnswerTypeEnum.CATEGORY;
          answer.val = null;
          break;

        default:
          console.log(question.questionType);
          console.log('NOTE: INVALID QUESTION TYPE!!');
      }

      return answer;
    };

    if (isQuestionArr(questions)) {
      const getAnswers = (questions: Question[]) =>
        questions.map((question: Question) => getAnswerFromQuestion(question));

      const answers: QAnswer[] = getAnswers(questions);
      updateQuestionsConditionHidden(questions, answers);
      setAnswers(answers);
      handleAnswers(answers);
    }
  }, [questions]);

  function updateAnswersByValue(index: number, newValue: any) {
    if (isQuestionArr(questions)) {
      const ans = [...answers];
      ans.forEach((a) => {
        if (a.questionIndex === index) {
          a.val = newValue;
        }
      });
      updateQuestionsConditionHidden(questions, ans);
      setAnswers(ans);
      handleAnswers(ans);
    }
  }

  const updateQuestionsConditionHidden = (
    questions: Question[],
    answers: QAnswer[]
  ) => {
    questions.forEach((question) => {
      question.shouldHidden =
        question.visibleCondition?.length !== 0 &&
        question.visibleCondition.some((condition: QCondition) => {
          const parentQuestion = questions[condition.questionIndex];
          const parentAnswer: QAnswer = answers[parentQuestion.questionIndex];

          if (!parentAnswer.val) {
            return true;
          }

          let isConditionMet = true;
          switch (parentQuestion.questionType) {
            // TODO: This does not work. The multiple choice and multiple select questions do not save properly in the QCondition object type
            case QuestionTypeEnum.MULTIPLE_CHOICE:
            case QuestionTypeEnum.MULTIPLE_SELECT:
              // switch (condition.relation) {
              //   case QRelationEnum.EQUAL_TO:
              //     isConditionMet =
              //       condition.answers.mcIdArray!.length > 0 &&
              //       parentAnswer.val?.length > 0 &&
              //       parentAnswer.val?.length ===
              //         condition.answers.mcIdArray?.length &&
              //       condition.answers.mcIdArray!.every((item) =>
              //         parentAnswer.val?.includes(
              //           parentQuestion.mcOptions[item].opt
              //         )
              //       );
              //     break;
              // }
              break;
            case QuestionTypeEnum.STRING:
              switch (condition.relation) {
                case QRelationEnum.EQUAL_TO:
                  isConditionMet = parentAnswer.val === condition.answers.text;
                  break;
                case QRelationEnum.SMALLER_THAN:
                  if (!condition.answers.text) {
                    isConditionMet = false;
                    break;
                  }
                  isConditionMet = parentAnswer.val < condition.answers.text;
                  break;
                case QRelationEnum.LARGER_THAN:
                  if (!condition.answers.text) {
                    isConditionMet = false;
                    break;
                  }
                  isConditionMet = parentAnswer.val > condition.answers.text;
                  break;
                case QRelationEnum.CONTAINS:
                  isConditionMet = parentAnswer.val.includes(
                    condition.answers.text
                  );
                  break;
              }
              break;
            case QuestionTypeEnum.INTEGER:
              isConditionMet = handleNumericTypeVisCondition(
                parentAnswer,
                condition
              );
              break;
            case QuestionTypeEnum.DATE:
              isConditionMet = handleNumericTypeVisCondition(
                parentAnswer,
                condition
              );
              break;
            case QuestionTypeEnum.DATETIME:
              isConditionMet = handleNumericTypeVisCondition(
                parentAnswer,
                condition
              );
              break;
          }

          return !isConditionMet;
        });
    });
  };

  return {
    answers,
    updateAnswersByValue,
    stringMaxLinesError,
    setStringMaxLinesError,
    numberErrors,
    setNumberErrors,
    isQuestion,
    getCurrentDate,
  };
};
