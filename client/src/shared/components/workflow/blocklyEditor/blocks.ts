import * as Blockly from 'blockly';
import { WorkflowVariable } from 'src/shared/api';
import { DATE_OUTPUT_SHAPE } from './typedZelosRenderer';
import { ensureVariableBlockGenerator } from './jsonLogicGenerator';
import {
  genericVariableBlockType,
  groupVariablesBySource,
  sortedSourceKeys,
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

const variableMetadata = new Map<string, WorkflowVariable>();

export const VITAL_COLLECTION_TAG_MAP: Record<string, string> = {
  traffic_color: 'vitals[latest].traffic_color',
  traffic_arrow: 'vitals[latest].traffic_arrow',
  heart_rate: 'vitals[latest].heart_rate',
  systolic_blood_pressure: 'vitals[latest].systolic_blood_pressure',
  diastolic_blood_pressure: 'vitals[latest].diastolic_blood_pressure',
};

function variableDisplayName(v: WorkflowVariable): string {
  return v.description ?? v.tag;
}

const ORDERED_TYPES = new Set(['Number', 'Date']);
const GENERIC_COMPARE_COLOUR = 120;
const LOGIC_COLOUR = 330;

/** Output type of blocks that produce a whole condition (compare, AND/OR, NOT, text check) */
const CONDITION_TYPE = 'Condition';
/** Plain values a compare can take; conditions are deliberately excluded */
const COMPARABLE_TYPES = ['Number', 'String', 'Boolean', 'Date'];
/** AND / OR / NOT take conditions, plus true/false values (e.g. a boolean variable on its own) */
const CONDITION_INPUT_TYPES = ['Boolean', CONDITION_TYPE];

export const MIN_LOGIC_INPUTS = 2;

const PLUS_ICON =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7.5" fill="white" fill-opacity="0.3"/><path d="M8 4v8M4 8h8" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>'
  );

const MINUS_ICON =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7.5" fill="white" fill-opacity="0.3"/><path d="M4 8h8" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>'
  );

export type LogicOpBlock = Blockly.Block & {
  itemCount_: number;
  updateShape_: () => void;
  changeCount_: (delta: number) => void;
};

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

export function setEnumOptions(
  block: Blockly.Block,
  allowedValues: string[]
): void {
  const currentValue = block.getFieldValue('VALUE');

  const input = block.getInput('ENUM_INPUT');
  if (!input) return;

  const oldField = block.getField('VALUE');
  if (oldField) {
    input.removeField('VALUE');
  }

  input.appendField(
    new Blockly.FieldDropdown(
      allowedValues.map((v) => [v, v] as [string, string])
    ),
    'VALUE'
  );

  if (currentValue && allowedValues.includes(currentValue)) {
    block.setFieldValue(currentValue, 'VALUE');
  }
}
function createEnumBlock(
  comparisonBlock: Blockly.Block,
  allowedValues: string[]
): void {
  const workspace = comparisonBlock.workspace as Blockly.WorkspaceSvg;

  const enumBlock = workspace.newBlock('enum_value') as Blockly.BlockSvg;

  enumBlock.initSvg();
  enumBlock.render();

  setEnumOptions(enumBlock, allowedValues);

  comparisonBlock
    .getInput('RIGHT')
    ?.connection?.connect(enumBlock.outputConnection!);
}

/**
 * Keeps both comparison inputs type-compatible
 * Updates the available operators and block colour
 */
