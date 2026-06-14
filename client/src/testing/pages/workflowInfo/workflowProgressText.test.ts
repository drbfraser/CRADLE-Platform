import { describe, it, expect } from 'vitest';
import {
  StepStatus,
  InstanceStatus,
} from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceDetails,
  InstanceStep,
  PossibleStep,
} from 'src/shared/types/workflow/workflowUiTypes';
import {
  formatWorkflowProgressValue,
  formatWorkflowRemainingStepsText,
  getWorkflowRemainingStepsCount,
  isWorkflowInstanceCompleted,
} from 'src/pages/patient/WorkflowInfo/utils/workflowProgressText';

const activeStep: InstanceStep = {
  id: 'active-step',
  title: 'Active',
  status: StepStatus.ACTIVE,
  completedOn: null,
  workflowTemplateStepId: 't1',
};

const possibleSteps: PossibleStep = {
  id: 'root',
  title: 'Root',
  indent: 0,
  status: StepStatus.COMPLETED,
  shortestPathLength: 3,
  branches: [
    {
      id: 'active-step',
      title: 'Active',
      indent: 1,
      status: StepStatus.ACTIVE,
      shortestPathLength: 2,
      branches: [],
    },
  ],
};

const activeInstance: InstanceDetails = {
  id: 'inst-1',
  studyTitle: 'Test',
  patientName: 'Alice',
  patientId: 'p1',
  status: InstanceStatus.ACTIVE,
  description: '',
  collection: 'PAPAGO',
  version: '1',
  firstCreatedOn: '2025-01-01',
  lastEditedOn: '2025-01-01',
  workflowStartedOn: '2025-01-01',
  workflowStartedBy: 'user',
  steps: [activeStep],
  possibleSteps,
};

describe('workflowProgressText', () => {
  it('detects completed workflow instances', () => {
    expect(isWorkflowInstanceCompleted(activeInstance)).toBe(false);
    expect(
      isWorkflowInstanceCompleted({
        ...activeInstance,
        status: InstanceStatus.COMPLETED,
      })
    ).toBe(true);
  });

  it('formats in-progress progress value with plus suffix', () => {
    const progressInfo = {
      total: 3,
      completed: 1,
      percent: 33,
      estDaysRemaining: 14,
      currentIndex: 0,
    };

    expect(formatWorkflowProgressValue(activeInstance, progressInfo, 2)).toBe(
      '1 / 3+'
    );
  });

  it('formats completed progress value without plus suffix', () => {
    const progressInfo = {
      total: 1,
      completed: 1,
      percent: 100,
      estDaysRemaining: 0,
      currentIndex: 0,
    };

    expect(
      formatWorkflowProgressValue(
        { ...activeInstance, status: InstanceStatus.COMPLETED },
        progressInfo,
        2
      )
    ).toBe('1 / 1');
  });

  it('formats remaining steps caption for active workflows', () => {
    const progressInfo = {
      total: 3,
      completed: 1,
      percent: 33,
      estDaysRemaining: 14,
      currentIndex: 0,
    };

    expect(
      getWorkflowRemainingStepsCount(activeInstance, progressInfo, 2)
    ).toBe(2);
    expect(
      formatWorkflowRemainingStepsText(activeInstance, progressInfo, 2)
    ).toBe('At least 2 more steps remaining');
    expect(
      formatWorkflowRemainingStepsText(activeInstance, progressInfo, 1)
    ).toBe('At least 1 more step remaining');
  });

  it('formats completed remaining steps caption', () => {
    const progressInfo = {
      total: 1,
      completed: 1,
      percent: 100,
      estDaysRemaining: 0,
      currentIndex: 0,
    };

    expect(
      formatWorkflowRemainingStepsText(
        { ...activeInstance, status: InstanceStatus.COMPLETED },
        progressInfo,
        2
      )
    ).toBe('All steps completed');
  });
});
