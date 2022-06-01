export enum FormTemplateField {
  name = 'name',
  category = 'category',
  version = 'version',
  dateCreated = 'dateCreated',
  lastEdited = 'lastEdited',
  id = 'id',
}

export interface IFormTemplate {
  [FormTemplateField.name]: string;
  [FormTemplateField.category]: string;
  [FormTemplateField.version]: string;
  [FormTemplateField.dateCreated]: number;
  [FormTemplateField.lastEdited]: number;
  [FormTemplateField.id]: string;
}
