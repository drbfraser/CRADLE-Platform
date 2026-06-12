import * as Blockly from 'blockly';

export const jsonLogicGenerator = new Blockly.Generator('JSON_LOGIC');

for (const bType of ['Number', 'String', 'Boolean', 'Date']) {
  jsonLogicGenerator.forBlock[`app_variable_${bType}`] = function (block) {
    const varName = block.getFieldValue('VAR_NAME');
    return [JSON.stringify({ var: varName }), 0];
  };
}

jsonLogicGenerator.forBlock['number_value'] = function (block) {
  const num = block.getFieldValue('NUM');
  return [JSON.stringify(num), 0];
};

jsonLogicGenerator.forBlock['string_value'] = function (block) {
  const text = block.getFieldValue('TEXT');
  return [JSON.stringify(text), 0];
};

jsonLogicGenerator.forBlock['boolean_value'] = function (block) {
  const val = block.getFieldValue('BOOL');
  return [JSON.stringify(val === 'TRUE'), 0];
};

jsonLogicGenerator.forBlock['date_value'] = function (block) {
  const date = block.getFieldValue('DATE');
  return [JSON.stringify({ date: date }), 0];
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
  const topBlocks = workspace.getTopBlocks(false);
  if (topBlocks.length === 0) return null;

  const code = jsonLogicGenerator.blockToCode(topBlocks[0]);
  const codeStr = Array.isArray(code) ? code[0] : code;
  return codeStr || null;
}

const METADATA_KEYS = new Set([
  'name',
  'label',
  'id',
  'description',
  'comment',
  'notes',
  'enabled',
  'version',
]);

export function stripRuleMetadata(rule: unknown): unknown {
  if (typeof rule !== 'object' || rule === null || Array.isArray(rule)) {
    return rule;
  }
  const obj = rule as Record<string, unknown>;
  const logicOnly = Object.fromEntries(
    Object.entries(obj).filter(([key]) => !METADATA_KEYS.has(key))
  );
  return Object.keys(logicOnly).length === 1 ? logicOnly : obj;
}

export function validateJsonLogic(rule: unknown, isRoot = false): boolean {
  const logicRule = stripRuleMetadata(rule);
  if (logicRule === null || logicRule === undefined) return false;
  if (typeof logicRule === 'number') return !isRoot;
  if (typeof logicRule === 'string') return !isRoot;
  if (typeof logicRule === 'boolean') return true;
  if (typeof logicRule === 'object' && 'var' in (logicRule as object))
    return !isRoot;

  if (typeof logicRule === 'object') {
    const entries = Object.entries(logicRule as Record<string, unknown>);
    if (entries.length !== 1) return false;
    const [, args] = entries[0];
    if (Array.isArray(args)) return args.every((arg) => validateJsonLogic(arg));
    return validateJsonLogic(args);
  }
  return false;
}
