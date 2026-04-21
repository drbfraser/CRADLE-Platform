import * as Blockly from 'blockly';
import { WorkflowVariable } from 'src/shared/api';

function blocklyTypeFromVariableType(
  type: WorkflowVariable['type']
): string | null {
  switch (type) {
    case 'integer':
    case 'double':
      return 'Number';
    case 'boolean':
      return 'Boolean';
    case 'string':
    case 'date':
      return 'String';
    default:
      return null;
  }
}

function variableDisplayName(v: WorkflowVariable): string {
  return v.description ?? v.tag;
}

export function registerBlocks(variables: WorkflowVariable[]): void {
  const options = variables.map(
    (v) =>
      [variableDisplayName(v), v.tag, blocklyTypeFromVariableType(v.type)] as [
        string,
        string,
        string | null,
      ]
  );

  const dropdown: [string, string][] = options.map(([display, value]) => [
    display,
    value,
  ]);

  const typeMap = new Map(options.map(([, value, type]) => [value, type]));

  Blockly.Blocks['app_variable'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown(dropdown),
        'VAR_NAME'
      );
      this.setOutput(true, options[0]?.[2] ?? null);
      this.setColour(230);
    },
    onchange: function (this: Blockly.Block) {
      const varName = this.getFieldValue('VAR_NAME');
      const type = typeMap.get(varName) ?? null;
      this.outputConnection?.setCheck(type);
    },
  };

  Blockly.Blocks['comparison'] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput('LEFT');
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
      this.appendValueInput('RIGHT');
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setColour(210);
    },
    onchange: function (this: Blockly.Block) {
      const leftBlock = this.getInput('LEFT')?.connection?.targetBlock();
      const typeCheck = leftBlock?.outputConnection?.getCheck() ?? null;
      this.getInput('RIGHT')?.connection?.setCheck(typeCheck);
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
      this.setColour(160);
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
      this.setColour(160);
    },
  };
}
