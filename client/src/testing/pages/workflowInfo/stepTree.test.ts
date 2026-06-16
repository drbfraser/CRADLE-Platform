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
  getWorkflowStepHistory,
  getWorkflowCurrentStep,
  getWorkflowPossibleStepsLength,
  getWorkflowPossibleSteps,
  initiateWorkflowPossibleSteps,
} from 'src/pages/patient/WorkflowInfo/utils/stepTree';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import { Patient } from 'src/shared/types/patientTypes';
import { buildInstanceDetails } from 'src/pages/patient/WorkflowInfo/utils';
import {
  WORKFLOW_INSTANCE_TEST_DATA,
  WORKFLOW_TEMPLATE_TEST_DATA,
} from '../../testData';

const buildTestInstance = () =>
  buildInstanceDetails(
    WORKFLOW_INSTANCE_TEST_DATA.instances[0],
    WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0],
    { name: 'Alice' } as Patient
  );

describe('getWorkflowCurrentStep', () => {
  it('returns the active step', () => {
    const instance = buildTestInstance();
    const current = getWorkflowCurrentStep(instance);

    expect(current).toBeDefined();
    expect(current?.status).toBe(StepStatus.ACTIVE);
  });

  it('returns undefined when no step is active', () => {
    const instance = buildTestInstance();
    instance.steps = instance.steps.map((step) => ({
      ...step,
      status: StepStatus.COMPLETED,
      completedOn: step.completedOn ?? '2025-01-01',
    }));

    expect(getWorkflowCurrentStep(instance)).toBeUndefined();
  });
});

describe('getWorkflowStepHistory', () => {
  it('puts active steps before completed steps', () => {
    const instance: InstanceDetails = {
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
      steps: [
        {
          id: 'completed-old',
          title: 'Old',
          status: StepStatus.COMPLETED,
          completedOn: '2025-01-01',
          workflowTemplateStepId: 't1',
        },
        {
          id: 'completed-new',
          title: 'New',
          status: StepStatus.COMPLETED,
          completedOn: '2025-01-10',
          workflowTemplateStepId: 't2',
        },
        {
          id: 'active',
          title: 'Active',
          status: StepStatus.ACTIVE,
          completedOn: null,
          workflowTemplateStepId: 't3',
        },
      ],
      possibleSteps: {
        id: 'root',
        title: 'Root',
        indent: 0,
        status: StepStatus.ACTIVE,
        shortestPathLength: 1,
        branches: [],
      },
    };

    const history = getWorkflowStepHistory(instance);

    expect(history[0].id).toBe('active');
    expect(history[1].id).toBe('completed-new');
    expect(history[2].id).toBe('completed-old');
  });
});

describe('getWorkflowPossibleStepsLength', () => {
  it('counts only pending steps', () => {
    const steps: InstanceStep[] = [
      {
        id: 's1',
        title: 'S1',
        status: StepStatus.COMPLETED,
        completedOn: '2025-01-01',
        workflowTemplateStepId: 't1',
      },
      {
        id: 's2',
        title: 'S2',
        status: StepStatus.ACTIVE,
        workflowTemplateStepId: 't2',
      },
      {
        id: 's3',
        title: 'S3',
        status: StepStatus.PENDING,
        workflowTemplateStepId: 't3',
      },
      {
        id: 's4',
        title: 'S4',
        status: StepStatus.PENDING,
        workflowTemplateStepId: 't4',
      },
    ];

    const instance = buildTestInstance();
    instance.steps = steps;

    expect(getWorkflowPossibleStepsLength(instance)).toBe(2);
  });
});

describe('getWorkflowPossibleSteps', () => {
  it('returns flattened pending steps when an active step exists', () => {
    const activeStep: InstanceStep = {
      id: 'active',
      title: 'Active',
      status: StepStatus.ACTIVE,
      completedOn: null,
      workflowTemplateStepId: 't1',
    };

    const pendingStep: PossibleStep = {
      id: 'pending',
      title: 'Pending',
      indent: 1,
      status: StepStatus.PENDING,
      shortestPathLength: 1,
      branches: [],
    };

    const instance = buildTestInstance();
    instance.steps = [activeStep];
    instance.possibleSteps = {
      id: 'active',
      title: 'Active',
      indent: 0,
      status: StepStatus.ACTIVE,
      shortestPathLength: 2,
      branches: [pendingStep],
    };

    const possible = getWorkflowPossibleSteps(instance);

    expect(possible.some((step) => step.id === 'pending')).toBe(true);
  });

  it('returns empty array when no active step exists', () => {
    const instance = buildTestInstance();
    instance.steps = instance.steps.map((step) => ({
      ...step,
      status: StepStatus.COMPLETED,
      completedOn: step.completedOn ?? '2025-01-01',
    }));

    expect(getWorkflowPossibleSteps(instance)).toEqual([]);
  });
});

describe('initiateWorkflowPossibleSteps', () => {
  const cyclicTemplate: WorkflowTemplate = {
    id: 'cyclic-template',
    description: 'Template with A -> B -> A cycle',
    version: '1',
    archived: false,
    dateCreated: 1741373694,
    lastEdited: 1741373694,
    lastEditedBy: 'user-1',
    startingStepId: 'template-a',
    steps: [
      {
        id: 'template-a',
        name: 'Step A',
        description: 'Step A',
        lastEdited: 1741373694,
        branches: [
          {
            stepId: 'template-a',
            targetStepId: 'template-b',
          },
        ],
      },
      {
        id: 'template-b',
        name: 'Step B',
        description: 'Step B',
        lastEdited: 1741373694,
        branches: [
          {
            stepId: 'template-b',
            targetStepId: 'template-a',
          },
        ],
      },
    ],
  };

  const cyclicInstanceSteps: InstanceStep[] = [
    {
      id: 'instance-a',
      title: 'Step A',
      status: StepStatus.ACTIVE,
      workflowTemplateStepId: 'template-a',
    },
    {
      id: 'instance-b',
      title: 'Step B',
      status: StepStatus.PENDING,
      workflowTemplateStepId: 'template-b',
    },
  ];

  it('handles cyclic templates without infinite recursion', () => {
    const root = initiateWorkflowPossibleSteps(
      cyclicInstanceSteps,
      cyclicTemplate
    );

    expect(root.id).toBe('instance-a');
    expect(root.branches).toHaveLength(1);

    const stepB = root.branches[0];
    expect(stepB.id).toBe('instance-b');
    expect(stepB.branches).toHaveLength(1);

    const cycleNode = stepB.branches[0];
    expect(cycleNode.id).toBe('instance-a');
    expect(cycleNode.shortestPathLength).toBe(Infinity);
    expect(cycleNode.branches).toHaveLength(0);

    // Cycle guard should cap the tree at 3 nodes (A -> B -> A), not grow further.
    const countNodes = (node: PossibleStep): number =>
      1 + node.branches.reduce((sum, branch) => sum + countNodes(branch), 0);

    expect(countNodes(root)).toBe(3);
  });
});
