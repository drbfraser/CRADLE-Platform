import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../mockServer';
import { API_URL, getInstanceWithSteps } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { WORKFLOW_INSTANCE_TEST_DATA } from '../testData';

const testInstanceId = 'test-workflow-instance-1';

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

describe('workflowInstanceWithSteps API', () => {
  beforeEach(() => {
    mockServer.resetHandlers();
  });

  // GET /workflow/instances/{instanceId}?with_steps=true
  describe('getWorkflowInstanceWithSteps', () => {
    it('should fetch workflow instance with expected response format', async () => {
      mockServer.use(
        http.get(
          API_URL +
            EndpointEnum.WORKFLOW_INSTANCES +
            '/' +
            testInstanceId +
            EndpointEnum.WITH_STEPS,
          () => {
            return HttpResponse.json(WORKFLOW_INSTANCE_TEST_DATA.instances, {
              status: 200,
            });
          }
        )
      );

      const result = await getInstanceWithSteps(testInstanceId);

      expect(result).toEqual(WORKFLOW_INSTANCE_TEST_DATA.instances);
    });
  });
});
