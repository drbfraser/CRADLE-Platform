import * as Blockly from 'blockly';
import { WorkflowVariable } from 'src/shared/api';
import { blocklyTypeFromVariableType } from './blocks';

const COMPARISON_OPS = ['<', '>', '==', '<=', '>=', '!='];
const STRING_OPS = ['contains', 'startsWith', 'endsWith'];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function loadJsonLogicToWorkspace(
  workspace: Blockly.WorkspaceSvg,
  jsonLogicStr: string,
  variables: WorkflowVariable[] = []
): void {
  workspace.clear();

  let rule: unknown;
  try {
    rule = JSON.parse(jsonLogicStr);
  } catch {
    return;
  }

  const tagToType = new Map(
    variables.map((v) => [v.tag, blocklyTypeFromVariableType(v.type)])
  );

  const block = createBlockFromRule(workspace, rule, tagToType);
  if (block) {
    block.moveBy(20, 20);
  }
}

function inferBlocklyType(
  rule: unknown,
  tagToType: Map<string, string | null>
): string {
  if (typeof rule === 'number') return 'Number';
  if (typeof rule === 'boolean') return 'Boolean';
  if (typeof rule === 'string') {
    return ISO_DATE_RE.test(rule) ? 'Date' : 'String';
  }
  if (typeof rule === 'object' && rule !== null) {
    const ruleObj = rule as Record<string, unknown>;
    if ('date' in ruleObj) return 'Date';
    if ('var' in ruleObj) return tagToType.get(String(ruleObj.var)) ?? 'String';
    if ('length' in ruleObj) return 'Number';
  }
  return 'String';
}

function comparisonBlockType(
  left: unknown,
  right: unknown,
  tagToType: Map<string, string | null>
): string {
  const leftType = inferBlocklyType(left, tagToType);
  const rightType = inferBlocklyType(right, tagToType);
  const type =
    leftType === rightType ? leftType : (leftType ?? rightType);

  switch (type) {
    case 'Number':
      return 'number_comparison';
    case 'Date':
      return 'date_comparison';
    case 'Boolean':
      return 'boolean_comparison';
    default:
      return 'string_comparison';
  }
}

function connectValueBlock(
  parent: Blockly.BlockSvg,
  inputName: string,
  child: Blockly.BlockSvg | null
): void {
  if (!child) return;
  parent.getInput(inputName)?.connection?.connect(child.outputConnection!);
}

function createComparisonBlock(
  workspace: Blockly.WorkspaceSvg,
  op: string,
  args: unknown[],
  tagToType: Map<string, string | null>,
  blockType?: string
): Blockly.BlockSvg {
  const resolvedType =
    blockType ?? comparisonBlockType(args[0], args[1], tagToType);
  const block = workspace.newBlock(resolvedType);
  block.setFieldValue(op, 'OP');
  block.initSvg();
  block.render();

  const leftBlock = createBlockFromRule(workspace, args[0], tagToType);
  const rightBlock = createBlockFromRule(workspace, args[1], tagToType);
  connectValueBlock(block, 'LEFT', leftBlock);
  connectValueBlock(block, 'RIGHT', rightBlock);
  return block;
}

function createStringOpBlock(
  workspace: Blockly.WorkspaceSvg,
  op: string,
  args: unknown[],
  tagToType: Map<string, string | null>
): Blockly.BlockSvg {
  const block = workspace.newBlock('string_op');
  block.setFieldValue(op, 'OP');
  block.initSvg();
  block.render();
  (
    block as Blockly.BlockSvg & { onchange?: (this: Blockly.Block) => void }
  ).onchange?.call(block);

  if (op === 'length') {
    const haystackBlock = createBlockFromRule(
      workspace,
      Array.isArray(args) ? args[0] : args,
      tagToType
    );
    connectValueBlock(block, 'HAYSTACK', haystackBlock);
    return block;
  }

  const [haystackRule, needleRule, caseInsensitive] = args;
  const haystackBlock = createBlockFromRule(workspace, haystackRule, tagToType);
  const needleBlock = createBlockFromRule(workspace, needleRule, tagToType);
  connectValueBlock(block, 'HAYSTACK', haystackBlock);
  connectValueBlock(block, 'NEEDLE', needleBlock);
  block.setFieldValue(caseInsensitive ? 'INSENSITIVE' : 'SENSITIVE', 'CASE');
  return block;
}

function createBlockFromRule(
  workspace: Blockly.WorkspaceSvg,
  rule: unknown,
  tagToType: Map<string, string | null>
): Blockly.BlockSvg | null {
  if (rule === null || rule === undefined) return null;

  if (typeof rule === 'number') {
    const block = workspace.newBlock('number_value');
    block.setFieldValue(rule, 'NUM');
    block.initSvg();
    block.render();
    return block;
  }

  if (typeof rule === 'string') {
    if (ISO_DATE_RE.test(rule)) {
      const block = workspace.newBlock('date_value');
      block.setFieldValue(rule, 'DATE');
      block.initSvg();
      block.render();
      return block;
    }
    const block = workspace.newBlock('string_value');
    block.setFieldValue(rule, 'TEXT');
    block.initSvg();
    block.render();
    return block;
  }

  if (typeof rule === 'boolean') {
    const block = workspace.newBlock('boolean_value');
    block.setFieldValue(rule ? 'TRUE' : 'FALSE', 'BOOL');
    block.initSvg();
    block.render();
    return block;
  }

  if (typeof rule !== 'object') return null;
  const ruleObj = rule as Record<string, unknown>;

  if ('date' in ruleObj) {
    const block = workspace.newBlock('date_value');
    block.setFieldValue(String(ruleObj.date), 'DATE');
    block.initSvg();
    block.render();
    return block;
  }

  if ('var' in ruleObj) {
    const tag = String(ruleObj.var);
    const bType = tagToType.get(tag) ?? 'String';
    const block = workspace.newBlock(`app_variable_${bType}`);
    block.setFieldValue(tag, 'VAR_NAME');
    block.initSvg();
    block.render();
    return block;
  }

  if ('length' in ruleObj) {
    return createStringOpBlock(
      workspace,
      'length',
      ruleObj.length as unknown[],
      tagToType
    );
  }

  for (const op of STRING_OPS) {
    if (op in ruleObj) {
      return createStringOpBlock(
        workspace,
        op,
        ruleObj[op] as unknown[],
        tagToType
      );
    }
  }

  for (const op of COMPARISON_OPS) {
    if (op in ruleObj) {
      return createComparisonBlock(
        workspace,
        op,
        ruleObj[op] as unknown[],
        tagToType
      );
    }
  }

  for (const op of ['and', 'or']) {
    if (op in ruleObj) {
      const args = ruleObj[op] as unknown[];
      if (args.length >= 2) {
        const block = workspace.newBlock('logic_op');
        block.setFieldValue(op, 'OP');
        block.initSvg();
        block.render();

        const aBlock = createBlockFromRule(workspace, args[0], tagToType);
        const bRule = args.length === 2 ? args[1] : { [op]: args.slice(1) };
        const bBlock = createBlockFromRule(workspace, bRule, tagToType);

        connectValueBlock(block, 'A', aBlock);
        connectValueBlock(block, 'B', bBlock);
        return block;
      }
    }
  }

  if ('!' in ruleObj) {
    const block = workspace.newBlock('logic_negate');
    block.initSvg();
    block.render();
    const valueBlock = createBlockFromRule(workspace, ruleObj['!'], tagToType);
    connectValueBlock(block, 'VALUE', valueBlock);
    return block;
  }

  return null;
}
