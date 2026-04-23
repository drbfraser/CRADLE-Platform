import * as Blockly from 'blockly';
import { WorkflowVariable } from 'src/shared/api';

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

const TYPE_COLOURS: Record<string, number> = {
  Number: 30,
  String: 170,
  Boolean: 270,
  Date: 220,
};

function variableDisplayName(v: WorkflowVariable): string {
  return v.description ?? v.tag;
}

export function registerBlocks(variables: WorkflowVariable[]): void {
  const byType: Record<string, [string, string][]> = {
    Number: [],
    String: [],
    Boolean: [],
    Date: [],
  };

  for (const v of variables) {
    const bType = blocklyTypeFromVariableType(v.type);
    if (bType && bType in byType) {
      byType[bType].push([variableDisplayName(v), v.tag]);
    }
  }

  for (const [bType, options] of Object.entries(byType)) {
    if (options.length === 0) continue;

    const colour = TYPE_COLOURS[bType];
    const blockName = `app_variable_${bType}`;

    Blockly.Blocks[blockName] = {
      init: function (this: Blockly.Block) {
        this.appendDummyInput().appendField(
          new Blockly.FieldDropdown(options),
          'VAR_NAME'
        );
        this.setOutput(true, bType);
        this.setColour(colour);
      },
    };
  }

  Blockly.Blocks['comparison'] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput('LEFT').setCheck(['Number', 'String', 'Date']);
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['<', '<'],
          ['>', '>'],
          ['=', '=='],
          ['≤', '<='],
          ['≥', '>='],
          ['≠', '!='],
        ]),
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
      this.setColour(TYPE_COLOURS['Date']);
    },
    onchange: function (this: Blockly.Block) {
      const value = this.getFieldValue('DATE');
      const valid = /^\d{4}-\d{2}-\d{2}$/.test(value);
      this.setColour(valid ? TYPE_COLOURS['Date'] : 0);
    },
  };
}
