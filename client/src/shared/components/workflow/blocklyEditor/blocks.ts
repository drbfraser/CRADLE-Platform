import * as Blockly from 'blockly';
import { WorkflowVariable } from 'src/shared/api';
import { DATE_OUTPUT_SHAPE } from './typedZelosRenderer';
import { ensureVariableBlockGenerator } from './jsonLogicGenerator';
import {
  genericVariableBlockType,
  groupVariablesBySource,
  sortedSourceKeys,
  variableBlockType,
} from './variableGrouping';
import { isValidDateString } from './workspaceValidation';
import { isValidDateFormat } from './workspaceValidation';
export function blocklyTypeFromVariableType(
  type: WorkflowVariable['type']
): string | null {
  switch (type) {
    case 'integer':
    case 'double':
      return 'Number';
    case 'boolean':
      return 'Boolean';
    case 'string':
      return 'String';
    case 'date':
      return 'Date';
    default:
      return null;
  }
}

export const TYPE_COLOURS: Record<string, number> = {
  Number: 30,
  String: 170,
  Boolean: 270,
  Date: 220,
};

const NUMBER_COMPARISON_OPS: [string, string][] = [
  ['<', '<'],
  ['>', '>'],
  ['=', '=='],
  ['≤', '<='],
  ['≥', '>='],
  ['≠', '!='],
];

const DATE_COMPARISON_OPS: [string, string][] = [
  ['= equal', '=='],
  ['< before', '<'],
  ['> after', '>'],
  ['≤ on or before', '<='],
  ['≥ on or after', '>='],
  ['≠ not equal', '!='],
];

const EQUALITY_OPS: [string, string][] = [
  ['=', '=='],
  ['≠', '!='],
];

const STRING_OP_OPTIONS: [string, string][] = [
  ['contains', 'contains'],
  ['starts with', 'startsWith'],
  ['ends with', 'endsWith'],
  ['length', 'length'],
];

const CASE_OPTIONS: [string, string][] = [
  ['case sensitive', 'SENSITIVE'],
  ['case insensitive', 'INSENSITIVE'],
];

function variableDisplayName(v: WorkflowVariable): string {
  return v.description ?? v.tag;
}

function defineComparisonBlock(
  blockType: string,
  typeLabel: string,
  typeCheck: string,
  ops: [string, string][],
  colour: number
): void {
  Blockly.Blocks[blockType] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput('TYPE_LABEL').appendField(typeLabel);
      this.appendValueInput('LEFT').setCheck(typeCheck);
      this.appendDummyInput().appendField(new Blockly.FieldDropdown(ops), 'OP');
      this.appendValueInput('RIGHT').setCheck(typeCheck);
      this.setInputsInline(true);
      this.setOutput(true, CONDITION_TYPE);
      this.setColour(colour);
    },
  };
}

const ORDERED_TYPES = new Set(['Number', 'Date']);
const GENERIC_COMPARE_COLOUR = 120;

/** Output type of blocks that produce a whole condition (compare, AND/OR, NOT, text check) */
const CONDITION_TYPE = 'Condition';
/** Plain values a compare can take; conditions are deliberately excluded */
const COMPARABLE_TYPES = ['Number', 'String', 'Boolean', 'Date'];
/** AND / OR / NOT take conditions, plus true/false values (e.g. a boolean variable on its own) */
const CONDITION_INPUT_TYPES = ['Boolean', CONDITION_TYPE];

/**
 * Returns a block's output type if it has exactly one type; otherwise returns null
 */
function outputTypeOf(block: Blockly.Block | null): string | null {
  const check = block?.outputConnection?.getCheck();
  if (!check || check.length !== 1) return null;
  return check[0];
}

/**
 * Determines the comparison type from connected inputs. (Left wins if both are present)
 */
export function genericCompareType(block: Blockly.Block): string | null {
  return (
    outputTypeOf(block.getInputTargetBlock('LEFT')) ??
    outputTypeOf(block.getInputTargetBlock('RIGHT'))
  );
}

function genericCompareOps(type: string | null): [string, string][] {
  if (type === 'Date') return DATE_COMPARISON_OPS;
  if (type === null || ORDERED_TYPES.has(type)) return NUMBER_COMPARISON_OPS;
  return EQUALITY_OPS;
}

/**
 * Updates an input's accepted types when necessary
 */
function setCheckIfChanged(input: Blockly.Input | null, type: string | null) {
  const connection = input?.connection;
  if (!connection) return;
  const current = connection.getCheck();
  const next = type ? [type] : COMPARABLE_TYPES;
  if (JSON.stringify(current) === JSON.stringify(next)) return;
  connection.setCheck(next);
}

/**
 * Keeps both comparison inputs type-compatible
 * Updates the available operators and block colour
 */
