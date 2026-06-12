import { describe, it, expect } from 'vitest';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import { InstanceStep } from 'src/shared/types/workflow/workflowUiTypes';
import { formatWorkflowStepStatusText } from 'src/pages/patient/WorkflowInfo/utils/formatters';

const baseStep: InstanceStep = {
  id: 'step-1',
  title: 'Test Step',
  status: StepStatus.PENDING,
  workflowTemplateStepId: 'template-step-1',
};

describe('formatWorkflowStepStatusText', () => {
  it('returns completed text when step is completed', () => {
    const step: InstanceStep = {
      ...baseStep,
      status: StepStatus.COMPLETED,
      completedOn: '2025-01-15',
    };

    expect(formatWorkflowStepStatusText(step)).toContain('Status: Completed');
    expect(formatWorkflowStepStatusText(step)).toContain('Completed on:');
  });

  it('returns in-progress text when step is active', () => {
    const step: InstanceStep = {
      ...baseStep,
      status: StepStatus.ACTIVE,
      startedOn: '2025-01-10',
    };

    expect(formatWorkflowStepStatusText(step)).toContain('Status: In Progress');
    expect(formatWorkflowStepStatusText(step)).toContain('Started on:');
  });

  it('returns in-progress text without started date when missing', () => {
    const step: InstanceStep = { ...baseStep, status: StepStatus.ACTIVE };

    expect(formatWorkflowStepStatusText(step)).toBe('Status: In Progress');
  });

  it('returns possible future step for pending steps', () => {
    expect(formatWorkflowStepStatusText(baseStep)).toBe(
      'Status: Possible future step'
    );
  });
});
