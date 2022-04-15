import { CustomizedFormState } from './state';
import questions from './form.json';
import { Question } from 'src/shared/types';

export const handleSubmit = (
  patientId: string,
  setSubmitError: (error: boolean) => void,
  setQuestions: (questions: Question[]) => void
) => {
  return async (values: CustomizedFormState, { setSubmitting }: any) => {
    await setQuestions(questions);
  };
};
