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
import {
  appendJsonLogicToWorkspace,
  loadJsonLogicToWorkspace,
} from 'src/shared/components/workflow/blocklyEditor/jsonLogicToBlocks';
import {
  workspaceToJsonLogic,
  validateJsonLogic,
} from 'src/shared/components/workflow/blocklyEditor/jsonLogicGenerator';
import {
  getBlocksNotInTree,
  getConditionRootBlocks,
  isConditionRootBlock,
} from 'src/shared/components/workflow/blocklyEditor/blocklyWorkspaceUtils';
import { evaluateWorkspace } from 'src/shared/components/workflow/blocklyEditor/workspaceValidation';
import { syncGenericCompareTypes } from 'src/shared/components/workflow/blocklyEditor/blocks';

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
      const variable = placeRootBlock(workspace, 'app_variable_forms', {
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

    it('does not treat the legacy comparison block as a valid condition root', () => {
      const legacyComparison = {
        type: 'comparison',
        getFieldValue: vi.fn(),
      } as unknown as Blockly.Block;

      expect(isConditionRootBlock(legacyComparison)).toBe(false);
    });

    it('flags orphan variable blocks as incomplete conditions', () => {
      placeRootBlock(workspace, 'app_variable_forms', {
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

    it('allows multiple condition roots while building', () => {
      placeRootBlock(workspace, 'generic_comparison', { OP: '==' });
      placeRootBlock(workspace, 'generic_comparison', { OP: '>' });

      expect(getConditionRootBlocks(workspace)).toHaveLength(2);
      expect(evaluateWorkspace(workspace).error).toContain(
        'Connect your conditions with AND/OR logic blocks'
      );
      expect(evaluateWorkspace(workspace).jsonLogic).toBeNull();
    });
  });

  describe('building conditions', () => {
    it('reports incomplete when comparison slots are empty', () => {
      placeRootBlock(workspace, 'generic_comparison', { OP: '==' });
      const result = evaluateWorkspace(workspace);
      expect(result.error).toBe(
        'The condition is incomplete. All inputs must be connected before saving.'
      );
    });

    it('generates JSON Logic for string comparison with variable and value', () => {
      const comparison = placeRootBlock(workspace, 'generic_comparison', {
        OP: '==',
      });
      const variable = workspace.newBlock('app_variable_forms');
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

      const variable = workspace.newBlock('app_variable_forms');
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
      const comparison = placeRootBlock(workspace, 'generic_comparison', {
        OP: '<',
      });
      const variable = workspace.newBlock('app_variable_patient');
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

    it('flags invalid calendar dates (e.g. 2026-26-26)', () => {
      const comparison = placeRootBlock(workspace, 'generic_comparison', {
        OP: '<',
      });
      const variable = workspace.newBlock('app_variable_patient');
      variable.setFieldValue('patient.dob', 'VAR_NAME');
      variable.initSvg();
      variable.render();

      const dateValue = workspace.newBlock('date_value');
      dateValue.setFieldValue('2026-26-26', 'DATE');
      dateValue.initSvg();
      dateValue.render();

      connectBlockToInput(comparison, 'LEFT', variable);
      connectBlockToInput(comparison, 'RIGHT', dateValue);

      const result = evaluateWorkspace(workspace);

      expect(result.error).toBe(
        'Date value must be in YYYY-MM-DD format (e.g. 2024-01-15).'
      );
    });

    it('flags invalid leap-year dates (2023-02-29)', () => {
      const comparison = placeRootBlock(workspace, 'generic_comparison', {
        OP: '<',
      });

      const variable = workspace.newBlock('app_variable_patient');
      variable.setFieldValue('patient.dob', 'VAR_NAME');
      variable.initSvg();
      variable.render();

      const dateValue = workspace.newBlock('date_value');
      dateValue.setFieldValue('2023-02-29', 'DATE'); // invalid leap-year date
      dateValue.initSvg();
      dateValue.render();

      connectBlockToInput(comparison, 'LEFT', variable);
      connectBlockToInput(comparison, 'RIGHT', dateValue);

      const result = evaluateWorkspace(workspace);

      expect(result.error).toBe(
        'Date value must be a valid calendar date (e.g. 2024-01-15).'
      );
    });

    it('combines two comparisons with AND into one valid condition', () => {
      const ageCompare = placeRootBlock(workspace, 'generic_comparison', {
        OP: '>',
      });
      const ageVar = workspace.newBlock('app_variable_patient');
      ageVar.setFieldValue('patient.age', 'VAR_NAME');
      ageVar.initSvg();
      ageVar.render();
      const ageValue = workspace.newBlock('number_value');
      ageValue.setFieldValue(18, 'NUM');
      ageValue.initSvg();
      ageValue.render();
      connectBlockToInput(ageCompare, 'LEFT', ageVar);
      connectBlockToInput(ageCompare, 'RIGHT', ageValue);

      const nameCompare = placeRootBlock(workspace, 'generic_comparison', {
        OP: '==',
      });
      const nameVar = workspace.newBlock('app_variable_forms');
      nameVar.setFieldValue('forms[latest].q1', 'VAR_NAME');
      nameVar.initSvg();
      nameVar.render();
      const nameValue = workspace.newBlock('string_value');
      nameValue.setFieldValue('Jane', 'TEXT');
      nameValue.initSvg();
      nameValue.render();
      connectBlockToInput(nameCompare, 'LEFT', nameVar);
      connectBlockToInput(nameCompare, 'RIGHT', nameValue);

      expect(getConditionRootBlocks(workspace)).toHaveLength(2);
      expect(evaluateWorkspace(workspace).error).toContain(
        'Connect your conditions with AND/OR logic blocks'
      );

      const logic = placeRootBlock(workspace, 'logic_op', { OP: 'and' });
      connectBlockToInput(logic, 'A', ageCompare);
      connectBlockToInput(logic, 'B', nameCompare);

      expect(getConditionRootBlocks(workspace)).toHaveLength(1);
      const result = evaluateWorkspace(workspace);
      expect(result.error).toBeNull();
      expect(JSON.parse(result.jsonLogic!)).toEqual({
        and: [
          { '>': [{ var: 'patient.age' }, 18] },
          { '==': [{ var: 'forms[latest].q1' }, 'Jane'] },
        ],
      });
    });

    it('flags disconnected blocks that are not part of the condition tree', () => {
      const comparison = placeRootBlock(workspace, 'generic_comparison', {
        OP: '==',
      });
      const variable = workspace.newBlock('app_variable_forms');
      variable.setFieldValue('forms[latest].q1', 'VAR_NAME');
      variable.initSvg();
      variable.render();
      const value = workspace.newBlock('string_value');
      value.setFieldValue('Yes', 'TEXT');
      value.initSvg();
      value.render();
      connectBlockToInput(comparison, 'LEFT', variable);
      connectBlockToInput(comparison, 'RIGHT', value);

      placeRootBlock(workspace, 'string_value', { TEXT: 'loose' });

      expect(getBlocksNotInTree(workspace, comparison)).toHaveLength(1);
      expect(evaluateWorkspace(workspace).error).toContain(
        'Some blocks are not connected to your condition'
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

    it('loads comparisons as generic blocks narrowed to the variable type', () => {
      loadJsonLogicToWorkspace(
        workspace,
        JSON.stringify({ '>': [{ var: 'patient.age' }, 18] }),
        TEST_VARIABLES
      );

      const root = getConditionRootBlocks(workspace)[0]!;
      expect(root.type).toBe('generic_comparison');
      expect(root.getFieldValue('OP')).toBe('>');

      const left = root.getInputTargetBlock('LEFT');
      expect(left?.type).toBe('app_variable_patient');
      expect(left?.outputConnection?.getCheck()).toEqual(['Number']);
      expect(root.getInput('RIGHT')?.connection?.getCheck()).toEqual([
        'Number',
      ]);
    });

    it('keeps date operators when loading a date comparison', () => {
      const rule = JSON.stringify({
        '<=': [{ var: 'patient.dob' }, { date: '2024-01-01' }],
      });
      loadJsonLogicToWorkspace(workspace, rule, TEST_VARIABLES);

      const root = getConditionRootBlocks(workspace)[0]!;
      expect(root.type).toBe('generic_comparison');
      expect(root.getFieldValue('OP')).toBe('<=');
      expect(root.getInputTargetBlock('LEFT')?.getFieldValue('VAR_NAME')).toBe(
        'patient.dob'
      );
      expect(root.getInput('RIGHT')?.connection?.getCheck()).toEqual(['Date']);
      expect(JSON.parse(workspaceToJsonLogic(workspace)!)).toEqual(
        JSON.parse(rule)
      );
    });

    it('keeps an ordered operator when both sides are unknown variables', () => {
      loadJsonLogicToWorkspace(
        workspace,
        JSON.stringify({
          '>=': [{ var: 'forms[latest].missing' }, { var: 'also.missing' }],
        }),
        TEST_VARIABLES
      );

      const root = getConditionRootBlocks(workspace)[0]!;
      expect(root.type).toBe('generic_comparison');
      expect(root.getFieldValue('OP')).toBe('>=');
    });

    it('does not nest a condition inside a comparison when loading', () => {
      loadJsonLogicToWorkspace(
        workspace,
        JSON.stringify({ '==': [{ '>': [{ var: 'patient.age' }, 18] }, true] }),
        TEST_VARIABLES
      );

      const comparisons = workspace
        .getAllBlocks(false)
        .filter((b) => b.type === 'generic_comparison');
      const outer = comparisons.find((b) => !b.getParent())!;
      expect(outer.getInputTargetBlock('LEFT')).toBeNull();
      expect(evaluateWorkspace(workspace).jsonLogic).toBeNull();
    });
  });

  describe('generic comparison typing', () => {
    it('narrows the other side to the connected variable type', () => {
      const comparison = placeRootBlock(workspace, 'generic_comparison', {
        OP: '>',
      });
      const ageVar = workspace.newBlock('app_variable_patient');
      ageVar.setFieldValue('patient.age', 'VAR_NAME');
      ageVar.initSvg();
      ageVar.render();
      connectBlockToInput(comparison, 'LEFT', ageVar);
      syncGenericCompareTypes(comparison);

      expect(comparison.getInput('RIGHT')?.connection?.getCheck()).toEqual([
        'Number',
      ]);

      const text = workspace.newBlock('string_value');
      text.initSvg();
      text.render();
      connectBlockToInput(comparison, 'RIGHT', text);
      expect(comparison.getInputTargetBlock('RIGHT')).toBeNull();
    });

    it('resets ordered operators to == when the type only supports equality', () => {
      const comparison = placeRootBlock(workspace, 'generic_comparison', {
        OP: '>',
      });
      const q1 = workspace.newBlock('app_variable_forms');
      q1.setFieldValue('forms[latest].q1', 'VAR_NAME');
      q1.initSvg();
      q1.render();
      connectBlockToInput(comparison, 'LEFT', q1);
      syncGenericCompareTypes(comparison);

      expect(comparison.getFieldValue('OP')).toBe('==');
    });

    it('changes output type when a different variable is picked', () => {
      const variable = placeRootBlock(workspace, 'app_variable_patient', {
        VAR_NAME: 'patient.age',
      });
      expect(variable.outputConnection?.getCheck()).toEqual(['Number']);

      variable.setFieldValue('patient.dob', 'VAR_NAME');
      expect(variable.outputConnection?.getCheck()).toEqual(['Date']);
    });
  });

  describe('append loading', () => {
    it('appends a condition beside an existing one without clearing', () => {
      loadJsonLogicToWorkspace(
        workspace,
        JSON.stringify({ '>': [{ var: 'patient.age' }, 18] }),
        TEST_VARIABLES
      );
      expect(getConditionRootBlocks(workspace)).toHaveLength(1);

      const appended = appendJsonLogicToWorkspace(
        workspace,
        JSON.stringify({ '==': [{ var: 'forms[latest].q1' }, 'Jane'] }),
        TEST_VARIABLES
      );
      expect(appended).toBe(true);
      expect(getConditionRootBlocks(workspace)).toHaveLength(2);
      expect(evaluateWorkspace(workspace).error).toContain(
        'Connect your conditions with AND/OR logic blocks'
      );
    });
  });

  describe('loading rules with missing variables', () => {
    it('leaves a missing-variable placeholder when the form question is not available', () => {
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
      expect(root.type).toBe('generic_comparison');
      const left = root.getInputTargetBlock('LEFT');
      expect(left?.type).toBe('app_variable_missing');
      expect(left?.getFieldValue('VAR_NAME')).toBe('forms[latest].missing_q');
      const right = root.getInputTargetBlock('RIGHT');
      expect(right?.type).toBe('string_value');
      expect(right?.getFieldValue('TEXT')).toBe('Yes');
      expect(root.getFieldValue('OP')).toBe('==');
    });

    it('keeps the ordered operator when a missing form question had a numeric value', () => {
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
      expect(root.type).toBe('generic_comparison');
      const left = root.getInputTargetBlock('LEFT');
      expect(left?.type).toBe('app_variable_missing');
      expect(left?.getFieldValue('VAR_NAME')).toBe('forms[latest].patient_age');
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
