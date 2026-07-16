import {
  WorkflowVariable,
  getWorkflowVariables,
  getFormTemplateAsyncV2,
} from 'src/shared/api';
import { QuestionTypeEnum } from 'src/shared/enums';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';

const QUESTION_TYPE_TO_VAR_TYPE: Partial<
  Record<QuestionTypeEnum, WorkflowVariable['type']>
> = {
  [QuestionTypeEnum.INTEGER]: 'integer',
  [QuestionTypeEnum.DECIMAL]: 'double',
  [QuestionTypeEnum.STRING]: 'string',
  [QuestionTypeEnum.MULTIPLE_CHOICE]: 'string',
  [QuestionTypeEnum.DATE]: 'date',
  [QuestionTypeEnum.DATETIME]: 'date',
};

export function questionToWorkflowVariable(q: TQuestion): WorkflowVariable {
  const englishText =
    q.questionText['English'] ?? Object.values(q.questionText)[0] ?? '';
  return {
    tag: `forms[latest].${q.userQuestionId}`,
    description: englishText,
    type: QUESTION_TYPE_TO_VAR_TYPE[q.questionType]!,
    namespace: 'forms',
    collectionName: 'forms',
    isComputed: false,
    isDynamic: true,
  };
}

export function formQuestionsToWorkflowVariables(
  questions: TQuestion[]
): WorkflowVariable[] {
  return questions
    .filter(
      (q) =>
        q.userQuestionId && q.questionType in QUESTION_TYPE_TO_VAR_TYPE
    )
    .map(questionToWorkflowVariable);
}

/**
 * Load the variable catalogue available for a workflow step's condition editor:
 * global workflow variables plus form-question variables for that step's form.
 */
export async function getStepWorkflowVariables(step: {
  formId?: string;
}): Promise<WorkflowVariable[]> {
  const globalVars = await getWorkflowVariables();
  let formVars: WorkflowVariable[] = [];

  if (step.formId) {
    try {
      const template = await getFormTemplateAsyncV2(step.formId);
      formVars = formQuestionsToWorkflowVariables(template.questions);
    } catch {
      // Form fetch failure is non-fatal; editor still works with global vars.
    }
  }

  return [...globalVars, ...formVars];
}
