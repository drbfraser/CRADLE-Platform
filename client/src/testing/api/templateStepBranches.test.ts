describe('templateStepBranches placeholder', () => {
  it('should be re-comment all code after finishing the templateStepBranches apis', () => {});
});

// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import {
//   listTemplateStepBranches,
//   createTemplateStepBranch,
//   updateTemplateStepBranch,
//   deleteTemplateStepBranch,
// } from '../../shared/api/modules/templateStepBranches';
// import { axiosFetch } from '../../shared/api/core/http';

// vi.mock('src/shared/api/core/http');
// const mockAxios = axiosFetch as any;

// describe('Template Step Branches API', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   describe('listTemplateStepBranches', () => {
//     it('should fetch branches for a template step', async () => {
//       const mockBranches = [
//         {
//           targetStepId: 'step2',
//           condition: { id: 'rule1', logic: 'AND', rules: '[]' },
//         },
//         {
//           targetStepId: 'step3',
//           condition: { id: 'rule2', logic: 'OR', rules: '[]' },
//         },
//       ];

//       mockAxios.get.mockResolvedValue({ data: mockBranches });

//       const result = await listTemplateStepBranches('template1', 'step1');

//       expect(mockAxios.get).toHaveBeenCalledWith(
//         '/workflow/templates/template1/steps/step1/branches'
//       );
//       expect(result).toEqual(mockBranches);
//     });
//   });

//   describe('createTemplateStepBranch', () => {
//     it('should create a new step branch', async () => {
//       const branchData = {
//         targetStepId: 'step2',
//         condition: { id: 'rule1', logic: 'AND' as const, rules: '[]' },
//       };
//       const createdBranch = { id: 'branch1', ...branchData };

//       mockAxios.post.mockResolvedValue({ data: createdBranch });

//       const result = await createTemplateStepBranch(
//         'template1',
//         'step1',
//         branchData
//       );

//       expect(mockAxios.post).toHaveBeenCalledWith(
//         '/workflow/templates/template1/steps/step1/branches',
//         branchData
//       );
//       expect(result).toEqual(createdBranch);
//     });

//     it('should create branch without condition', async () => {
//       const branchData = { targetStepId: 'step2' };
//       const createdBranch = { id: 'branch1', ...branchData };

//       mockAxios.post.mockResolvedValue({ data: createdBranch });

//       const result = await createTemplateStepBranch(
//         'template1',
//         'step1',
//         branchData
//       );

//       expect(result).toEqual(createdBranch);
//     });
//   });

//   describe('updateTemplateStepBranch', () => {
//     it('should update an existing branch', async () => {
//       const updateData = { targetStepId: 'step3' };
//       const updatedBranch = { id: 'branch1', ...updateData };

//       mockAxios.put.mockResolvedValue({ data: updatedBranch });

//       const result = await updateTemplateStepBranch(
//         'template1',
//         'step1',
//         'branch1',
//         updateData
//       );

//       expect(mockAxios.put).toHaveBeenCalledWith(
//         '/workflow/templates/template1/steps/step1/branches/branch1',
//         updateData
//       );
//       expect(result).toEqual(updatedBranch);
//     });
//   });

//   describe('deleteTemplateStepBranch', () => {
//     it('should delete a branch', async () => {
//       mockAxios.delete.mockResolvedValue({});

//       await deleteTemplateStepBranch('template1', 'step1', 'branch1');

//       expect(mockAxios.delete).toHaveBeenCalledWith(
//         '/workflow/templates/template1/steps/step1/branches/branch1'
//       );
//     });
//   });
// });