export function syncGenericCompareTypes(block: Blockly.Block): void {
  const leftType = outputTypeOf(block.getInputTargetBlock('LEFT'));
  const rightType = outputTypeOf(block.getInputTargetBlock('RIGHT'));

  if (leftType) {
    setCheckIfChanged(block.getInput('LEFT'), null);
    setCheckIfChanged(block.getInput('RIGHT'), leftType);
  } else if (rightType) {
    setCheckIfChanged(block.getInput('LEFT'), rightType);
    setCheckIfChanged(block.getInput('RIGHT'), null);
  } else {
    setCheckIfChanged(block.getInput('LEFT'), null);
    setCheckIfChanged(block.getInput('RIGHT'), null);
  }

  const type = genericCompareType(block);
  const allowedOps = genericCompareOps(type).map(([, value]) => value);
  if (!allowedOps.includes(block.getFieldValue('OP'))) {
    block.setFieldValue('==', 'OP');
  }
  block.setColour(
    type
      ? (TYPE_COLOURS[type] ?? GENERIC_COMPARE_COLOUR)
      : GENERIC_COMPARE_COLOUR
  );
}

function updateStringOpShape(block: Blockly.Block): void {
  const op = block.getFieldValue('OP');
  const isLength = op === 'length';

  if (isLength) {
    if (block.getInput('NEEDLE')) {
      block.removeInput('NEEDLE');
    }
    if (block.getInput('CASE')) {
      block.removeInput('CASE');
    }
    block.setOutput(true, 'Number');
  } else {
    if (!block.getInput('NEEDLE')) {
      block
        .appendValueInput('NEEDLE')
        .setCheck('String')
        .appendField(
          op === 'contains'
            ? 'contains'
            : op === 'startsWith'
              ? 'starts with'
              : 'ends with'
        );
    }
    if (!block.getInput('CASE')) {
      block
        .appendDummyInput('CASE')
        .appendField(new Blockly.FieldDropdown(CASE_OPTIONS), 'CASE');
    }
    block.setOutput(true, CONDITION_TYPE);
  }
}

function applyVariableType(block: Blockly.Block, bType: string): void {
  if (outputTypeOf(block) !== bType) {
    block.setOutput(true, bType);
  }
  block.setOutputShape(bType === 'Date' ? DATE_OUTPUT_SHAPE : null);
  block.setColour(TYPE_COLOURS[bType]);
}

function defineGenericVariableBlock(
  sourceKey: string,
  sourceVars: WorkflowVariable[]
): void {
  const tagToType = new Map<string, string>();
  const options: [string, string][] = [];
  for (const v of sourceVars) {
    const bType = blocklyTypeFromVariableType(v.type);
    if (!bType) continue;
    tagToType.set(v.tag, bType);
    options.push([variableDisplayName(v), v.tag]);
  }
  if (options.length === 0) return;

  const blockName = genericVariableBlockType(sourceKey);
  ensureVariableBlockGenerator(blockName);

  Blockly.Blocks[blockName] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown(options, (tag: string) => {
          const bType = tagToType.get(tag);
          if (bType) applyVariableType(this, bType);
          return tag;
        }),
        'VAR_NAME'
      );
      applyVariableType(this, tagToType.get(options[0][1])!);
      this.setTooltip(
        "Pick any variable. The block takes on that variable's type."
      );
    },
  };
}

