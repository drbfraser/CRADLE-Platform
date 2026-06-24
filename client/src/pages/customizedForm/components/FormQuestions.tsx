import { FormRenderStateEnum } from 'src/shared/enums';
import { QAnswer } from 'src/shared/types/form/formTypes';
import {
  FormTemplateWithQuestionsV2,
  TQuestion,
} from 'src/shared/types/form/formTemplateTypes';
import { Dispatch, Fragment, SetStateAction } from 'react';
import { useFormQuestions } from 'src/shared/hooks/forms/useFormQuestions';
import {
  createDefaultAnswer,
  getQuestionId,
  resolveLocalizedText,
} from 'src/shared/components/Form/questions/formQuestionUtils';
import { questionFieldRegistry } from 'src/shared/components/Form/questions/questionFieldRegistry';
import { FormQuestionsContext } from 'src/shared/components/Form/questions/types';

interface IProps {
  questions: TQuestion[];
  renderState: FormRenderStateEnum;
  language: string;
  handleAnswers: (answers: QAnswer[]) => void;
  setForm?: Dispatch<SetStateAction<FormTemplateWithQuestionsV2>>;
  multiSelectValidationFailed?: boolean;
  setDisableSubmit?: (disableSubmit: boolean) => void;
}

export const FormQuestions = ({
  questions,
  renderState,
  language,
  handleAnswers,
  multiSelectValidationFailed,
  setDisableSubmit,
}: IProps) => {
  const hook = useFormQuestions(questions, handleAnswers);
  const languageKey = (language || 'English').toLowerCase();

  const formContext: FormQuestionsContext = {
    updateAnswersByValue: hook.updateAnswersByValue,
    numberErrors: hook.numberErrors,
    setNumberErrors: hook.setNumberErrors,
    stringMaxLinesError: hook.stringMaxLinesError,
    setStringMaxLinesError: hook.setStringMaxLinesError,
    getCurrentDate: hook.getCurrentDate,
    isQuestion: hook.isQuestion,
  };

  const renderQuestion = (
    question: TQuestion,
    answer: QAnswer | undefined,
    index: number
  ) => {
    if (hook.isQuestion(question) && !answer) {
      return null;
    }

    const resolvedAnswer = answer ?? createDefaultAnswer(question);
    const type = question.questionType;
    const FieldComponent = questionFieldRegistry[type];

    if (!FieldComponent) {
      console.log('INVALID QUESTION TYPE!!');
      return null;
    }

    const qid = getQuestionId(question, index);
    const text = resolveLocalizedText(
      question.questionText,
      languageKey,
      'Untitled question'
    );
    const mcOptions = question.mcOptions?.map((option) =>
      resolveLocalizedText(option.translations, languageKey)
    );

    return (
      <FieldComponent
        question={question}
        answer={resolvedAnswer}
        renderState={renderState}
        text={text}
        qid={qid}
        required={question.required}
        mcOptions={mcOptions}
        formContext={formContext}
        multiSelectValidationFailed={multiSelectValidationFailed}
        setDisableSubmit={setDisableSubmit}
      />
    );
  };

  return questions.map((question: TQuestion, index) => {
    const qid = getQuestionId(question, index);
    return (
      <Fragment key={qid}>
        {hook.isQuestion(question) && question.shouldHidden
          ? null
          : renderQuestion(question, hook.answers[index], index)}
      </Fragment>
    );
  });
};
