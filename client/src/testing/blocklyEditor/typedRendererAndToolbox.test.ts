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
  it('groups variables by source with per-type blocks inside each group', () => {
    type ToolboxItem = {
      name?: string;
      type?: string;
      contents?: ToolboxItem[];
    };

    const config = buildToolboxConfig(TEST_VARIABLES);
    const categories = config.contents as ToolboxItem[];

    const variables = categories.find((c) => c.name == 'Variables')?.contents;

    const patient = variables?.find((c) => c.name === 'Patient');
    const forms = variables?.find((c) => c.name === 'Form Questions');

    const patientNumber = patient?.contents?.find(
      (c) => c.name === 'Number Variables'
    );
    const patientDate = patient?.contents?.find(
      (c) => c.name === 'Date Variables'
    );
    const formString = forms?.contents?.find(
      (c) => c.name === 'String Variables'
    );

    expect(patientNumber?.contents?.[0]?.type).toBe(
      'app_variable_patient_Number'
    );
    expect(patientDate?.contents?.[0]?.type).toBe('app_variable_patient_Date');
    expect(formString?.contents?.[0]?.type).toBe('app_variable_forms_String');
  });

  it('puts every comparison block, across types, inside one Check a Condition category', () => {
    const config = buildToolboxConfig(TEST_VARIABLES);
    const categories = config.contents as Array<{
      name: string;
      colour: string;
      contents: Array<{ name?: string; type?: string }>;
    }>;

    const checkCondition = categories.find(
      (c) => c.name === 'Check a Condition'
    );

    expect(checkCondition).toBeTruthy();

    const blockTypes = checkCondition?.contents.map((c) => c.type);
    expect(blockTypes).toContain('number_comparison');
    expect(blockTypes).toContain('date_comparison');
    expect(blockTypes).toContain('string_comparison');
    expect(blockTypes).toContain('boolean_comparison');
    expect(blockTypes).toContain('string_op');

    // Old type-based categories shouldn't reappear (would duplicate blocks now in Check a Condition).
    expect(categories.some((c) => c.name === 'Number Compare')).toBe(false);
    expect(categories.some((c) => c.name === 'Date Compare')).toBe(false);
    expect(categories.some((c) => c.name === 'Text Compare')).toBe(false);
    expect(checkCondition?.contents.every((c) => !c.name)).toBe(true);
  });

  it('puts AND/OR/NOT in a separate Combine Conditions category', () => {
    const config = buildToolboxConfig(TEST_VARIABLES);
    const categories = config.contents as Array<{
      name: string;
      contents: Array<{ name?: string; type?: string }>;
    }>;

    const combineConditions = categories.find(
      (c) => c.name === 'Combine Conditions'
    );

    expect(combineConditions).toBeTruthy();
    const blockTypes = combineConditions?.contents.map((c) => c.type);
    expect(blockTypes).toContain('logic_op');
    expect(blockTypes).toContain('logic_negate');

    // Logic Compare/True-False shouldn't reappear; those blocks moved to Check a Condition / Combine Conditions.
    expect(categories.some((c) => c.name === 'Logic Compare')).toBe(false);
    expect(categories.some((c) => c.name === 'True/False')).toBe(false);

    expect(blockTypes).not.toContain('number_comparison');
    expect(blockTypes).not.toContain('string_comparison');
  });

  it('always shows Check a Condition and Combine Conditions even with no variables', () => {
    const config = buildToolboxConfig([]);
    const categories = config.contents as Array<{
      name: string;
      contents?: Array<{ name?: string; type?: string }>;
    }>;

    expect(categories.some((c) => c.name === 'Check a Condition')).toBe(true);
    expect(categories.some((c) => c.name === 'Combine Conditions')).toBe(true);
    expect(categories.some((c) => c.name === 'Values')).toBe(true);
    expect(categories.some((c) => c.name === 'Patient')).toBe(false);

    const checkCondition = categories.find(
      (c) => c.name === 'Check a Condition'
    );
    const blockTypes = checkCondition?.contents?.map((c) => c.type);
    expect(blockTypes).toContain('number_comparison');
    expect(blockTypes).toContain('date_comparison');
    expect(blockTypes).toContain('string_comparison');
    expect(blockTypes).toContain('boolean_comparison');
    expect(blockTypes).toContain('string_op');
  });
});