export function registerBlocks(variables: WorkflowVariable[]): void {
  const sourceGroups = groupVariablesBySource(variables);

  for (const sourceKey of sortedSourceKeys(sourceGroups)) {
    const sourceVars = sourceGroups.get(sourceKey)!;
    defineGenericVariableBlock(sourceKey, sourceVars);

    const byType: Record<string, [string, string][]> = {
      Number: [],
      String: [],
      Boolean: [],
      Date: [],
    };

    for (const v of sourceVars) {
      const bType = blocklyTypeFromVariableType(v.type);
      if (bType && bType in byType) {
        byType[bType].push([variableDisplayName(v), v.tag]);
      }
    }

    for (const [bType, options] of Object.entries(byType)) {
      if (options.length === 0) continue;

      const colour = TYPE_COLOURS[bType];
      const blockName = variableBlockType(sourceKey, bType);
      ensureVariableBlockGenerator(blockName);

      Blockly.Blocks[blockName] = {
        init: function (this: Blockly.Block) {
          this.appendDummyInput().appendField(
            new Blockly.FieldDropdown(options),
            'VAR_NAME'
          );
          this.setOutput(true, bType);
          if (bType === 'Date') {
            this.setOutputShape(DATE_OUTPUT_SHAPE);
          }
          this.setColour(colour);
        },
      };
    }
  }

  defineComparisonBlock(
    'number_comparison',
    'number',
    'Number',
    NUMBER_COMPARISON_OPS,
    TYPE_COLOURS.Number
  );
  defineComparisonBlock(
    'date_comparison',
    'date',
    'Date',
    DATE_COMPARISON_OPS,
    TYPE_COLOURS.Date
  );
  defineComparisonBlock(
    'string_comparison',
    'text',
    'String',
    EQUALITY_OPS,
    TYPE_COLOURS.String
  );
  defineComparisonBlock(
    'boolean_comparison',
    'true/false',
    'Boolean',
    EQUALITY_OPS,
    TYPE_COLOURS.Boolean
  );

  Blockly.Blocks['generic_comparison'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput('TYPE_LABEL').appendField('COMPARE');
      this.appendValueInput('LEFT').setCheck(COMPARABLE_TYPES);
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown(function (this: Blockly.FieldDropdown) {
          const source = this.getSourceBlock();
          return genericCompareOps(source ? genericCompareType(source) : null);
        }),
        'OP'
      );
      this.appendValueInput('RIGHT').setCheck(COMPARABLE_TYPES);
      this.setInputsInline(true);
      this.setOutput(true, CONDITION_TYPE);
      this.setColour(GENERIC_COMPARE_COLOUR);
      this.setTooltip(
        'Compare two values. Connect a block to either side and the other side will only accept the same type.'
      );
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (this.isInFlyout || this.isInsertionMarker()) return;
      if (
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_CHANGE
      ) {
        return;
      }
      syncGenericCompareTypes(this);
    },
  };

  // Placeholder block for variables removed from the form that are shown in red so
  // the user knows to delete or replace it before saving.
  Blockly.Blocks['app_variable_missing'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('⚠ Removed: ')
        .appendField(new Blockly.FieldLabel('?'), 'VAR_NAME');
      this.setOutput(true, null);
      this.setColour(0);
      this.setTooltip(
        'This variable no longer exists in the form. Delete this block or replace it with a valid variable.'
      );
    },
  };

  Blockly.Blocks['string_op'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput('TYPE_LABEL').appendField('CHECK TEXT');
      this.appendValueInput('HAYSTACK').setCheck('String');
      this.appendDummyInput('OP_ROW').appendField(
        new Blockly.FieldDropdown(STRING_OP_OPTIONS, (value) => {
          updateStringOpShape(this);
          return value;
        }),
        'OP'
      );
      this.appendValueInput('NEEDLE')
        .setCheck('String')
        .appendField('contains');
      this.appendDummyInput('CASE').appendField(
        new Blockly.FieldDropdown(CASE_OPTIONS),
        'CASE'
      );
      this.setOutput(true, CONDITION_TYPE);
      this.setColour(TYPE_COLOURS.String);
    },
    onchange: function (this: Blockly.Block) {
      updateStringOpShape(this);
    },
  };

  Blockly.Blocks['logic_op'] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput('A').setCheck(CONDITION_INPUT_TYPES);
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['AND', 'and'],
          ['OR', 'or'],
        ]),
        'OP'
      );
      this.appendValueInput('B').setCheck(CONDITION_INPUT_TYPES);
      this.setInputsInline(true);
      this.setOutput(true, CONDITION_TYPE);
      this.setColour(120);
    },
  };

  Blockly.Blocks['logic_negate'] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput('VALUE')
        .setCheck(CONDITION_INPUT_TYPES)
        .appendField('NOT');
      this.setOutput(true, CONDITION_TYPE);
      this.setColour(120);
    },
  };

  Blockly.Blocks['number_value'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Number:')
        .appendField(new Blockly.FieldNumber(0), 'NUM');
      this.setOutput(true, 'Number');
      this.setColour(TYPE_COLOURS['Number']);
      this.setTooltip('Enter a numeric value');
    },
  };

  Blockly.Blocks['string_value'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Text:')
        .appendField(new Blockly.FieldTextInput('Type text here'), 'TEXT');
      this.setOutput(true, 'String');
      this.setColour(TYPE_COLOURS['String']);
    },
  };

  Blockly.Blocks['boolean_value'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('True/False:')
        .appendField(
          new Blockly.FieldDropdown([
            ['true', 'TRUE'],
            ['false', 'FALSE'],
          ]),
          'BOOL'
        );
      this.setOutput(true, 'Boolean');
      this.setColour(TYPE_COLOURS['Boolean']);
    },
  };

  Blockly.Blocks['date_value'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Date:')
        .appendField(new Blockly.FieldTextInput('YYYY-MM-DD'), 'DATE');
      this.setOutput(true, 'Date');
      this.setOutputShape(DATE_OUTPUT_SHAPE);
      this.setColour(TYPE_COLOURS['Date']);
    },
    // When user changes the date:
    onchange: function (this: Blockly.Block) {
      const value = this.getFieldValue('DATE');

      if (value === 'YYYY-MM-DD') {
        this.setWarningText(null);
        return;
      }
      const formatValid = isValidDateFormat(value);
      const calendarValid = isValidDateString(value);

      let warning = null;

      if (!formatValid) {
        warning = 'Date must be in YYYY-MM-DD format (e.g. 2024-01-15)';
      } else if (!calendarValid) {
        warning = 'Date must be a valid calendar date (e.g. 2024-01-15)';
      }

      this.setWarningText(warning);
    },
  };
}
