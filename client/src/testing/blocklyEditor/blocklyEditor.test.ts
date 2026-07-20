import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  vi,
} from 'vitest';
import * as Blockly from 'blockly';
import {
  createTestWorkspace,
  placeRootBlock,
  connectBlockToInput,
  TEST_VARIABLES,
} from './blocklyTestHarness';
import { loadJsonLogicToWorkspace } from 'src/shared/components/workflow/blocklyEditor/jsonLogicToBlocks';
import {
  workspaceToJsonLogic,
  validateJsonLogic,
} from 'src/shared/components/workflow/blocklyEditor/jsonLogicGenerator';
import {
  enforceSingleConditionRoot,
  getConditionRootBlocks,
  isConditionRootBlock,
} from 'src/shared/components/workflow/blocklyEditor/blocklyWorkspaceUtils';
import { evaluateWorkspace } from 'src/shared/components/workflow/blocklyEditor/workspaceValidation';

describe('Blockly workspace rules', () => {
  let container: HTMLDivElement;
  let workspace: Blockly.WorkspaceSvg;

  beforeAll(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      })
    );
  });

  beforeEach(() => {
    ({ container, workspace } = createTestWorkspace());
  });

  afterEach(() => {
    workspace.dispose();
    container.remove();
  });

  describe('condition root counting', () => {
    it('empty workspace has zero condition roots and no error', () => {
      expect(getConditionRootBlocks(workspace)).toHaveLength(0);
      expect(evaluateWorkspace(workspace)).toEqual({
        jsonLogic: null,
        error: null,
      });
    });

    it('does not count string variables or value blocks as condition roots', () => {
      const variable = placeRootBlock(workspace, 'app_variable_forms_String', {
        VAR_NAME: 'forms[latest].q1',
      });
      const value = placeRootBlock(workspace, 'string_value', { TEXT: 'Yes' });

      expect(isConditionRootBlock(variable)).toBe(false);
      expect(isConditionRootBlock(value)).toBe(false);
      expect(getConditionRootBlocks(workspace)).toHaveLength(0);
      expect(evaluateWorkspace(workspace).error).toContain(
        'Add a comparison or text operation block'
      );
    });

    it('flags orphan variable blocks as incomplete conditions', () => {
      placeRootBlock(workspace, 'app_variable_forms_String', {
        VAR_NAME: 'forms[latest].q1',
      });
      const result = evaluateWorkspace(workspace);
      expect(result.jsonLogic).toBeNull();
      expect(result.error).toContain(
        'Add a comparison or text operation block'
      );
    });

    it('counts string_op (contains) as a single condition root', () => {
      const block = placeRootBlock(workspace, 'string_op', {
        OP: 'contains',
        CASE: 'SENSITIVE',
      });
      expect(isConditionRootBlock(block)).toBe(true);
      expect(getConditionRootBlocks(workspace)).toHaveLength(1);
    });

    it('does not count string_op length-only expression as a condition root', () => {
      const block = placeRootBlock(workspace, 'string_op', { OP: 'length' });
      expect(isConditionRootBlock(block)).toBe(false);
      expect(getConditionRootBlocks(workspace)).toHaveLength(0);
    });

    it('replacing a condition root removes the previous root', () => {
      placeRootBlock(workspace, 'string_comparison', { OP: '==' });
      const stringOp = placeRootBlock(workspace, 'string_op', {
        OP: 'contains',
        CASE: 'SENSITIVE',
      });

      enforceSingleConditionRoot(workspace, stringOp);

      expect(getConditionRootBlocks(workspace)).toHaveLength(1);
      expect(getConditionRootBlocks(workspace)[0]?.type).toBe('string_op');
    });
  });

  describe('building conditions', () => {
    it('reports incomplete when comparison slots are empty', () => {
      placeRootBlock(workspace, 'string_comparison', { OP: '==' });
      const result = evaluateWorkspace(workspace);
      expect(result.error).toBe(
        'The condition is incomplete. All inputs must be connected before saving.'
      );
    });

    it('generates JSON Logic for string comparison with variable and value', () => {
      const comparison = placeRootBlock(workspace, 'string_comparison', {
        OP: '==',
      });
      const variable = workspace.newBlock('app_variable_forms_String');
      variable.setFieldValue('forms[latest].q1', 'VAR_NAME');
      variable.initSvg();
      variable.render();

      const value = workspace.newBlock('string_value');
      value.setFieldValue('Yes', 'TEXT');
      value.initSvg();
      value.render();

      connectBlockToInput(comparison, 'LEFT', variable);
      connectBlockToInput(comparison, 'RIGHT', value);

      const jsonLogic = workspaceToJsonLogic(workspace);
      expect(JSON.parse(jsonLogic!)).toEqual({
        '==': [{ var: 'forms[latest].q1' }, 'Yes'],
      });
      expect(evaluateWorkspace(workspace).error).toBeNull();
    });

    it('generates JSON Logic for string contains operation', () => {
      const stringOp = placeRootBlock(workspace, 'string_op', {
        OP: 'contains',
        CASE: 'INSENSITIVE',
      });

      const variable = workspace.newBlock('app_variable_forms_String');
      variable.setFieldValue('forms[latest].q1', 'VAR_NAME');
      variable.initSvg();
      variable.render();

      const needle = workspace.newBlock('string_value');
      needle.setFieldValue('flu', 'TEXT');
      needle.initSvg();
      needle.render();

      connectBlockToInput(stringOp, 'HAYSTACK', variable);
      connectBlockToInput(stringOp, 'NEEDLE', needle);

      const jsonLogic = workspaceToJsonLogic(workspace);
      expect(JSON.parse(jsonLogic!)).toEqual({
        contains: [{ var: 'forms[latest].q1' }, 'flu', true],
      });
      expect(validateJsonLogic(JSON.parse(jsonLogic!), true)).toBe(true);
      expect(evaluateWorkspace(workspace).error).toBeNull();
    });

    it('flags invalid date literals', () => {
      const comparison = placeRootBlock(workspace, 'date_comparison', {
        OP: '<',
      });
      const variable = workspace.newBlock('app_variable_patient_Date');
      variable.setFieldValue('patient.dob', 'VAR_NAME');
      variable.initSvg();
      variable.render();

      const dateValue = workspace.newBlock('date_value');
      dateValue.setFieldValue('YYYY-MM-DD', 'DATE');
      dateValue.initSvg();
      dateValue.render();

      connectBlockToInput(comparison, 'LEFT', variable);
      connectBlockToInput(comparison, 'RIGHT', dateValue);

      expect(evaluateWorkspace(workspace).error).toBe(
        'Date value must be in YYYY-MM-DD format (e.g. 2024-01-15).'
      );
    });
  });

  describe('round-trip loading', () => {
    it('loads and re-exports string comparison rules', () => {
      const rule = JSON.stringify({
        '==': [{ var: 'forms[latest].q1' }, 'Yes'],
      });
      loadJsonLogicToWorkspace(workspace, rule, TEST_VARIABLES);
      const exported = workspaceToJsonLogic(workspace);
      expect(JSON.parse(exported!)).toEqual(JSON.parse(rule));
    });

    it('loads and re-exports string contains rules', () => {
      const rule = JSON.stringify({
        contains: [{ var: 'forms[latest].q1' }, 'flu', false],
      });
      loadJsonLogicToWorkspace(workspace, rule, TEST_VARIABLES);
      const exported = workspaceToJsonLogic(workspace);
      expect(JSON.parse(exported!)).toEqual(JSON.parse(rule));
    });

    it('loads and re-exports compound AND rules', () => {
      const rule = JSON.stringify({
        and: [
          { '>': [{ var: 'patient.age' }, 18] },
          { '==': [{ var: 'forms[latest].q1' }, 'Yes'] },
        ],
      });
      loadJsonLogicToWorkspace(workspace, rule, TEST_VARIABLES);
      const exported = workspaceToJsonLogic(workspace);
      expect(JSON.parse(exported!)).toEqual(JSON.parse(rule));
    });
  });

  describe('loading rules with missing variables', () => {
    it('leaves the variable slot empty when the form question is not available', () => {
      loadJsonLogicToWorkspace(
        workspace,
        JSON.stringify({
          '==': [{ var: 'forms[latest].missing_q' }, 'Yes'],
        }),
        TEST_VARIABLES
      );

      const roots = getConditionRootBlocks(workspace);
      expect(roots).toHaveLength(1);
      const root = roots[0]!;
      expect(root.type).toBe('string_comparison');
      expect(root.getInputTargetBlock('LEFT')).toBeNull();
      const right = root.getInputTargetBlock('RIGHT');
      expect(right?.type).toBe('string_value');
      expect(right?.getFieldValue('TEXT')).toBe('Yes');
      expect(root.getFieldValue('OP')).toBe('==');
    });

    it('keeps number compare when a missing form question had a numeric value', () => {
      loadJsonLogicToWorkspace(
        workspace,
        JSON.stringify({
          '>=': [{ var: 'forms[latest].patient_age' }, 18],
        }),
        TEST_VARIABLES
      );

      const roots = getConditionRootBlocks(workspace);
      expect(roots).toHaveLength(1);
      const root = roots[0]!;
      expect(root.type).toBe('number_comparison');
      expect(root.getInputTargetBlock('LEFT')).toBeNull();
      expect(root.getFieldValue('OP')).toBe('>=');
      const right = root.getInputTargetBlock('RIGHT');
      expect(right?.type).toBe('number_value');
      expect(Number(right?.getFieldValue('NUM'))).toBe(18);
    });

    it('still loads known form questions', () => {
      loadJsonLogicToWorkspace(
        workspace,
        JSON.stringify({
          '==': [{ var: 'forms[latest].q1' }, 'Yes'],
        }),
        TEST_VARIABLES
      );

      const roots = getConditionRootBlocks(workspace);
      expect(roots).toHaveLength(1);
      const left = roots[0]!.getInputTargetBlock('LEFT');
      expect(left?.getFieldValue('VAR_NAME')).toBe('forms[latest].q1');
    });
  });
});