export function syncGenericCompareTypes(block: Blockly.Block): void {
  const leftType = outputTypeOf(block.getInputTargetBlock('LEFT'));
  const rightType = outputTypeOf(block.getInputTargetBlock('RIGHT'));

  const leftBlock = block.getInputTargetBlock('LEFT');

  let allowedValues: string[] | undefined;

  if (leftBlock?.type === 'vital_collection') {
    const field = leftBlock.getFieldValue('FIELD');

    const metadataTag = VITAL_COLLECTION_TAG_MAP[field];

    allowedValues = metadataTag
      ? variableMetadata.get(metadataTag)?.allowedValues
      : undefined;
  } else {
    const tag = leftBlock?.getFieldValue?.('VAR_NAME');

    allowedValues = tag ? variableMetadata.get(tag)?.allowedValues : undefined;
  }

  if (!allowedValues?.length) {
    const rightBlock = block.getInputTargetBlock('RIGHT');

    if (rightBlock?.type === 'enum_value') {
      rightBlock.dispose();
    }
  }

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

  if (allowedValues?.length) {
    let rightBlock = block.getInputTargetBlock('RIGHT');

    if (!rightBlock) {
      createEnumBlock(block, allowedValues);

      rightBlock = block.getInputTargetBlock('RIGHT');
    }

    if (rightBlock?.type === 'enum_value') {
      const existingOptions = rightBlock.data;

      const newOptions = JSON.stringify(allowedValues);

      const field = rightBlock.getField('VALUE');

      const needsRefresh =
        !(field instanceof Blockly.FieldDropdown) ||
        field.getOptions().length <= 1;

      if (needsRefresh || existingOptions !== newOptions) {
        setEnumOptions(rightBlock, allowedValues);
        rightBlock.data = newOptions;
      }
    }
  }
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
    variableMetadata.set(v.tag, v);
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
    defineGenericVariableBlock(sourceKey, sourceGroups.get(sourceKey)!);
  }

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

  Blockly.Blocks['enum_value'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput('ENUM_INPUT')
        .appendField('Value:')
        .appendField(new Blockly.FieldDropdown([['-', '-']]), 'VALUE');

      this.setOutput(true, 'String');
      this.setColour(TYPE_COLOURS['String']);
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
    init: function (this: LogicOpBlock) {
      this.appendDummyInput('HEADER').appendField(
        new Blockly.FieldDropdown([
          ['AND', 'and'],
          ['OR', 'or'],
        ]),
        'OP'
      );
      this.appendDummyInput('BUTTONS').appendField(
        new Blockly.FieldImage(PLUS_ICON, 16, 16, 'Add condition', () =>
          this.changeCount_(1)
        ),
        'PLUS'
      );
      this.setOutput(true, CONDITION_TYPE);
      this.setColour(LOGIC_COLOUR);
      this.setInputsInline(true);
      this.itemCount_ = MIN_LOGIC_INPUTS;
      this.updateShape_();
    },

    saveExtraState: function (this: LogicOpBlock) {
      return { itemCount: this.itemCount_ };
    },

    loadExtraState: function (
      this: LogicOpBlock,
      state: { itemCount?: number }
    ) {
      this.itemCount_ = Math.max(
        MIN_LOGIC_INPUTS,
        state?.itemCount ?? MIN_LOGIC_INPUTS
      );
      this.updateShape_();
    },

    changeCount_: function (this: LogicOpBlock, delta: number) {
      if (this.isInFlyout) return;
      const next = this.itemCount_ + delta;
      if (next < MIN_LOGIC_INPUTS) return;

      Blockly.Events.setGroup(true);
      try {
        const oldState = JSON.stringify(this.saveExtraState!());
        if (delta < 0) {
          this.getInputTargetBlock(`ARG${this.itemCount_ - 1}`)?.unplug();
        }
        this.itemCount_ = next;
        this.updateShape_();
        const newState = JSON.stringify(this.saveExtraState!());
        Blockly.Events.fire(
          new Blockly.Events.BlockChange(
            this,
            'mutation',
            null,
            oldState,
            newState
          )
        );
      } finally {
        Blockly.Events.setGroup(false);
      }
    },

    updateShape_: function (this: LogicOpBlock) {
      for (let i = 0; i < this.itemCount_; i++) {
        if (this.getInput(`ARG${i}`)) continue;
        this.appendValueInput(`ARG${i}`).setCheck(CONDITION_INPUT_TYPES);
      }
      for (let i = this.itemCount_; this.getInput(`ARG${i}`); i++) {
        this.removeInput(`ARG${i}`);
      }
      this.moveInputBefore('BUTTONS', null);

      // Only show the minus button when above the minimum slot count.
      const buttons = this.getInput('BUTTONS')!;
      const hasMinus = !!this.getField('MINUS');
      if (this.itemCount_ > MIN_LOGIC_INPUTS && !hasMinus) {
        buttons.appendField(
          new Blockly.FieldImage(
            MINUS_ICON,
            16,
            16,
            'Remove last condition',
            () => this.changeCount_(-1)
          ),
          'MINUS'
        );
      } else if (this.itemCount_ <= MIN_LOGIC_INPUTS && hasMinus) {
        buttons.removeField('MINUS');
      }
    },
  };

  Blockly.Blocks['logic_negate'] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput('VALUE')
        .setCheck(CONDITION_INPUT_TYPES)
        .appendField('NOT');
      this.setOutput(true, CONDITION_TYPE);
      this.setColour(LOGIC_COLOUR);
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

  const VITAL_COLLECTION_TYPES: Record<string, string> = {
    traffic_color: 'String',
    traffic_arrow: 'String',
    heart_rate: 'Number',
    systolic_blood_pressure: 'Number',
    diastolic_blood_pressure: 'Number',
  };
  function applyHistoricalVitalType(block: Blockly.Block, field: string) {
    const outputType = VITAL_COLLECTION_TYPES[field] ?? 'String';
    block.setOutput(true, outputType);
    block.setColour(TYPE_COLOURS[outputType]);
  }
  Blockly.Blocks['vital_collection'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Vital Sign')
        .appendField(
          new Blockly.FieldDropdown(
            [
              ['Traffic Light Color', 'traffic_color'],
              ['Traffic Light Arrow', 'traffic_arrow'],
              ['Heart Rate', 'heart_rate'],
              ['Systolic Blood Pressure', 'systolic_blood_pressure'],
              ['Diastolic Blood Pressure', 'diastolic_blood_pressure'],
            ],
            (value: string) => {
              applyHistoricalVitalType(this, value);
              return value;
            }
          ),
          'FIELD'
        )
        .appendField('Reading #')
        .appendField(new Blockly.FieldNumber(1, 1), 'READING');

      applyHistoricalVitalType(this, 'traffic_color');
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
