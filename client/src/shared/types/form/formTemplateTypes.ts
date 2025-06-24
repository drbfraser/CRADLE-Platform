import { QuestionTypeEnum } from 'src/shared/enums';
import { OrNull } from '../types';
import { QuestionLangVersion, QCondition } from './formTypes';

export interface IFormClassification {
  id: string | undefined;
  name: string;
}

export interface FormTemplate {
  classification: IFormClassification;
  dateCreated: number;
  category: string;
  id: string;
  version: string;
  archived: boolean;
}

export interface FormTemplateWithQuestions {
  classification: IFormClassification;
  version: string;
  questions: TQuestion[];
}

//TQuestion will be only used in template
// with * options will be used in creating template
export interface TQuestion {
  categoryIndex: OrNull<number>;
  id: string | undefined;
  langVersions: QuestionLangVersion[];
  questionIndex: number;
  questionType: QuestionTypeEnum;
  required: boolean;
  allowPastDates: boolean;
  allowFutureDates: boolean;
  numMin?: OrNull<number>;
  numMax?: OrNull<number>;
  stringMaxLength?: OrNull<number>;
  stringMaxLines?: OrNull<number>;
  units?: OrNull<string>;
  visibleCondition: QCondition[];
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
