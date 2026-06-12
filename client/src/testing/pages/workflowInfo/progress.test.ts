import { describe, it, expect } from 'vitest';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceDetails,
  InstanceStep,
  PossibleStep,
} from 'src/shared/types/workflow/workflowUiTypes';
import {
  parseYMD,
  daysBetween,
  computeProgressAndEta,
  getWorkflowShortestPath,
} from 'src/pages/patient/WorkflowInfo/utils/progress';

describe('parseYMD', () => {
  it('parses valid Y-M-D strings', () => {
    expect(parseYMD('2025-06-10')?.getFullYear()).toBe(2025);
    expect(parseYMD('2025-06-10')?.getMonth()).toBe(5);
    expect(parseYMD('2025-06-10')?.getDate()).toBe(10);
  });

  it('returns undefined for invalid or empty input', () => {
    expect(parseYMD(undefined)).toBeUndefined();
    expect(parseYMD('not-a-date')).toBeUndefined();
  });
});

describe('daysBetween', () => {
  it('returns absolute day difference', () => {
    const a = new Date(2025, 0, 1);
    const b = new Date(2025, 0, 8);
    expect(daysBetween(a, b)).toBe(7);
    expect(daysBetween(b, a)).toBe(7);
  });
});

describe('computeProgressAndEta', () => {
  const steps: InstanceStep[] = [
    {
      id: 's1',
      title: 'Step 1',
      status: StepStatus.COMPLETED,
      startedOn: '2025-01-01',
      completedOn: '2025-01-08',
      workflowTemplateStepId: 't1',
    },
    {
      id: 's2',
      title: 'Step 2',
      status: StepStatus.ACTIVE,
      workflowTemplateStepId: 't2',
    },
  ];

  it('counts completed steps and finds current index', () => {
    const result = computeProgressAndEta(steps, new Date('2025-01-15'));

    expect(result.completed).toBe(1);
    expect(result.total).toBe(2);
    expect(result.currentIndex).toBe(1);
    expect(result.percent).toBe(50);
  });

  it('uses 7-day fallback when no completed durations exist', () => {
    const pendingSteps: InstanceStep[] = [
      {
        id: 's1',
        title: 'S1',
        status: StepStatus.ACTIVE,
        workflowTemplateStepId: 't1',
      },
    ];
    const result = computeProgressAndEta(pendingSteps, new Date('2025-01-01'));

    expect(result.estDaysRemaining).toBe(7);
    expect(result.etaDate).toBeDefined();
  });

  it('returns zero remaining days when all steps are completed', () => {
    const completedSteps: InstanceStep[] = [
      {
        id: 's1',
        title: 'S1',
        status: StepStatus.COMPLETED,
        startedOn: '2025-01-01',
        completedOn: '2025-01-08',
        workflowTemplateStepId: 't1',
      },
    ];
    const result = computeProgressAndEta(completedSteps);

    expect(result.estDaysRemaining).toBe(0);
    expect(result.etaDate).toBeUndefined();
  });
});

describe('getWorkflowShortestPath', () => {
  const activeStep: InstanceStep = {
    id: 'active-step',
    title: 'Active',
    status: StepStatus.ACTIVE,
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

  const instance: InstanceDetails = {
    id: 'inst-1',
    studyTitle: 'Test',
    patientName: 'Alice',
    patientId: 'p1',
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

  it('returns shortest path length for active step', () => {
    expect(getWorkflowShortestPath(instance)).toBe(2);
  });

  it('returns Infinity when no active step', () => {
    expect(
      getWorkflowShortestPath({
        ...instance,
        steps: [
          {
            ...activeStep,
            status: StepStatus.COMPLETED,
            completedOn: '2025-01-01',
          },
        ],
      })
    ).toBe(Infinity);
  });
});
