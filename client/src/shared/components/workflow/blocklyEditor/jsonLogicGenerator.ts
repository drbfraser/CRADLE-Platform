import * as Blockly from 'blockly';

export const jsonLogicGenerator = new Blockly.Generator('JSON_LOGIC');

jsonLogicGenerator.forBlock['app_variable'] = function (block) {
  const varName = block.getFieldValue('VAR_NAME');
  return [JSON.stringify({ var: varName }), 0];
};

jsonLogicGenerator.forBlock['number_value'] = function (block) {
  const num = block.getFieldValue('NUM');
  return [JSON.stringify(num), 0];
};

jsonLogicGenerator.forBlock['boolean_value'] = function (block) {
  const val = block.getFieldValue('BOOL');
  return [JSON.stringify(val === 'TRUE'), 0];
};

jsonLogicGenerator.forBlock['comparison'] = function (block) {
  const op = block.getFieldValue('OP');
  const left = jsonLogicGenerator.valueToCode(block, 'LEFT', 0) || 'null';
  const right = jsonLogicGenerator.valueToCode(block, 'RIGHT', 0) || 'null';
  const result = { [op]: [JSON.parse(left), JSON.parse(right)] };
  return [JSON.stringify(result), 0];
};

jsonLogicGenerator.forBlock['logic_op'] = function (block) {
  const op = block.getFieldValue('OP');
  const a = jsonLogicGenerator.valueToCode(block, 'A', 0) || 'null';
  const b = jsonLogicGenerator.valueToCode(block, 'B', 0) || 'null';
  const result = { [op]: [JSON.parse(a), JSON.parse(b)] };
  return [JSON.stringify(result), 0];
};

jsonLogicGenerator.forBlock['logic_negate'] = function (block) {
  const value = jsonLogicGenerator.valueToCode(block, 'VALUE', 0) || 'null';
  const result = { '!': JSON.parse(value) };
  return [JSON.stringify(result), 0];
};

export function workspaceToJsonLogic(
  workspace: Blockly.Workspace
): string | null {
  // Only the first top-level block is used; disconnected blocks are ignored
  const topBlocks = workspace.getTopBlocks(false);
  if (topBlocks.length === 0) return null;

  const code = jsonLogicGenerator.blockToCode(topBlocks[0]);
  const codeStr = Array.isArray(code) ? code[0] : code;
  return codeStr || null;
}
