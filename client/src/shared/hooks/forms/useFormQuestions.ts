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

  const getQuestionIndex = (question: Question | TQuestion): number => {
    if (
      'questionIndex' in question &&
      typeof question.questionIndex === 'number'
    ) {
      return question.questionIndex;
    }

    if ('order' in question && typeof question.order === 'number') {
      return question.order;
    }

    return -1;
  };

  const getQuestionByIndex = (
    questionIndex: number
  ): Question | TQuestion | undefined =>
    questions.find((question) => getQuestionIndex(question) === questionIndex);

  const getMcOptionLabel = (
    option: McOption | { translations?: Record<string, string> }
  ) => {
    if ('opt' in option) {
      return option.opt;
    }

    return (
      option.translations?.english ??
      Object.values(option.translations ?? {})[0] ??
      ''
    );
  };

  const isQuestion = (x: Question | TQuestion): x is Question | TQuestion =>
    Boolean(x);

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

  const getValuesFromIDs = (
    question: Question | TQuestion,
    mcIdArray: number[] | undefined
  ): string[] => {
    const res: string[] = [];

    const mcOptions = question.mcOptions ?? [];
    mcIdArray?.forEach((optionIndex) => {
      const option = mcOptions[optionIndex];
      if (option) {
        res.push(getMcOptionLabel(option as McOption));
      }
    });

    return res;
  };

  const getAnswerFromQuestion = (question: Question | TQuestion): QAnswer => {
    const answer: QAnswer = {
      questionIndex: getQuestionIndex(question),
      questionType: null,
      answerType: null,
      val: null,
    };

    answer.questionType = question.questionType;

    switch (question.questionType) {
      case QuestionTypeEnum.MULTIPLE_CHOICE:
      case QuestionTypeEnum.MULTIPLE_SELECT:
        answer.answerType = AnswerTypeEnum.MC_ID_ARRAY;
        answer.val =
          'answers' in question
            ? getValuesFromIDs(question, question.answers?.mcIdArray)
            : [];
        break;

      case QuestionTypeEnum.INTEGER:
      case QuestionTypeEnum.DATE:
      case QuestionTypeEnum.DATETIME:
        answer.answerType = AnswerTypeEnum.NUM;
        answer.val =
          'answers' in question ? (question.answers?.number ?? null) : null;
        break;

      case QuestionTypeEnum.STRING:
        answer.answerType = AnswerTypeEnum.TEXT;
        answer.val =
          'answers' in question ? (question.answers?.text ?? null) : null;
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

  const buildAnswersFromQuestions = (
    nextQuestions: Question[] | TQuestion[]
  ): QAnswer[] =>
    nextQuestions.map((question) => getAnswerFromQuestion(question));

  useEffect(() => {
    if (!questions || questions.length === 0) {
      setAnswers([]);
      return;
    }

    const nextAnswers: QAnswer[] = buildAnswersFromQuestions(questions);
    updateQuestionsConditionHidden(questions, nextAnswers);
    setAnswers(nextAnswers);
  }, [questions]);

  function updateAnswersByValue(index: number, newValue: any) {
    setAnswers((previousAnswers) => {
      const nextAnswers = [
        ...(previousAnswers.length > 0
          ? previousAnswers
          : buildAnswersFromQuestions(questions)),
      ];
      nextAnswers.forEach((answer) => {
        if (answer.questionIndex === index) {
          answer.val = newValue;
        }
      });

      updateQuestionsConditionHidden(questions, nextAnswers);
      return nextAnswers;
    });
  }

  useEffect(() => {
    handleAnswers(answers);
  }, [answers, handleAnswers]);

  const updateQuestionsConditionHidden = (
    questions: (Question | TQuestion)[],
    answers: QAnswer[]
  ) => {
    questions.forEach((question) => {
      const visibleCondition = question.visibleCondition ?? [];

      (question as Question).shouldHidden =
        visibleCondition.length !== 0 &&
        visibleCondition.some((condition: QCondition) => {
          const parentQuestion = getQuestionByIndex(condition.questionIndex);
          if (!parentQuestion) {
            return true;
          }

          const parentAnswer = answers.find(
            (answer) =>
              answer.questionIndex === getQuestionIndex(parentQuestion)
          );

          if (
            !parentAnswer ||
            parentAnswer.val === undefined ||
            parentAnswer.val === null ||
            parentAnswer.val === '' ||
            (Array.isArray(parentAnswer.val) && parentAnswer.val.length === 0)
          ) {
            return true;
          }

          let isConditionMet = true;
          switch (parentQuestion.questionType) {
            // TODO: This does not work. The multiple choice and multiple select questions do not save properly in the QCondition object type
            case QuestionTypeEnum.MULTIPLE_CHOICE:
            case QuestionTypeEnum.MULTIPLE_SELECT:
              break;
            case QuestionTypeEnum.STRING:
              switch (condition.relation) {
                case QRelationEnum.EQUAL_TO:
                  isConditionMet =
                    String(parentAnswer.val) === String(condition.answers.text);
                  break;
                case QRelationEnum.SMALLER_THAN:
                  if (!condition.answers.text) {
                    isConditionMet = false;
                    break;
                  }
                  isConditionMet =
                    String(parentAnswer.val) < String(condition.answers.text);
                  break;
                case QRelationEnum.LARGER_THAN:
                  if (!condition.answers.text) {
                    isConditionMet = false;
                    break;
                  }
                  isConditionMet =
                    String(parentAnswer.val) > String(condition.answers.text);
                  break;
                case QRelationEnum.CONTAINS:
                  isConditionMet = String(parentAnswer.val).includes(
                    String(condition.answers.text ?? '')
                  );
                  break;
              }
              break;
            case QuestionTypeEnum.INTEGER:
            case QuestionTypeEnum.DATE:
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
