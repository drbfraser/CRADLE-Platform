import * as Blockly from 'blockly';

// TODO: Fetch dynamically from GET /api/workflow/variables
const VARIABLE_OPTIONS: [string, string][] = [
  ["Patient's Age", 'patient.age'],
];

Blockly.Blocks['app_variable'] = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown(VARIABLE_OPTIONS),
      'VAR_NAME'
    );
    this.setOutput(true, null);
    this.setColour(230);
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
