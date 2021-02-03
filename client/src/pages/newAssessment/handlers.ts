import { AssessmentState } from './state';

export const handleSubmit = (
  patientId: string,
  assessmentId: string | undefined,
  history: any,
  setSubmitError: (error: boolean) => void
) => {
  return async (values: AssessmentState, { setSubmitting }: any) => {
  }
}