import { useEditField } from 'src/shared/hooks/forms/useEditField';

export type EditFieldHook = ReturnType<typeof useEditField>;

export interface FieldEditorProps {
  hook: EditFieldHook;
  inputLanguages: string[];
}
