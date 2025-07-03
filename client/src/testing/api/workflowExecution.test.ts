import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  startWorkflowInstanceAsync,
  completeWorkflowStepAsync,
  assignWorkflowStepAsync,
  getNextWorkflowStepsAsync,
  evaluateWorkflowConditionsAsync,
} from '../../shared/api/modules/workflowExecution';
import { axiosFetch } from 'src/shared/api/core/http';

vi.mock('src/shared/api/core/http');
const mockAxios = axiosFetch as any;

describe('Workflow Execution API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startWorkflowInstanceAsync', () => {
    it('should start a new workflow instance', async () => {
      const instanceData = {
        templateId: 'fracture-treatment',
        patientId: 'p001',
        startedBy: 'doctor123',
      };
      const createdInstance = {
        id: 'instance-123',
        ...instanceData,
        status: 'Active',
        steps: [],
      };

      mockAxios.post.mockResolvedValue({ data: createdInstance });

      const result = await startWorkflowInstanceAsync(instanceData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/workflow/execution/start',
        instanceData
      );
      expect(result).toEqual(createdInstance);
    });

    it('should handle invalid template ID', async () => {
      const instanceData = {
        templateId: 'invalid-template',
        patientId: 'p001',
        startedBy: 'doctor123',
      };

      mockAxios.post.mockRejectedValue(new Error('Template not found'));

      await expect(startWorkflowInstanceAsync(instanceData)).rejects.toThrow(
        'Template not found'
      );
    });
  });

  describe('completeWorkflowStepAsync', () => {
    it('should complete a workflow step and return next step', async () => {
      const stepData = {
        instanceId: 'instance-123',
        stepId: 'diagnosis-step',
        completedBy: 'doctor123',
        formId: 'form-456',
      };
      const completionResult = {
        instance: { id: 'instance-123', status: 'Active' },
        nextStep: { id: 'radiology-step', name: 'Radiology Review' },
        activatedBranches: [],
      };

      mockAxios.post.mockResolvedValue({ data: completionResult });

      const result = await completeWorkflowStepAsync(stepData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/workflow/execution/complete-step',
        stepData
      );
      expect(result).toEqual(completionResult);
    });

    it('should handle conditional branching', async () => {
      const stepData = {
        instanceId: 'instance-123',
        stepId: 'diagnosis-step',
        completedBy: 'doctor123',
        data: { surgeryRequired: true },
      };
      const completionResult = {
        instance: { id: 'instance-123', status: 'Active' },
        nextStep: { id: 'surgery-step', name: 'Surgery Preparation' },
        activatedBranches: [{ targetStepId: 'surgery-step' }],
      };

      mockAxios.post.mockResolvedValue({ data: completionResult });

      const result = await completeWorkflowStepAsync(stepData);

      expect(result.nextStep?.id).toBe('surgery-step');
      expect(result.activatedBranches).toHaveLength(1);
    });
  });

  describe('assignWorkflowStepAsync', () => {
    it('should assign a step to a user', async () => {
      const assignmentData = {
        instanceId: 'instance-123',
        stepId: 'radiology-step',
        assignedTo: 'radiologist456',
        assignedBy: 'doctor123',
        note: 'Urgent review needed',
      };
      const assignedStep = {
        id: 'radiology-step',
        assignedTo: 'radiologist456',
        status: 'Active',
      };

      mockAxios.post.mockResolvedValue({ data: assignedStep });

      const result = await assignWorkflowStepAsync(assignmentData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/workflow/execution/assign-step',
        assignmentData
      );
      expect(result).toEqual(assignedStep);
    });
  });

  describe('getNextWorkflowStepsAsync', () => {
    it('should get possible next steps for instance', async () => {
      const nextStepsData = {
        currentStep: { id: 'diagnosis-step', name: 'Initial Diagnosis' },
        possibleNextSteps: [
          { id: 'surgery-step', name: 'Surgery' },
          { id: 'conservative-step', name: 'Conservative Treatment' },
        ],
        requiresDecision: true,
      };

      mockAxios.get.mockResolvedValue({ data: nextStepsData });

      const result = await getNextWorkflowStepsAsync('instance-123');

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/workflow/execution/next-steps/instance-123'
      );
      expect(result).toEqual(nextStepsData);
      expect(result.possibleNextSteps).toHaveLength(2);
    });
  });

  describe('evaluateWorkflowConditionsAsync', () => {
    it('should evaluate workflow conditions', async () => {
      const conditionData = {
        instanceId: 'instance-123',
        stepId: 'diagnosis-step',
        formData: { surgeryRequired: true, fractureType: 'compound' },
      };
      const evaluationResult = {
        nextSteps: ['surgery-step'],
        branchResults: [
          {
            branchId: 'branch1',
            condition: true,
            targetStepId: 'surgery-step',
          },
          {
            branchId: 'branch2',
            condition: false,
            targetStepId: 'conservative-step',
          },
        ],
      };

      mockAxios.post.mockResolvedValue({ data: evaluationResult });

      const result = await evaluateWorkflowConditionsAsync(conditionData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/workflow/execution/evaluate-conditions',
        conditionData
      );
      expect(result).toEqual(evaluationResult);
      expect(result.nextSteps).toContain('surgery-step');
    });
  });
});
