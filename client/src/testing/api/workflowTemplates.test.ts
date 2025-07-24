import { vi, describe, it, expect, afterEach } from 'vitest';
import { axiosFetch } from 'src/shared/api/core/http';
import { WORKFLOW_TEMPLATE_TEST_DATA } from '../testData';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  listTemplateSteps,
  updateTemplateStep,
  getTemplateWithClassification,
  getTemplateWithSteps,
  getTemplateWithStepsAndClassification,
  createTemplateStep,
  getAllTemplateSteps,
  getTemplateStepById,
  getTemplateStepWithForm,
  updateTemplateStepById,
  deleteTemplateStepById,
  archiveWorkflowTemplateAsync,
  unarchiveWorkflowTemplateAsync,
  saveWorkflowTemplateWithFileAsync,
} from 'src/shared/api/modules/workflowTemplates';

vi.mock('src/shared/api/core/http');

const mockAxios = axiosFetch as any;

describe('workflowTemplates API', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('listTemplates', () => {
    it('should fetch workflow templates with items response format', async () => {
      const mockResponse = {
        items: WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates,
      };
      mockAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await listTemplates();

      expect(mockAxios.get).toHaveBeenCalledWith('/workflow/templates', {
        params: undefined,
      });
      expect(result).toEqual(WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates);
    });

    it('should fetch workflow templates with array response format', async () => {
      const mockResponse = WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates;
      mockAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await listTemplates();

      expect(result).toEqual(WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates);
    });

    it('should handle query parameters', async () => {
      const params = { classificationId: 'classification-1', archived: false };
      const mockResponse = {
        items: [WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0]],
      };
      mockAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await listTemplates(params);

      expect(mockAxios.get).toHaveBeenCalledWith('/workflow/templates', {
        params,
      });
      expect(result).toEqual([
        WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0],
      ]);
    });

    it('should return empty array for invalid response format', async () => {
      mockAxios.get.mockResolvedValue({ data: null });

      const result = await listTemplates();

      expect(result).toEqual([]);
    });
  });

  describe('getTemplate', () => {
    const templateId = 'workflow-template-1';
    const mockTemplate = WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0];

    it('should fetch a single workflow template', async () => {
      mockAxios.get.mockResolvedValue({ data: mockTemplate });

      const result = await getTemplate(templateId);

      expect(mockAxios.get).toHaveBeenCalledWith(
        `/workflow/templates/${templateId}`,
        { params: undefined }
      );
      expect(result).toEqual(mockTemplate);
    });

    it('should fetch template with query parameters', async () => {
      const params = { with_steps: true, with_classification: true };
      mockAxios.get.mockResolvedValue({ data: mockTemplate });

      const result = await getTemplate(templateId, params);

      expect(mockAxios.get).toHaveBeenCalledWith(
        `/workflow/templates/${templateId}`,
        { params }
      );
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('createTemplate', () => {
    it('should create a new workflow template', async () => {
      const templateInput = {
        name: 'New Template',
        description: 'Test template',
        version: 1,
        classificationId: 'classification-1',
        steps: [],
        classification: {
          id: 'classification-1',
          name: 'Test Classification',
        },
      };
      const createdTemplate = {
        ...templateInput,
        id: 'new-template-id',
        archived: false,
        dateCreated: 1741373694,
        lastEdited: 1741373694,
        lastEditedBy: 'user-1',
      };
      mockAxios.post.mockResolvedValue({ data: createdTemplate });

      const result = await createTemplate(templateInput);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/workflow/templates',
        templateInput
      );
      expect(result).toEqual(createdTemplate);
    });
  });

  describe('updateTemplate', () => {
    it('should update an existing workflow template', async () => {
      const templateId = 'workflow-template-1';
      const updatePayload = {
        name: 'Updated Template Name',
        description: 'Updated description',
        version: 2,
        classificationId: 'classification-1',
        steps: [],
        classification: {
          id: 'classification-1',
          name: 'Updated Classification',
        },
      };
      const updatedTemplate = {
        ...WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0],
        ...updatePayload,
      };
      mockAxios.put.mockResolvedValue({ data: updatedTemplate });

      const result = await updateTemplate(templateId, updatePayload);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `/workflow/templates/${templateId}`,
        updatePayload
      );
      expect(result).toEqual(updatedTemplate);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a workflow template', async () => {
      const templateId = 'workflow-template-1';
      mockAxios.delete.mockResolvedValue({});

      await deleteTemplate(templateId);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        `/workflow/templates/${templateId}`
      );
    });
  });

  describe('listTemplateSteps', () => {
    it('should fetch template steps for a workflow template', async () => {
      const templateId = 'workflow-template-1';
      const mockSteps = [
        { id: 'step-1', name: 'Initial Step', workflowTemplateId: templateId },
        { id: 'step-2', name: 'Final Step', workflowTemplateId: templateId },
      ];
      mockAxios.get.mockResolvedValue({ data: { items: mockSteps } });

      const result = await listTemplateSteps(templateId);

      expect(mockAxios.get).toHaveBeenCalledWith(
        `/workflow/templates/${templateId}/steps`
      );
      expect(result).toEqual(mockSteps);
    });
  });

  describe('updateTemplateStep', () => {
    it('should update a template step', async () => {
      const templateId = 'workflow-template-1';
      const stepId = 'step-1';
      const updatePayload = { name: 'Updated Step Name' };
      const updatedStep = {
        id: stepId,
        name: 'Updated Step Name',
        workflowTemplateId: templateId,
      };
      mockAxios.put.mockResolvedValue({ data: updatedStep });

      const result = await updateTemplateStep(
        templateId,
        stepId,
        updatePayload
      );

      expect(mockAxios.put).toHaveBeenCalledWith(
        `/workflow/templates/${templateId}/steps/${stepId}`,
        updatePayload
      );
      expect(result).toEqual(updatedStep);
    });
  });

  describe('convenience functions', () => {
    const templateId = 'workflow-template-1';
    const mockTemplate = WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0];

    it('should fetch template with classification', async () => {
      mockAxios.get.mockResolvedValue({ data: mockTemplate });

      const result = await getTemplateWithClassification(templateId);

      expect(mockAxios.get).toHaveBeenCalledWith(
        `/workflow/templates/${templateId}`,
        {
          params: { with_classification: true },
        }
      );
      expect(result).toEqual(mockTemplate);
    });

    it('should fetch template with steps', async () => {
      mockAxios.get.mockResolvedValue({ data: mockTemplate });

      const result = await getTemplateWithSteps(templateId);

      expect(mockAxios.get).toHaveBeenCalledWith(
        `/workflow/templates/${templateId}`,
        {
          params: { with_steps: true },
        }
      );
      expect(result).toEqual(mockTemplate);
    });

    it('should fetch template with steps and classification', async () => {
      mockAxios.get.mockResolvedValue({ data: mockTemplate });

      const result = await getTemplateWithStepsAndClassification(templateId);

      expect(mockAxios.get).toHaveBeenCalledWith(
        `/workflow/templates/${templateId}`,
        {
          params: { with_steps: true, with_classification: true },
        }
      );
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('template step operations', () => {
    const mockStep = {
      id: 'step-1',
      name: 'Test Step',
      title: 'Test Step Title',
      formId: 'form-1',
      archived: false,
      lastEdited: '2025-01-01T00:00:00Z',
      lastEditedBy: 'user-1',
    };

    describe('createTemplateStep', () => {
      it('should create a new template step', async () => {
        mockAxios.post.mockResolvedValue({ data: mockStep });

        const result = await createTemplateStep(mockStep);

        expect(mockAxios.post).toHaveBeenCalledWith(
          '/workflow/template/steps',
          mockStep
        );
        expect(result).toEqual(mockStep);
      });
    });

    describe('getAllTemplateSteps', () => {
      it('should fetch all template steps', async () => {
        const mockSteps = [mockStep];
        mockAxios.get.mockResolvedValue({ data: { items: mockSteps } });

        const result = await getAllTemplateSteps();

        expect(mockAxios.get).toHaveBeenCalledWith('/workflow/template/steps');
        expect(result).toEqual(mockSteps);
      });
    });

    describe('getTemplateStepById', () => {
      it('should fetch a template step by ID', async () => {
        const stepId = 'step-1';
        mockAxios.get.mockResolvedValue({ data: mockStep });

        const result = await getTemplateStepById(stepId);

        expect(mockAxios.get).toHaveBeenCalledWith(
          `/workflow/template/steps/${stepId}`,
          { params: undefined }
        );
        expect(result).toEqual(mockStep);
      });

      it('should fetch template step with query parameters', async () => {
        const stepId = 'step-1';
        const params = { with_form: true, with_branches: true };
        mockAxios.get.mockResolvedValue({ data: mockStep });

        const result = await getTemplateStepById(stepId, params);

        expect(mockAxios.get).toHaveBeenCalledWith(
          `/workflow/template/steps/${stepId}`,
          { params }
        );
        expect(result).toEqual(mockStep);
      });
    });

    describe('getTemplateStepWithForm', () => {
      it('should fetch template step with form', async () => {
        const stepId = 'step-1';
        mockAxios.get.mockResolvedValue({ data: mockStep });

        const result = await getTemplateStepWithForm(stepId);

        expect(mockAxios.get).toHaveBeenCalledWith(
          `/workflow/template/steps/${stepId}`,
          {
            params: { with_form: true },
          }
        );
        expect(result).toEqual(mockStep);
      });
    });

    describe('updateTemplateStepById', () => {
      it('should update a template step by ID', async () => {
        const stepId = 'step-1';
        const updatePayload = { name: 'Updated Step Name' };
        const updatedStep = { ...mockStep, ...updatePayload };
        mockAxios.put.mockResolvedValue({ data: updatedStep });

        const result = await updateTemplateStepById(stepId, updatePayload);

        expect(mockAxios.put).toHaveBeenCalledWith(
          `/workflow/template/steps/${stepId}`,
          updatePayload
        );
        expect(result).toEqual(updatedStep);
      });
    });

    describe('deleteTemplateStepById', () => {
      it('should delete a template step by ID', async () => {
        const stepId = 'step-1';
        mockAxios.delete.mockResolvedValue({});

        await deleteTemplateStepById(stepId);

        expect(mockAxios.delete).toHaveBeenCalledWith(
          `/workflow/template/steps/${stepId}`
        );
      });
    });
  });

  describe('archive operations', () => {
    describe('archiveWorkflowTemplateAsync', () => {
      it('should archive a workflow template', async () => {
        const templateId = 'workflow-template-1';
        mockAxios.mockResolvedValue({});

        await archiveWorkflowTemplateAsync(templateId);

        expect(mockAxios).toHaveBeenCalledWith({
          method: 'PUT',
          url: '/workflow/templates/workflow-template-1/archive?archive=true',
        });
      });
    });

    describe('unarchiveWorkflowTemplateAsync', () => {
      it('should unarchive a workflow template', async () => {
        const templateId = 'workflow-template-1';
        mockAxios.mockResolvedValue({});

        await unarchiveWorkflowTemplateAsync(templateId);

        expect(mockAxios).toHaveBeenCalledWith({
          method: 'PUT',
          url: '/workflow/templates/workflow-template-1/archive?archive=false',
        });
      });
    });
  });

  describe('saveWorkflowTemplateWithFileAsync', () => {
    it('should save workflow template with file upload', async () => {
      const mockFile = new File(['test content'], 'template.json', {
        type: 'application/json',
      });
      const mockResponse = { data: 'Upload successful' };
      mockAxios.postForm.mockResolvedValue(mockResponse);

      const result = await saveWorkflowTemplateWithFileAsync(mockFile);

      expect(mockAxios.postForm).toHaveBeenCalledWith('/workflow/templates', {
        file: mockFile,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle network errors in listTemplates', async () => {
      const errorMessage = 'Network Error';
      mockAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(listTemplates()).rejects.toThrow(errorMessage);
      expect(mockAxios.get).toHaveBeenCalledWith('/workflow/templates', {
        params: undefined,
      });
    });

    it('should handle network errors in getTemplate', async () => {
      const templateId = 'non-existent-template';
      const errorMessage = 'Template not found';
      mockAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(getTemplate(templateId)).rejects.toThrow(errorMessage);
      expect(mockAxios.get).toHaveBeenCalledWith(
        `/workflow/templates/${templateId}`,
        { params: undefined }
      );
    });

    it('should handle network errors in createTemplate', async () => {
      const templateInput = {
        name: 'Test Template',
        description: 'Test description',
        version: 1,
        classificationId: 'classification-1',
        steps: [],
        classification: {
          id: 'classification-1',
          name: 'Test Classification',
        },
      };
      const errorMessage = 'Validation Error';
      mockAxios.post.mockRejectedValue(new Error(errorMessage));

      await expect(createTemplate(templateInput)).rejects.toThrow(errorMessage);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/workflow/templates',
        templateInput
      );
    });
  });
});
