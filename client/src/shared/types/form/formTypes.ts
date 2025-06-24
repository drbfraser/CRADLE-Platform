import { QuestionTypeEnum, AnswerTypeEnum, QRelationEnum } from "src/shared/enums";
import { OrNull } from "../types";


export type Form = {
  formTemplateId: number;
  name: string;
  category: string;
  version: string;
  dateCreated: string;
  lastEdited: string;
};

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

export interface CForm {
  dateCreated: number;
  category: string;
  id: string | undefined; //when doing form creating,from ;
  lastEdited: number;
  version: string | undefined; //when doing form creating,from client-end, this 'version' field needs to be omitted
  name: string;
  lang: string;
  questions: Question[];
  patientId: string | undefined; //this is only used in client when we need to do the 'form creating' net post
}

export type QAnswer = {
  questionIndex: number;
  questionType: QuestionTypeEnum | null;
  answerType: AnswerTypeEnum | null; //value,text,mc,me,comment
  val: any;
};

export interface QCondition {
  questionIndex: number;
  relation: QRelationEnum;
  answers: Answer;
}

export type Answer = {
  number?: number | undefined;
  text?: string | undefined;
  mcIdArray?: number[] | undefined;
  comment?: string | undefined;
};

// Question is used in Form
export type Question = {
  id: string;
  isBlank: boolean;
  questionIndex: number;
  questionText: string;
  questionType: QuestionTypeEnum;
  required: boolean;
  allowFutureDates: boolean;
  allowPastDates: boolean;

  numMin: OrNull<number>;
  numMax: OrNull<number>;
  stringMaxLength?: OrNull<number>;
  stringMaxLines?: OrNull<number>;
  units?: OrNull<string>;

  answers: Answer | undefined;
  visibleCondition: QCondition[];

  formTemplateId: string;
  mcOptions: McOption[]; //only used in form
  hasCommentAttached: boolean;

  shouldHidden?: OrNull<boolean> | undefined;
  dependencies?: OrNull<[]> | undefined;
};

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

export interface QuestionLangVersion {
  lang: string;
  mcOptions: McOption[];
  questionText: string;
}

export type McOption = {
  mcId: number;
  opt: string;
};

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