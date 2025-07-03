import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listRuleGroups,
  getRuleGroup,
  createRuleGroup,
  updateRuleGroup,
  deleteRuleGroupById,
  evaluateRuleGroup,
} from '../../shared/api/modules/ruleGroups';
import { axiosFetch } from '../../shared/api/core/http';

// Mock axiosFetch
vi.mock('src/shared/api/core/http', () => ({
  axiosFetch: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockAxios = axiosFetch as any;

describe('Rule Groups API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listRuleGroups', () => {
    it('should fetch all rule groups', async () => {
      const mockRuleGroups = [
        { id: 'rule1', logic: 'AND', rules: '[]' },
        { id: 'rule2', logic: 'OR', rules: '[]' },
      ];

      mockAxios.get.mockResolvedValue({ data: mockRuleGroups });

      const result = await listRuleGroups();

      expect(mockAxios.get).toHaveBeenCalledWith('/rules/groups');
      expect(result).toEqual(mockRuleGroups);
    });

    it('should handle API errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(listRuleGroups()).rejects.toThrow('Network error');
    });
  });

  describe('getRuleGroup', () => {
    it('should fetch a specific rule group', async () => {
      const mockRuleGroup = { id: 'rule1', logic: 'AND', rules: '[]' };
      mockAxios.get.mockResolvedValue({ data: mockRuleGroup });

      const result = await getRuleGroup('rule1');

      expect(mockAxios.get).toHaveBeenCalledWith('/rules/groups/rule1');
      expect(result).toEqual(mockRuleGroup);
    });
  });

  describe('createRuleGroup', () => {
    it('should create a new rule group', async () => {
      const newRuleGroup = { logic: 'AND' as const, rules: '[]' };
      const createdRuleGroup = { id: 'rule1', ...newRuleGroup };

      mockAxios.post.mockResolvedValue({ data: createdRuleGroup });

      const result = await createRuleGroup(newRuleGroup);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/rules/groups',
        newRuleGroup
      );
      expect(result).toEqual(createdRuleGroup);
    });

    it('should validate required fields', async () => {
      const invalidRuleGroup = { logic: 'INVALID' as any, rules: '' };

      mockAxios.post.mockRejectedValue(new Error('Validation error'));

      await expect(createRuleGroup(invalidRuleGroup)).rejects.toThrow();
    });
  });

  describe('updateRuleGroup', () => {
    it('should update an existing rule group', async () => {
      const updateData = { logic: 'OR' as const };
      const updatedRuleGroup = { id: 'rule1', logic: 'OR', rules: '[]' };

      mockAxios.put.mockResolvedValue({ data: updatedRuleGroup });

      const result = await updateRuleGroup('rule1', updateData);

      expect(mockAxios.put).toHaveBeenCalledWith(
        '/rules/groups/rule1',
        updateData
      );
      expect(result).toEqual(updatedRuleGroup);
    });
  });

  describe('deleteRuleGroup', () => {
    it('should delete a rule group', async () => {
      mockAxios.delete.mockResolvedValue({});

      await deleteRuleGroupById('rule1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/rules/groups/rule1');
    });
  });

  describe('evaluateRuleGroup', () => {
    it('should evaluate rule group against context', async () => {
      const context = { surgeryRequired: true, patientAge: 45 };
      const evaluation = { result: true, details: { matched: 2 } };

      mockAxios.post.mockResolvedValue({ data: evaluation });

      const result = await evaluateRuleGroup('rule1', context);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/rules/groups/rule1/evaluate',
        { context }
      );
      expect(result).toEqual(evaluation);
    });

    it('should handle false evaluation result', async () => {
      const context = { surgeryRequired: false };
      const evaluation = { result: false };

      mockAxios.post.mockResolvedValue({ data: evaluation });

      const result = await evaluateRuleGroup('rule1', context);

      expect(result.result).toBe(false);
    });
  });
});
