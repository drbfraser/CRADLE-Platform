import {
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { Dispatch, SetStateAction } from 'react';
import { QCondition } from 'src/shared/types/form/formTypes';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';
import { QuestionTypeEnum } from 'src/shared/enums';
import EditVisibleCondition from './EditVisibleCondition';
import * as handlers from './multiFieldComponents/handlers';

type CategoryVisibilitySectionProps = {
  question?: TQuestion;
  questionsArr: TQuestion[];
  visibilityDisabled: boolean;
  enableVisibility: boolean;
  setEnableVisibility: Dispatch<SetStateAction<boolean>>;
  setVisibleCondition: Dispatch<SetStateAction<QCondition[]>>;
  setIsVisCondAnswered: Dispatch<SetStateAction<boolean>>;
  setFormDirty: Dispatch<SetStateAction<boolean>>;
  setFieldChanged: Dispatch<SetStateAction<boolean>>;
  fieldChanged: boolean;
};

const isEligibleQuestion = (
  q: TQuestion,
  question: TQuestion | undefined,
  questionsArr: TQuestion[]
) => {
  if (q === question || q.questionType === QuestionTypeEnum.CATEGORY) {
    return false;
  }
  if (question?.questionType !== QuestionTypeEnum.CATEGORY) {
    return true;
  }
  let currCatIndex = q.categoryIndex;
  while (currCatIndex !== null && questionsArr[currCatIndex] !== undefined) {
    if (currCatIndex === question.order) return false;
    currCatIndex = questionsArr[currCatIndex].categoryIndex;
  }
  return true;
};

export const CategoryVisibilitySection = ({
  question,
  questionsArr,
  visibilityDisabled,
  enableVisibility,
  setEnableVisibility,
  setVisibleCondition,
  setIsVisCondAnswered,
  setFormDirty,
  setFieldChanged,
  fieldChanged,
}: CategoryVisibilitySectionProps) => {
  const hasEligibleQuestions = questionsArr.some((q) =>
    isEligibleQuestion(q, question, questionsArr)
  );

  if (!hasEligibleQuestions) {
    return null;
  }

  const filteredQs = questionsArr.filter((q) =>
    isEligibleQuestion(q, question, questionsArr)
  );

  return (
    <>
      <Grid item container sm={12} md={10} lg={10}>
        <FormControlLabel
          style={{ marginLeft: 0 }}
          control={
            <Switch
              checked={enableVisibility}
              disabled={visibilityDisabled}
              onChange={(e) =>
                handlers.handleVisibilityChange(
                  e,
                  setEnableVisibility,
                  setFormDirty,
                  setFieldChanged,
                  fieldChanged
                )
              }
              data-testid="conditional-switch"
            />
          }
          label={
            <FormLabel id="vis-label" style={{ display: 'flex' }}>
              <Typography variant="h6">Conditional Visibility</Typography>
              <Tooltip
                disableFocusListener
                disableTouchListener
                title={
                  visibilityDisabled
                    ? 'Cannot edit if parent category already has a visibility condition'
                    : 'Set this field to only appear after a specific field value is entered'
                }
                arrow
                placement="right">
                <IconButton>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </FormLabel>
          }
          labelPlacement="start"
        />
      </Grid>
      {enableVisibility ? (
        <Grid item sm={12} md={10} lg={10}>
          <EditVisibleCondition
            currVisCond={question?.visibleCondition[0]}
            disabled={visibilityDisabled}
            filteredQs={filteredQs}
            setVisibleCondition={setVisibleCondition}
            setIsVisCondAnswered={setIsVisCondAnswered}
            setFieldChanged={setFieldChanged}
          />
        </Grid>
      ) : null}
    </>
  );
};
