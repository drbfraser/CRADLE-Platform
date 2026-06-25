import Grid from '@mui/material/Grid';
import { Form, Formik } from 'formik';
import { Dispatch, SetStateAction } from 'react';
import { FormQuestions } from 'src/pages/customizedForm/components/FormQuestions';
import { FormRenderStateEnum } from 'src/shared/enums';
import { QCondition } from 'src/shared/types/form/formTypes';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';
import { initialState, validationSchema } from '../../../customizedForm/state';
import {
  VisibilityQuestionSelect,
  VisibilityRelationSelect,
} from './VisibilityConditionSelectors';
import { useVisibleConditionState } from './useVisibleConditionState';
import { mapVisibilityAnswer } from './visibilityAnswerMapper';

interface IProps {
  currVisCond?: QCondition;
  disabled: boolean;
  filteredQs: TQuestion[];
  setVisibleCondition: Dispatch<SetStateAction<QCondition[]>>;
  setIsVisCondAnswered: Dispatch<SetStateAction<boolean>>;
  setFieldChanged: Dispatch<SetStateAction<boolean>>;
}

const EditVisibleCondition = ({
  currVisCond,
  disabled,
  filteredQs,
  setVisibleCondition,
  setIsVisCondAnswered,
  setFieldChanged,
}: IProps) => {
  const state = useVisibleConditionState({
    currVisCond,
    filteredQs,
    setVisibleCondition,
    setIsVisCondAnswered,
    setFieldChanged,
  });

  if (filteredQs.length === 0) {
    return null;
  }

  return (
    <Formik
      initialValues={initialState as Record<string, unknown>}
      validationSchema={validationSchema}
      onSubmit={() => undefined}>
      {() => (
        <Form>
          <Grid container spacing={3}>
            <VisibilityQuestionSelect
              disabled={disabled}
              selectedQIndex={state.selectedQIndex}
              filteredQs={filteredQs}
              currentLanguage={state.currentLanguage}
              onChange={(event) =>
                state.handleQuestionChange(event.target.value)
              }
            />
            <VisibilityRelationSelect
              disabled={disabled}
              selectedConditional={state.selectedConditional}
              onChange={(event) =>
                state.handleConditionChange(
                  event.target.value as typeof state.selectedConditional
                )
              }
            />
            <Grid item xs={4}>
              {FormQuestions({
                questions: state.question,
                renderState: disabled
                  ? FormRenderStateEnum.VIS_COND_DISABLED
                  : FormRenderStateEnum.VIS_COND,
                language: state.currentLanguage,
                handleAnswers: (answers) => {
                  const answer = answers[0];
                  if (!answer) return;

                  const mapped = mapVisibilityAnswer(
                    answer,
                    filteredQs[+state.selectedQIndex]
                  );
                  if (mapped) {
                    state.setSelectedAnswer(mapped);
                  }
                },
              })}
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default EditVisibleCondition;
