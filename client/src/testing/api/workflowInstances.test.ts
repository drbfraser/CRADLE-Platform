import { vi, describe, it, expect, afterEach } from 'vitest';
import { axiosFetch } from 'src/shared/api/core/http';
import {
  getInstancesList,
  createInstance,
  getInstanceById,
  archiveInstance,
} from '../../shared/api/modules/workflowInstance';

vi.mock('src/shared/api/core/http');

describe('workflowInstances API', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch workflow instances by patientId', async () => {
    const mockData = [{ id: '1', patient_id: 'p1' }];
    (axiosFetch.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockData,
    });

    const result = await getInstancesList({ patientId: 'p1' });
    console.log('Fetched instances:', result);

    expect(axiosFetch.get).toHaveBeenCalledWith('/workflow/instances', {
      params: { patientId: 'p1' },
    });
    expect(result).toEqual(mockData);
  });

  it('should create a workflow instance', async () => {
    const payload = {
      id: 'instance-1',
      name: 'Instance Test',
      workflow_template_id: 'template-1',
      patient_id: 'p1',
      steps: [],
    };
    const mockResponse = { ...payload, status: 'Active' };

    (axiosFetch.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockResponse,
    });

    const result = await createInstance(payload as any);
    console.log('Created instance:', result);

    expect(axiosFetch.post).toHaveBeenCalledWith(
      '/workflow/instances',
      payload
    );
    expect(result).toEqual(mockResponse);
  });

  it('should fetch instance by ID', async () => {
    const mockInstance = { id: '1', name: 'Test' };
    (axiosFetch.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockInstance,
    });

    const result = await getInstanceById('1');
    console.log('Fetched instance by ID:', result);

    expect(axiosFetch.get).toHaveBeenCalledWith('/workflow/instances/1');
    expect(result).toEqual(mockInstance);
  });

  it('should archive a workflow instance', async () => {
    const mockArchived = { id: '1', status: 'Cancelled' };
    (axiosFetch.put as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockArchived,
    });

    const result = await archiveInstance('1');
    console.log('Archived instance:', result);

    expect(axiosFetch.put).toHaveBeenCalledWith(
      '/workflow/instances/1',
      expect.objectContaining({
        status: 'Cancelled',
      })
    );
    expect(result).toEqual(mockArchived);
  });
});
