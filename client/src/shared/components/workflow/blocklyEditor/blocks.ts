import * as Blockly from 'blockly';
import { WorkflowVariable } from 'src/shared/api';
import { DATE_OUTPUT_SHAPE } from './typedZelosRenderer';
import { ensureVariableBlockGenerator } from './jsonLogicGenerator';
import {
  groupVariablesBySource,
  sortedSourceKeys,
  variableBlockType,
} from './variableGrouping';

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
  ['equal', '=='],
  ['before', '<'],
  ['after', '>'],
  ['before or equal', '<='],
  ['on or after', '>='],
  ['not equal', '!='],
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
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown(ops),
        'OP'
      );
      this.appendValueInput('RIGHT').setCheck(typeCheck);
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setColour(colour);
    },
  };
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
      block.appendDummyInput('CASE').appendField(
        new Blockly.FieldDropdown(CASE_OPTIONS),
        'CASE'
      );
    }
    block.setOutput(true, 'Boolean');
  }
}

export function registerBlocks(variables: WorkflowVariable[]): void {
  const sourceGroups = groupVariablesBySource(variables);

  for (const sourceKey of sortedSourceKeys(sourceGroups)) {
    const sourceVars = sourceGroups.get(sourceKey)!;
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

  // Legacy block kept for loading saved rules created before per-type comparisons.
  Blockly.Blocks['comparison'] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput('LEFT').setCheck(['Number', 'String', 'Date']);
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown(NUMBER_COMPARISON_OPS),
        'OP'
      );
      this.appendValueInput('RIGHT').setCheck(['Number', 'String', 'Date']);
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setColour(210);
    },
    onchange: function (this: Blockly.Block) {
      const op = this.getFieldValue('OP');
      const supportsBoolean = op === '==' || op === '!=';
      const baseTypes = supportsBoolean
        ? ['Number', 'String', 'Date', 'Boolean']
        : ['Number', 'String', 'Date'];

      const leftConn = this.getInput('LEFT')?.connection;
      const rightConn = this.getInput('RIGHT')?.connection;

      if (!supportsBoolean) {
        if (
          leftConn?.targetBlock()?.outputConnection?.getCheck()?.[0] ===
          'Boolean'
        )
          leftConn.disconnect();
        if (
          rightConn?.targetBlock()?.outputConnection?.getCheck()?.[0] ===
          'Boolean'
        )
          rightConn.disconnect();
      }

      const leftType =
        leftConn?.targetBlock()?.outputConnection?.getCheck()?.[0] ?? null;
      const rightType =
        rightConn?.targetBlock()?.outputConnection?.getCheck()?.[0] ?? null;
      const connectedType = leftType ?? rightType ?? null;
      const check = connectedType ? [connectedType] : baseTypes;
      leftConn?.setCheck(check);
      rightConn?.setCheck(check);
    },
  };

  Blockly.Blocks['string_op'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput('TYPE_LABEL').appendField('text');
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
      this.setOutput(true, 'Boolean');
      this.setColour(TYPE_COLOURS.String);
    },
    onchange: function (this: Blockly.Block) {
      updateStringOpShape(this);
    },
  };

  Blockly.Blocks['logic_op'] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput('A').setCheck('Boolean');
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['AND', 'and'],
          ['OR', 'or'],
        ]),
        'OP'
      );
      this.appendValueInput('B').setCheck('Boolean');
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setColour(120);
    },
  };

  Blockly.Blocks['logic_negate'] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput('VALUE').setCheck('Boolean').appendField('NOT');
      this.setOutput(true, 'Boolean');
      this.setColour(120);
    },
  };

  Blockly.Blocks['number_value'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField(new Blockly.FieldNumber(0), 'NUM');
      this.setOutput(true, 'Number');
      this.setColour(TYPE_COLOURS['Number']);
    },
  };

  Blockly.Blocks['string_value'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField(
        new Blockly.FieldTextInput('text'),
        'TEXT'
      );
      this.setOutput(true, 'String');
      this.setColour(TYPE_COLOURS['String']);
    },
  };

  Blockly.Blocks['boolean_value'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField(
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
      this.appendDummyInput().appendField(
        new Blockly.FieldTextInput('YYYY-MM-DD'),
        'DATE'
      );
      this.setOutput(true, 'Date');
      this.setOutputShape(DATE_OUTPUT_SHAPE);
      this.setColour(TYPE_COLOURS['Date']);
    },
    onchange: function (this: Blockly.Block) {
      const value = this.getFieldValue('DATE');
      const valid = /^\d{4}-\d{2}-\d{2}$/.test(value);
      this.setColour(valid ? TYPE_COLOURS['Date'] : 0);
    },
  };
}
