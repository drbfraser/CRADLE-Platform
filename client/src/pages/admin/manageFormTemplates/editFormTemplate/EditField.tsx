import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  CancelButton,
  PrimaryButton,
} from '../../../../shared/components/Button';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction } from 'react';
import {
  FormTemplateWithQuestionsV2,
  TQuestion,
} from 'src/shared/types/form/formTemplateTypes';
import { useEditField } from 'src/shared/hooks/forms/useEditField';
import { getFieldTypeEntry } from './fieldTypeRegistry';
import { applyFieldSave } from './fieldEditors/applyFieldSave';
import { EditFieldFormBody } from './fieldEditors/EditFieldFormBody';

interface IProps {
  open: boolean;
  onClose: () => void;
  inputLanguages: string[];
  setForm?: Dispatch<SetStateAction<FormTemplateWithQuestionsV2>>;
  question?: TQuestion;
  questionsArr: TQuestion[];
  visibilityDisabled: boolean;
  visibilityToggle: boolean;
  setVisibilityToggle: Dispatch<SetStateAction<boolean>>;
  categoryIndex: number | null;
}

const EditField = ({
  open,
  onClose,
  inputLanguages,
  setForm,
  question,
  questionsArr,
  visibilityDisabled,
  visibilityToggle,
  setVisibilityToggle,
  categoryIndex,
}: IProps) => {
  const hook = useEditField({
    question,
    visibilityToggle,
    setForm,
    open,
    setVisibilityToggle,
    categoryIndex,
    questionsArr,
    inputLanguages,
  });

  const selectedFieldType = getFieldTypeEntry(hook.fieldType);
  const FieldEditor = selectedFieldType?.Editor ?? null;

  const handleSave = () => {
    if (setForm && selectedFieldType) {
      applyFieldSave({
        setForm,
        hook,
        question,
        categoryIndex,
        visibilityToggle,
        selectedFieldType,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5">
          {question ? 'Edit Field' : 'Create Field'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <EditFieldFormBody
          hook={hook}
          inputLanguages={inputLanguages}
          question={question}
          questionsArr={questionsArr}
          visibilityDisabled={visibilityDisabled}
          visibilityToggle={visibilityToggle}
          setVisibilityToggle={setVisibilityToggle}
          FieldEditor={FieldEditor}
        />
      </DialogContent>
      <DialogActions>
        <CancelButton
          type="button"
          onClick={() => {
            hook.setFormDirty(false);
            hook.setNumChoices(0);
            setVisibilityToggle(false);
            onClose();
          }}>
          Cancel
        </CancelButton>
        <PrimaryButton
          type="submit"
          disabled={hook.isSaveDisabled || hook.validationError !== null}
          onClick={handleSave}>
          Save
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditField;
