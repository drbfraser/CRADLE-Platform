import * as Blockly from 'blockly';

export const jsonLogicGenerator = new Blockly.Generator('JSON_LOGIC');

function generateComparison(
  block: Blockly.Block,
  leftInput: string,
  rightInput: string
): [string, number] {
  const op = block.getFieldValue('OP');
  const left = jsonLogicGenerator.valueToCode(block, leftInput, 0) || 'null';
  const right = jsonLogicGenerator.valueToCode(block, rightInput, 0) || 'null';
  const result = { [op]: [JSON.parse(left), JSON.parse(right)] };
  return [JSON.stringify(result), 0];
}

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

for (const blockType of [
  'number_comparison',
  'date_comparison',
  'string_comparison',
  'boolean_comparison',
  'comparison',
]) {
  jsonLogicGenerator.forBlock[blockType] = function (block) {
    return generateComparison(block, 'LEFT', 'RIGHT');
  };
}

jsonLogicGenerator.forBlock['string_op'] = function (block) {
  const op = block.getFieldValue('OP');
  const haystack =
    jsonLogicGenerator.valueToCode(block, 'HAYSTACK', 0) || 'null';

  if (op === 'length') {
    return [JSON.stringify({ length: [JSON.parse(haystack)] }), 0];
  }

  const needle =
    jsonLogicGenerator.valueToCode(block, 'NEEDLE', 0) || 'null';
  const caseInsensitive = block.getFieldValue('CASE') === 'INSENSITIVE';
  const result = {
    [op]: [JSON.parse(haystack), JSON.parse(needle), caseInsensitive],
  };
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

const CUSTOM_STRING_OPS = new Set([
  'contains',
  'startsWith',
  'endsWith',
  'length',
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
    const [operator, args] = entries[0];
    if (CUSTOM_STRING_OPS.has(operator)) {
      if (!Array.isArray(args)) return false;
      if (operator === 'length') {
        return args.length === 1 && validateJsonLogic(args[0]);
      }
      return (
        args.length >= 2 &&
        args.slice(0, 2).every((arg) => validateJsonLogic(arg)) &&
        (args.length === 2 ||
          (args.length === 3 && typeof args[2] === 'boolean'))
      );
    }
    if (Array.isArray(args)) return args.every((arg) => validateJsonLogic(arg));
    return validateJsonLogic(args);
  }
  return false;
}
