import { IFormClassification } from 'src/shared/types';

export enum FormTemplateField {
  classification = 'classification',
  version = 'version',
  dateCreated = 'dateCreated',
  id = 'id',
  archived = 'archived',
}

export interface IFormTemplate {
  [FormTemplateField.classification]: IFormClassification;
  [FormTemplateField.version]: string;
  [FormTemplateField.dateCreated]: number;
  [FormTemplateField.id]: string;
  [FormTemplateField.archived]: boolean;
}
