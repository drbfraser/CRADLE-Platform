import { QuestionTypeEnum } from 'src/shared/enums';
import { OrNull } from '../types';
import { QCondition } from './formTypes';

export interface IFormClassificationV2 {
  id?: string;
  name: Record<string, string>;
  nameStringId?: string;
}

// TODO: delete this type once forms v2 are integrated fully
export interface IFormClassification {
  id: string | undefined;
  name: string;
}

export interface FormTemplates {
  templates: FormTemplateList[];
}

export interface FormTemplateList {
  archived: boolean;
  name: string;
  dateCreated: number;
  id: string;
  version: number;
  classification?: IFormClassification;
}

export interface FormTemplate {
  archived: boolean;
  classification: IFormClassification;
  dateCreated: number;
  id: string;
  version: string;
}

export interface FormTemplateWithQuestionsV2 {
  id?: string | undefined;
  classification: IFormClassificationV2;
  version: number;
  questions: TQuestion[];
}

// TODO: delete this type once forms v2 are integrated fully
export interface FormTemplateWithQuestions {
  id?: string | undefined;
  classification: IFormClassification;
  version: string;
  questions: TQuestion[];
}

export interface McOption {
  stringId?: string;
  translations: Record<string, string>;
}

//TQuestion will be only used in template
// with * options will be used in creating template
export interface TQuestion {
  allowPastDates: boolean;
  allowFutureDates: boolean;
  categoryIndex: OrNull<number>;
  formTemplateId?: string;
  hasCommentAttached: boolean;
  id: string | undefined;
  order: number;
  questionStringId: string | undefined;
  questionText: Record<string, string>;
  questionType: QuestionTypeEnum;
  required: boolean;
  userQuestionId: string | undefined;
  numMin?: OrNull<number>;
  numMax?: OrNull<number>;
  stringMaxLength?: OrNull<number>;
  stringMaxLines?: OrNull<number>;
  units?: OrNull<string>;
  visibleCondition: QCondition[] | [];
  mcOptions?: McOption[] | [];
}

export type CustomizedForm = {
  id: number;
  patientId: string;
  formTemplateId: number;
  classification: IFormClassification;
  dateCreated: number;
  lastEdited: number;
  lastEditedBy: number;
  category: string;
  name: string;
};
