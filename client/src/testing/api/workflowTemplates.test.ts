import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../mockServer';
import { API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
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

// Mock localStorage to provide access token
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: () =>
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTksInVzZXJuYW1lIjoidGVzdHVzZXIifQ.test',
    setItem: () => {},
    removeItem: () => {},
  },
  writable: true,
});

describe('workflowTemplates API', () => {
  beforeEach(() => {
    mockServer.resetHandlers();
  });

  describe('listTemplates', () => {
    it('should fetch workflow templates with items response format', async () => {
      mockServer.use(
        http.get(API_URL + EndpointEnum.WORKFLOW_TEMPLATES, () => {
          return HttpResponse.json(
            { items: WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates },
            { status: 200 }
          );
        })
      );

      const result = await listTemplates();

      expect(result).toEqual(WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates);
    });

    it('should fetch workflow templates with array response format', async () => {
      mockServer.use(
        http.get(API_URL + EndpointEnum.WORKFLOW_TEMPLATES, () => {
          return HttpResponse.json(
            WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates,
            { status: 200 }
          );
        })
      );

      const result = await listTemplates();

      expect(result).toEqual(WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates);
    });

    it('should handle query parameters', async () => {
      const params = { classificationId: 'classification-1', archived: false };
      mockServer.use(
        http.get(API_URL + EndpointEnum.WORKFLOW_TEMPLATES, ({ request }) => {
          const url = new URL(request.url);
          const classificationId = url.searchParams.get('classificationId');
          const archived = url.searchParams.get('archived');

          expect(classificationId).toBe('classification-1');
          expect(archived).toBe('false');

          return HttpResponse.json(
            { items: [WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0]] },
            { status: 200 }
          );
        })
      );

      const result = await listTemplates(params);

      expect(result).toEqual([
        WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0],
      ]);
    });

    it('should return empty array for invalid response format', async () => {
      mockServer.use(
        http.get(API_URL + EndpointEnum.WORKFLOW_TEMPLATES, () => {
          return HttpResponse.json(null, { status: 200 });
        })
      );

      const result = await listTemplates();

      expect(result).toEqual([]);
    });
  });

  describe('getTemplate', () => {
    const templateId = 'workflow-template-1';
    const mockTemplate = WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0];

    it('should fetch a single workflow template', async () => {
      mockServer.use(
        http.get(
          API_URL + `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}`,
          () => {
            return HttpResponse.json(mockTemplate, { status: 200 });
          }
        )
      );

      const result = await getTemplate(templateId);

      expect(result).toEqual(mockTemplate);
    });

    it('should fetch template with query parameters', async () => {
      const params = { with_steps: true, with_classification: true };
      mockServer.use(
        http.get(
          API_URL + `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}`,
          ({ request }) => {
            const url = new URL(request.url);
            const withSteps = url.searchParams.get('with_steps');
            const withClassification = url.searchParams.get(
              'with_classification'
            );

            expect(withSteps).toBe('true');
            expect(withClassification).toBe('true');

            return HttpResponse.json(mockTemplate, { status: 200 });
          }
        )
      );

      const result = await getTemplate(templateId, params);

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

      mockServer.use(
        http.post(
          API_URL + EndpointEnum.WORKFLOW_TEMPLATES,
          async ({ request }) => {
            const body = await request.json();
            expect(body).toEqual(templateInput);

            return HttpResponse.json(createdTemplate, { status: 201 });
          }
        )
      );

      const result = await createTemplate(templateInput);

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

      mockServer.use(
        http.put(
          API_URL + `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}`,
          async ({ request }) => {
            const body = await request.json();
            expect(body).toEqual(updatePayload);

            return HttpResponse.json(updatedTemplate, { status: 200 });
          }
        )
      );

      const result = await updateTemplate(templateId, updatePayload);

      expect(result).toEqual(updatedTemplate);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a workflow template', async () => {
      const templateId = 'workflow-template-1';

      mockServer.use(
        http.delete(
          API_URL + `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}`,
          () => {
            return HttpResponse.json({}, { status: 204 });
          }
        )
      );

      await deleteTemplate(templateId);
      // No assertion needed for void return
    });
  });

  describe('listTemplateSteps', () => {
    it('should fetch template steps for a workflow template', async () => {
      const templateId = 'workflow-template-1';
      const mockSteps = [
        { id: 'step-1', name: 'Initial Step', workflowTemplateId: templateId },
        { id: 'step-2', name: 'Final Step', workflowTemplateId: templateId },
      ];

      mockServer.use(
        http.get(
          API_URL + `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}/steps`,
          () => {
            return HttpResponse.json({ items: mockSteps }, { status: 200 });
          }
        )
      );

      const result = await listTemplateSteps(templateId);

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

      mockServer.use(
        http.put(
          API_URL +
            `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}/steps/${stepId}`,
          async ({ request }) => {
            const body = await request.json();
            expect(body).toEqual(updatePayload);

            return HttpResponse.json(updatedStep, { status: 200 });
          }
        )
      );

      const result = await updateTemplateStep(
        templateId,
        stepId,
        updatePayload
      );

      expect(result).toEqual(updatedStep);
    });
  });

  describe('convenience functions', () => {
    const templateId = 'workflow-template-1';
    const mockTemplate = WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0];

    it('should fetch template with classification', async () => {
      mockServer.use(
        http.get(
          API_URL + `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}`,
          ({ request }) => {
            const url = new URL(request.url);
            const withClassification = url.searchParams.get(
              'with_classification'
            );

            expect(withClassification).toBe('true');

            return HttpResponse.json(mockTemplate, { status: 200 });
          }
        )
      );

      const result = await getTemplateWithClassification(templateId);

      expect(result).toEqual(mockTemplate);
    });

    it('should fetch template with steps', async () => {
      mockServer.use(
        http.get(
          API_URL + `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}`,
          ({ request }) => {
            const url = new URL(request.url);
            const withSteps = url.searchParams.get('with_steps');

            expect(withSteps).toBe('true');

            return HttpResponse.json(mockTemplate, { status: 200 });
          }
        )
      );

      const result = await getTemplateWithSteps(templateId);

      expect(result).toEqual(mockTemplate);
    });

    it('should fetch template with steps and classification', async () => {
      mockServer.use(
        http.get(
          API_URL + `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}`,
          ({ request }) => {
            const url = new URL(request.url);
            const withSteps = url.searchParams.get('with_steps');
            const withClassification = url.searchParams.get(
              'with_classification'
            );

            expect(withSteps).toBe('true');
            expect(withClassification).toBe('true');

            return HttpResponse.json(mockTemplate, { status: 200 });
          }
        )
      );

      const result = await getTemplateWithStepsAndClassification(templateId);

      expect(result).toEqual(mockTemplate);
    });
  });

  describe('template step operations', () => {
    const mockStep = {
      id: 'step-1',
      name: 'Test Step',
      description: 'Test Step Description',
      formId: 'form-1',
      lastEdited: '2025-01-01T00:00:00Z',
    };

    describe('createTemplateStep', () => {
      it('should create a new template step', async () => {
        mockServer.use(
          http.post(
            API_URL + '/workflow/template/steps',
            async ({ request }) => {
              const body = await request.json();
              expect(body).toEqual(mockStep);

              return HttpResponse.json(mockStep, { status: 201 });
            }
          )
        );

        const result = await createTemplateStep(mockStep);

        expect(result).toEqual(mockStep);
      });
    });

    describe('getAllTemplateSteps', () => {
      it('should fetch all template steps', async () => {
        const mockSteps = [mockStep];

        mockServer.use(
          http.get(API_URL + '/workflow/template/steps', () => {
            return HttpResponse.json({ items: mockSteps }, { status: 200 });
          })
        );

        const result = await getAllTemplateSteps();

        expect(result).toEqual(mockSteps);
      });
    });

    describe('getTemplateStepById', () => {
      it('should fetch a template step by ID', async () => {
        const stepId = 'step-1';

        mockServer.use(
          http.get(API_URL + `/workflow/template/steps/${stepId}`, () => {
            return HttpResponse.json(mockStep, { status: 200 });
          })
        );

        const result = await getTemplateStepById(stepId);

        expect(result).toEqual(mockStep);
      });

      it('should fetch template step with query parameters', async () => {
        const stepId = 'step-1';
        const params = { with_form: true, with_branches: true };

        mockServer.use(
          http.get(
            API_URL + `/workflow/template/steps/${stepId}`,
            ({ request }) => {
              const url = new URL(request.url);
              const withForm = url.searchParams.get('with_form');
              const withBranches = url.searchParams.get('with_branches');

              expect(withForm).toBe('true');
              expect(withBranches).toBe('true');

              return HttpResponse.json(mockStep, { status: 200 });
            }
          )
        );

        const result = await getTemplateStepById(stepId, params);

        expect(result).toEqual(mockStep);
      });
    });

    describe('getTemplateStepWithForm', () => {
      it('should fetch template step with form', async () => {
        const stepId = 'step-1';

        mockServer.use(
          http.get(
            API_URL + `/workflow/template/steps/${stepId}`,
            ({ request }) => {
              const url = new URL(request.url);
              const withForm = url.searchParams.get('with_form');

              expect(withForm).toBe('true');

              return HttpResponse.json(mockStep, { status: 200 });
            }
          )
        );

        const result = await getTemplateStepWithForm(stepId);

        expect(result).toEqual(mockStep);
      });
    });

    describe('updateTemplateStepById', () => {
      it('should update a template step by ID', async () => {
        const stepId = 'step-1';
        const updatePayload = { name: 'Updated Step Name' };
        const updatedStep = { ...mockStep, ...updatePayload };

        mockServer.use(
          http.put(
            API_URL + `/workflow/template/steps/${stepId}`,
            async ({ request }) => {
              const body = await request.json();
              expect(body).toEqual(updatePayload);

              return HttpResponse.json(updatedStep, { status: 200 });
            }
          )
        );

        const result = await updateTemplateStepById(stepId, updatePayload);

        expect(result).toEqual(updatedStep);
      });
    });

    describe('deleteTemplateStepById', () => {
      it('should delete a template step by ID', async () => {
        const stepId = 'step-1';

        mockServer.use(
          http.delete(API_URL + `/workflow/template/steps/${stepId}`, () => {
            return HttpResponse.json({}, { status: 204 });
          })
        );

        await deleteTemplateStepById(stepId);
        // No assertion needed for void return
      });
    });
  });

  describe('archive operations', () => {
    describe('archiveWorkflowTemplateAsync', () => {
      it('should archive a workflow template', async () => {
        const templateId = 'workflow-template-1';

        mockServer.use(
          http.put(
            API_URL +
              `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}/archive`,
            ({ request }) => {
              const url = new URL(request.url);
              const archive = url.searchParams.get('archive');

              expect(archive).toBe('true');

              return HttpResponse.json({}, { status: 200 });
            }
          )
        );

        await archiveWorkflowTemplateAsync(templateId);
        // No assertion needed for void return
      });
    });

    describe('unarchiveWorkflowTemplateAsync', () => {
      it('should unarchive a workflow template', async () => {
        const templateId = 'workflow-template-1';

        mockServer.use(
          http.put(
            API_URL +
              `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}/archive`,
            ({ request }) => {
              const url = new URL(request.url);
              const archive = url.searchParams.get('archive');

              expect(archive).toBe('false');

              return HttpResponse.json({}, { status: 200 });
            }
          )
        );

        await unarchiveWorkflowTemplateAsync(templateId);
        // No assertion needed for void return
      });
    });
  });

  describe('saveWorkflowTemplateWithFileAsync', () => {
    it('should save workflow template with file upload', async () => {
      // Create a proper File mock for testing environment
      const mockFile = {
        name: 'template.json',
        type: 'application/json',
        size: 12,
        stream: () => new ReadableStream(),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(12)),
        text: () => Promise.resolve('test content'),
      } as File;

      const mockResponse = { data: 'Upload successful' };

      mockServer.use(
        http.post(API_URL + EndpointEnum.WORKFLOW_TEMPLATES, () => {
          // Just return success response, don't validate request details due to test env limitations
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await saveWorkflowTemplateWithFileAsync(mockFile);

      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle network errors in listTemplates', async () => {
      mockServer.use(
        http.get(API_URL + EndpointEnum.WORKFLOW_TEMPLATES, () => {
          return HttpResponse.json(
            { description: 'Network Error' },
            { status: 500 }
          );
        })
      );

      await expect(listTemplates()).rejects.toThrow();
    });

    it('should handle network errors in getTemplate', async () => {
      const templateId = 'non-existent-template';

      mockServer.use(
        http.get(
          API_URL + `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}`,
          () => {
            return HttpResponse.json(
              { description: 'Template not found' },
              { status: 404 }
            );
          }
        )
      );

      await expect(getTemplate(templateId)).rejects.toThrow();
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

      mockServer.use(
        http.post(API_URL + EndpointEnum.WORKFLOW_TEMPLATES, () => {
          return HttpResponse.json(
            { description: 'Validation Error' },
            { status: 400 }
          );
        })
      );

      await expect(createTemplate(templateInput)).rejects.toThrow();
    });
  });
});
