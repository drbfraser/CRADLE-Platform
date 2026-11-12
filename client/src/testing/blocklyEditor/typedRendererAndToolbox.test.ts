import { describe, it, expect } from 'vitest';
import * as Blockly from 'blockly';
import {
  registerTypedZelosRenderer,
  TYPED_ZELOS_RENDERER,
} from 'src/shared/components/workflow/blocklyEditor/typedZelosRenderer';
import { buildToolboxConfig } from 'src/shared/components/workflow/blocklyEditor/toolboxConfig';
import { TEST_VARIABLES } from './blocklyTestHarness';

describe('typedZelosRenderer', () => {
  it('registers the custom renderer with Blockly', () => {
    registerTypedZelosRenderer();
    const rendererClass = Blockly.registry.getClass(
      Blockly.registry.Type.RENDERER,
      TYPED_ZELOS_RENDERER
    );
    expect(rendererClass).toBeTruthy();
  });
});

describe('buildToolboxConfig', () => {
  it('shows one generic "<Source> info" category per source under Variables', () => {
    type ToolboxItem = {
      name?: string;
      type?: string;
      contents?: ToolboxItem[];
    };

    const config = buildToolboxConfig(TEST_VARIABLES);
    const categories = config.contents as ToolboxItem[];

    const variables = categories.find((c) => c.name == 'Variables')?.contents;

    expect(variables?.map((c) => c.name)).toEqual([
      'Patient info',
      'Form Questions info',
    ]);
    expect(variables?.[0]?.contents?.[0]?.type).toBe('app_variable_patient');
    expect(variables?.[1]?.contents?.[0]?.type).toBe('app_variable_forms');
    expect(variables?.[0]?.contents).toHaveLength(1);
  });

  it('puts every comparison and logic block inside one Comparisons and Logic category', () => {
    const config = buildToolboxConfig(TEST_VARIABLES);
    const categories = config.contents as Array<{
      name: string;
      colour: string;
      contents: Array<{ name?: string; type?: string }>;
    }>;

    const comparisonsAndLogic = categories.find(
      (c) => c.name === 'Comparisons and Logic'
    );

    expect(comparisonsAndLogic).toBeTruthy();

    const blockTypes = comparisonsAndLogic?.contents.map((c) => c.type);
    expect(blockTypes).toEqual([
      'logic_op',
      'logic_negate',
      'generic_comparison',
      'string_op',
    ]);

    // Old type-based and split task-based categories shouldn't reappear
    // (would duplicate blocks now unified under Comparisons and Logic).
    expect(categories.some((c) => c.name === 'Number Compare')).toBe(false);
    expect(categories.some((c) => c.name === 'Date Compare')).toBe(false);
    expect(categories.some((c) => c.name === 'Text Compare')).toBe(false);
    expect(categories.some((c) => c.name === 'Logic Compare')).toBe(false);
    expect(categories.some((c) => c.name === 'True/False')).toBe(false);
    expect(categories.some((c) => c.name === 'Check a Condition')).toBe(false);
    expect(categories.some((c) => c.name === 'Combine Conditions')).toBe(false);
    expect(comparisonsAndLogic?.contents.every((c) => !c.name)).toBe(true);
  });

  it('always shows Comparisons and Logic even with no variables', () => {
    const config = buildToolboxConfig([]);
    const categories = config.contents as Array<{
      name: string;
      contents?: Array<{ name?: string; type?: string }>;
    }>;

    expect(categories.some((c) => c.name === 'Comparisons and Logic')).toBe(
      true
    );
    expect(categories.some((c) => c.name === 'Values')).toBe(true);
    expect(categories.some((c) => c.name === 'Patient')).toBe(false);

    const comparisonsAndLogic = categories.find(
      (c) => c.name === 'Comparisons and Logic'
    );
    const blockTypes = comparisonsAndLogic?.contents?.map((c) => c.type);
    expect(blockTypes).toEqual([
      'logic_op',
      'logic_negate',
      'generic_comparison',
      'string_op',
    ]);
  });
});
