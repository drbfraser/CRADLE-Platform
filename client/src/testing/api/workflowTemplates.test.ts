import { vi, describe, it, expect, afterEach } from 'vitest';
import { axiosFetch } from 'src/shared/api/core/http';
import {
  listTemplates,
  createTemplate,
} from '../../shared/api/modules/workflowTemplates';

vi.mock('src/shared/api/core/http');

describe('workflowTemplates API', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch workflow templates', async () => {
    const mockData = [{ id: '1', name: 'Vitals' }];
    (axiosFetch.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockData,
    });

    const result = await listTemplates();
    console.log('Fetched templates:', result);
    expect(axiosFetch.get).toHaveBeenCalledWith('/workflow/templates', {
      params: undefined,
    });
    expect(result).toEqual(mockData);
  });

  it('should create a workflow template', async () => {
    const payload = { name: 'New Template' };
    const mockCreated = { id: '2', ...payload };
    (axiosFetch.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockCreated,
    });

    const result = await createTemplate(payload as any);
    console.log('Created template:', result);
    expect(axiosFetch.post).toHaveBeenCalledWith(
      '/workflow/templates',
      payload
    );
    expect(result).toEqual(mockCreated);
  });
});
