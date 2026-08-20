import { ID } from '../../constants';
import { WorkflowTemplateStepBranch } from './workflowApiTypes';

// Editor-only multi-language shapes, mirroring the backend's
// *MultiLangModel Pydantic models (minus the "Model" suffix). Used only by
// the workflow template create/edit editor - view-mode, mobile, and the
// unchanged GET /workflow/templates/<id> endpoint keep using the plain
// WorkflowTemplate/WorkflowTemplateStep/WorkflowClassification types in
// workflowApiTypes.ts.

// language-key (lowercase full language name, e.g. "english", "french") -> text
export type MultiLangText = Record<string, string>;

export interface WorkflowClassificationMultiLang {
  id?: ID;
  name: MultiLangText;
}

export interface WorkflowTemplateStepMultiLang {
  id: ID;
  name: MultiLangText;
  description: MultiLangText;
  formId?: ID;
  expectedCompletion?: number;
  branches?: WorkflowTemplateStepBranch[];
  lastEdited: number | string;
  workflowTemplateId?: ID;
}

export interface WorkflowTemplateMultiLang {
  id: ID;
  description: MultiLangText;
  version: string;

  classificationId?: ID;
  classification?: WorkflowClassificationMultiLang;
  steps: WorkflowTemplateStepMultiLang[];
  startingStepId?: ID;

  archived: boolean;
  hasBranchingIssues: boolean;
  dateCreated: number;
  lastEdited: number;
  lastEditedBy: string;
}

// Payload for POST /workflow/templates/body and PATCH /workflow/templates/<id>
export interface TemplateMultiLangInput {
  description: MultiLangText;
  version?: string;
  archived: boolean;
  startingStepId?: ID;
  classificationId?: ID;
  classification?: { id?: ID; name: MultiLangText } | null;
  steps: WorkflowTemplateStepMultiLang[];
}
