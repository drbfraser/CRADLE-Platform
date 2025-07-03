import { vi, describe, it, expect, afterEach } from 'vitest';
import { axiosFetch } from 'src/shared/api/core/http';
import {
  createWorkflowClassification,
  getWorkflowClassification,
  listWorkflowClassifications,
  updateClassification,
  deleteWorkflowClassificationById,
} from 'src/shared/api/modules/workflowClassification';

vi.mock('src/shared/api/core/http');

describe('workflowTemplates API', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch workflow classifications', async () => {
    const mockData = [{ id: '1', name: 'class1' }];
    (axiosFetch.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockData,
    });

    const result = await listWorkflowClassifications();
    console.log('Fetched workflows:', result);
    expect(axiosFetch.get).toHaveBeenCalledWith('/workflow/classifications');
    expect(result).toEqual(mockData);
  });

  it('should fetch a workflow classification by ID', async () => {
    const mockData = [{ id: '2', name: 'class2' }];
    (axiosFetch.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockData,
    });

    const result = await getWorkflowClassification('2');
    console.log('Fetched classification:', result);
    expect(axiosFetch.get).toHaveBeenCalledWith('/workflow/classifications/2');
    expect(result).toEqual(mockData);
  });

  it('should create a workflow classification', async () => {
    const payload = { name: 'class1' };
    const mockCreated = { id: '1', ...payload };
    (axiosFetch.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockCreated,
    });

    const result = await createWorkflowClassification(payload as any);
    console.log('Created classification:', result);
    expect(axiosFetch.post).toHaveBeenCalledWith(
      '/workflow/classifications',
      payload
    );
    expect(result).toEqual(mockCreated);
  });

  it('should update a workflow classification', async () => {
    const updateData = { name: 'newname' };
    const updatedClassification = { id: '1', name: 'newname' };
    (axiosFetch.put as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: updatedClassification,
    });

    const result = await updateClassification('1', updateData);
    console.log('Updated classification:', result);
    expect(axiosFetch.put).toHaveBeenCalledWith(
      '/workflow/classifications/1',
      updateData
    );
    expect(result).toEqual(updatedClassification);
  });

  it('should delete a workflow classification by ID', async () => {
    (
      axiosFetch.delete as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});
    await deleteWorkflowClassificationById('1');
    expect(axiosFetch.delete).toHaveBeenCalledWith(
      '/workflow/classifications/1'
    );
  });
});
