import { ComponentType } from 'react';
import { QuestionTypeEnum } from 'src/shared/enums';
import { CategoryFieldEditor } from './fieldEditors/CategoryFieldEditor';
import { DateFieldEditor } from './fieldEditors/DateFieldEditor';
import { IntegerFieldEditor } from './fieldEditors/IntegerFieldEditor';
import { MultipleChoiceFieldEditor } from './fieldEditors/MultipleChoiceFieldEditor';
import { MultipleSelectFieldEditor } from './fieldEditors/MultipleSelectFieldEditor';
import { StringFieldEditor } from './fieldEditors/StringFieldEditor';
import { FieldEditorProps } from './fieldEditors/types';

export interface FieldTypeEntry {
  value: string;
  label: string;
  type: QuestionTypeEnum;
  Editor: ComponentType<FieldEditorProps>;
}

export const FIELD_TYPE_ENTRIES: FieldTypeEntry[] = [
  {
    value: 'category',
    label: 'Subcategory',
    type: QuestionTypeEnum.CATEGORY,
    Editor: CategoryFieldEditor,
  },
  {
    value: 'number',
    label: 'Number',
    type: QuestionTypeEnum.INTEGER,
    Editor: IntegerFieldEditor,
  },
  {
    value: 'text',
    label: 'Text',
    type: QuestionTypeEnum.STRING,
    Editor: StringFieldEditor,
  },
  {
    value: 'mult_choice',
    label: 'Multiple Choice',
    type: QuestionTypeEnum.MULTIPLE_CHOICE,
    Editor: MultipleChoiceFieldEditor,
  },
  {
    value: 'mult_select',
    label: 'Multi Select',
    type: QuestionTypeEnum.MULTIPLE_SELECT,
    Editor: MultipleSelectFieldEditor,
  },
  {
    value: 'date',
    label: 'Date',
    type: QuestionTypeEnum.DATE,
    Editor: DateFieldEditor,
  },
];

export const getFieldTypeEntry = (fieldType: string) =>
  FIELD_TYPE_ENTRIES.find((entry) => entry.value === fieldType);

export const getFieldTypeByQuestionType = (questionType: QuestionTypeEnum) =>
  FIELD_TYPE_ENTRIES.find((entry) => entry.type === questionType)?.value ?? '';
