import * as Yup from 'yup';
import { AssessmentField } from './state';

// Source: https://github.com/jquense/yup/issues/124 // At least one field non-empty
// https://github.com/jaredpalmer/formik/issues/2146#issuecomment-720639988
export const assessmentFormValidationSchema = Yup.object()
  .shape({
    [AssessmentField.investigation]: Yup.string(),
    [AssessmentField.finalDiagnosis]: Yup.string(),
    [AssessmentField.treatment]: Yup.string(),
    [AssessmentField.drugHistory]: Yup.string(),
  })
  .test(
    'atLeastOneRequired',
    'One of first 4 fields required',
    function (values) {
      const isValid = [
        AssessmentField.investigation,
        AssessmentField.finalDiagnosis,
        AssessmentField.treatment,
        AssessmentField.drugHistory,
      ].some((field) => {
        return !!values[field]?.trim();
      });
      if (isValid) {
        return true;
      } else {
        return this.createError({
          path: 'assessmentForm',
          message:
            'At least one of Investigation Results, Final Diagnosis, Treatment / Operation, and Drug History must be entered',
        });
      }
    }
  );
