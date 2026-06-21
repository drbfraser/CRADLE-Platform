import { Dispatch, SetStateAction } from 'react';
import { FormRenderStateEnum } from 'src/shared/enums';
import { QAnswer } from 'src/shared/types/form/formTypes';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';

export interface FormQuestionsContext {
  updateAnswersByValue: (index: number, newValue: unknown) => void;
  numberErrors: { [key: number]: string };
  setNumberErrors: Dispatch<SetStateAction<{ [key: number]: string }>>;
  stringMaxLinesError: boolean[];
  setStringMaxLinesError: Dispatch<SetStateAction<boolean[]>>;
  getCurrentDate: () => string;
  isQuestion: (question: TQuestion) => boolean;
}

export interface QuestionFieldProps {
  question: TQuestion;
  answer: QAnswer;
  renderState: FormRenderStateEnum;
  text: string;
  qid: number;
  required: boolean;
  mcOptions?: string[];
  formContext: FormQuestionsContext;
  multiSelectValidationFailed?: boolean;
  setDisableSubmit?: (disableSubmit: boolean) => void;
}
