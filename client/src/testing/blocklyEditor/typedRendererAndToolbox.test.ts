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
    const config = buildToolboxConfig(TEST_VARIABLES);
    const categories = config.contents as Array<{
      name: string;
      contents: Array<{
        name: string;
        colour: string;
        contents: Array<{ type: string }>;
      }>;
    }>;

    const patient = categories.find((c) => c.name === 'Patient');
    const forms = categories.find((c) => c.name === 'Form Questions');

    const patientNumber = patient?.contents.find(
      (c) => c.name === 'Number Variables'
    );
    const patientDate = patient?.contents.find(
      (c) => c.name === 'Date Variables'
    );
    const formString = forms?.contents.find(
      (c) => c.name === 'String Variables'
    );

    expect(patientNumber?.contents[0]?.type).toBe(
      'app_variable_patient_Number'
    );
    expect(patientDate?.contents[0]?.type).toBe('app_variable_patient_Date');
    expect(formString?.contents[0]?.type).toBe('app_variable_forms_String');
  });

  it('creates per-type comparison categories with matching colours', () => {
    const config = buildToolboxConfig(TEST_VARIABLES);
    const categories = config.contents as Array<{
      name: string;
      colour: string;
      contents: Array<{ name?: string; type?: string; contents?: unknown[] }>;
    }>;

    const numberCompare = categories.find((c) => c.name === 'Number Compare');
    const dateCompare = categories.find((c) => c.name === 'Date Compare');
    const textCompare = categories.find((c) => c.name === 'Text Compare');

    expect(numberCompare?.colour).toBe('30');
    expect(numberCompare?.contents[0]?.type).toBe('number_comparison');
    expect(dateCompare?.contents[0]?.type).toBe('date_comparison');

    const comparison = textCompare?.contents.find(
      (c) => c.name === 'Comparison'
    );
    const operations = textCompare?.contents.find(
      (c) => c.name === 'Operations'
    );
    expect(comparison?.contents?.[0]).toMatchObject({
      type: 'string_comparison',
    });
    expect(operations?.contents?.[0]).toMatchObject({ type: 'string_op' });
  });

  it('nests comparison and operations under Text Compare without top-level blocks', () => {
    const config = buildToolboxConfig(TEST_VARIABLES);
    const categories = config.contents as Array<{
      name: string;
      contents: Array<{ name: string; type?: string }>;
    }>;

    const textCompare = categories.find((c) => c.name === 'Text Compare');
    expect(textCompare).toBeTruthy();
    expect(textCompare?.contents.some((c) => c.name === 'Comparison')).toBe(
      true
    );
    expect(textCompare?.contents.some((c) => c.name === 'Operations')).toBe(
      true
    );
    expect(textCompare?.contents.every((c) => !c.type)).toBe(true);
    expect(categories.some((c) => c.name === 'Operations')).toBe(false);
  });

  it('nests true/false and logic blocks under Logic Compare without top-level blocks', () => {
    const config = buildToolboxConfig(TEST_VARIABLES);
    const categories = config.contents as Array<{
      name: string;
      contents: Array<{
        name?: string;
        type?: string;
        contents?: Array<{ type: string }>;
      }>;
    }>;

    const logicCompare = categories.find((c) => c.name === 'Logic Compare');
    expect(logicCompare?.contents.some((c) => c.name === 'True/False')).toBe(
      true
    );
    const logicSub = logicCompare?.contents.find((c) => c.name === 'Logic');
    expect(logicSub?.contents?.some((c) => c.type === 'logic_op')).toBe(true);
    expect(logicSub?.contents?.some((c) => c.type === 'logic_negate')).toBe(
      true
    );
    expect(logicCompare?.contents.every((c) => !c.type)).toBe(true);
    expect(categories.some((c) => c.name === 'True/False')).toBe(false);
  });

  it('always shows comparison blocks even with no variables', () => {
    const config = buildToolboxConfig([]);
    const categories = config.contents as Array<{
      name: string;
      contents?: Array<{ name: string }>;
    }>;

    expect(categories.some((c) => c.name === 'Number Compare')).toBe(true);
    expect(categories.some((c) => c.name === 'Date Compare')).toBe(true);
    expect(categories.some((c) => c.name === 'Text Compare')).toBe(true);
    expect(categories.some((c) => c.name === 'Logic Compare')).toBe(true);
    expect(categories.some((c) => c.name === 'Values')).toBe(true);
    expect(categories.some((c) => c.name === 'Patient')).toBe(false);

    const textCompare = categories.find((c) => c.name === 'Text Compare');
    expect(textCompare?.contents?.some((c) => c.name === 'Comparison')).toBe(
      true
    );
    expect(textCompare?.contents?.some((c) => c.name === 'Operations')).toBe(
      true
    );
  });
});
