import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { QRelationEnum, QuestionTypeEnum } from 'src/shared/enums';
import { QCondition, Answer } from 'src/shared/types/form/formTypes';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';

type UseVisibleConditionStateOptions = {
  currVisCond?: QCondition;
  filteredQs: TQuestion[];
  setVisibleCondition: Dispatch<SetStateAction<QCondition[]>>;
  setIsVisCondAnswered: Dispatch<SetStateAction<boolean>>;
  setFieldChanged: Dispatch<SetStateAction<boolean>>;
};

export const useVisibleConditionState = ({
  currVisCond,
  filteredQs,
  setVisibleCondition,
  setIsVisCondAnswered,
  setFieldChanged,
}: UseVisibleConditionStateOptions) => {
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

  const [selectedAnswer, setSelectedAnswer] = useState<Answer | undefined>(
    currVisCond ? currVisCond.answers : undefined
  );

  const currentLanguage =
    filteredQs.length > 0
      ? Object.keys(filteredQs[0].questionText)[0] || 'english'
      : 'english';

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
  }, [selectedAnswer, setFieldChanged]);

  useEffect(() => {
    if (
      selectedQIndex !== null &&
      selectedConditional !== null &&
      selectedAnswer !== undefined
    ) {
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
  }, [
    selectedQIndex,
    selectedConditional,
    selectedAnswer,
    filteredQs,
    setIsVisCondAnswered,
    setVisibleCondition,
  ]);

  useEffect(() => {
    if (selectedQIndex === '' || filteredQs.length === 0) return;

    const selectedQuestion = filteredQs[+selectedQIndex];
    if (!selectedQuestion) return;

    setQuestion([
      {
        ...selectedQuestion,
        questionText: selectedQuestion.questionText,
        mcOptions: selectedQuestion.mcOptions || [],
        order: 0,
      },
    ]);
  }, [selectedQIndex, filteredQs]);

  const handleQuestionChange = (value: string) => {
    setFieldChanged((bool) => !bool);
    setSelectedQIndex(value);
    setSelectedAnswer(undefined);
  };

  const handleConditionChange = (value: QRelationEnum) => {
    setFieldChanged((bool) => !bool);
    setSelectedConditional(value);
  };

  return {
    selectedQIndex,
    selectedConditional,
    selectedAnswer,
    setSelectedAnswer,
    currentLanguage,
    question,
    handleQuestionChange,
    handleConditionChange,
  };
};
