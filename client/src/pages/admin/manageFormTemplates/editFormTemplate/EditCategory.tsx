import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material';
import {
  CancelButton,
  PrimaryButton,
} from '../../../../shared/components/Button';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { QCondition } from 'src/shared/types/form/formTypes';
import {
  FormTemplateWithQuestionsV2,
  TQuestion,
} from 'src/shared/types/form/formTemplateTypes';
import { CategoryNameFields } from './CategoryNameFields';
import { CategoryVisibilitySection } from './CategoryVisibilitySection';
import { applyCategorySave } from './categorySave';

interface IProps {
  open: boolean;
  onClose: () => void;
  visibilityDisabled: boolean;
  inputLanguages: string[];
  setForm?: Dispatch<SetStateAction<FormTemplateWithQuestionsV2>>;
  question?: TQuestion;
  questionsArr: TQuestion[];
  visibilityToggle: boolean;
  categoryIndex: number | null;
}

const EditCategory = ({
  open,
  onClose,
  visibilityDisabled,
  inputLanguages,
  setForm,
  question,
  questionsArr,
  visibilityToggle,
  categoryIndex,
}: IProps) => {
  const [questionText, setQuestionText] = useState<Record<string, string>>({});
  const [fieldChanged, setFieldChanged] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [visibleCondition, setVisibleCondition] = useState<QCondition[]>([]);
  const [enableVisibility, setEnableVisiblity] = useState(visibilityToggle);
  const [isVisCondAnswered, setIsVisCondAnswered] = useState(!visibilityToggle);
  const [areAllFieldsFilled, setAreAllFieldsFilled] = useState(true);

  useEffect(() => {
    if (formDirty) {
      setEnableVisiblity(enableVisibility);
    } else if (question) {
      if (question.questionText && typeof question.questionText === 'object') {
        setQuestionText(question.questionText as Record<string, string>);
      }
      setEnableVisiblity(
        enableVisibility || question.visibleCondition.length > 0
      );
    } else {
      setQuestionText({});
      setEnableVisiblity(false);
    }
    setAreAllFieldsFilled(
      inputLanguages.every((lang) => {
        const text = questionText[lang.toLowerCase()];
        return typeof text === 'string' && text.trim().length > 0;
      })
    );
  }, [open, setForm, fieldChanged]);

  useEffect(() => {
    setIsVisCondAnswered(!enableVisibility);
  }, [enableVisibility]);

  const handleNameChange = (language: string, value: string) => {
    setQuestionText((prev) => ({
      ...prev,
      [language.toLowerCase()]: value,
    }));
    setFieldChanged(!fieldChanged);
    setFormDirty(true);
  };

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5">
          {question ? 'Edit Category' : 'Create Category'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} mt={1}>
          <CategoryNameFields
            inputLanguages={inputLanguages}
            questionText={questionText}
            onNameChange={handleNameChange}
          />
          <CategoryVisibilitySection
            question={question}
            questionsArr={questionsArr}
            visibilityDisabled={visibilityDisabled}
            enableVisibility={enableVisibility}
            setEnableVisibility={setEnableVisiblity}
            setVisibleCondition={setVisibleCondition}
            setIsVisCondAnswered={setIsVisCondAnswered}
            setFormDirty={setFormDirty}
            setFieldChanged={setFieldChanged}
            fieldChanged={fieldChanged}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <CancelButton
          type="button"
          onClick={() => {
            setFormDirty(false);
            setEnableVisiblity(false);
            onClose();
          }}>
          Cancel
        </CancelButton>
        <PrimaryButton
          type="submit"
          disabled={!isVisCondAnswered || !areAllFieldsFilled}
          onClick={() => {
            if (setForm) {
              setForm((form) =>
                applyCategorySave({
                  form,
                  question,
                  questionText,
                  enableVisibility,
                  visibleCondition,
                  categoryIndex,
                })
              );
              setVisibleCondition([]);
              setFormDirty(false);
            }
            onClose();
          }}>
          Save
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditCategory;
