import * as Blockly from 'blockly';
import { WorkflowVariable } from 'src/shared/api';
import { blocklyTypeFromVariableType } from './blocks';

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

const COMPARISON_OPS = ['<', '>', '==', '<=', '>=', '!='];

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

  for (const op of COMPARISON_OPS) {
    if (op in ruleObj) {
      const args = ruleObj[op] as unknown[];
      const block = workspace.newBlock('comparison');
      block.setFieldValue(op, 'OP');
      block.initSvg();
      block.render();

      const leftBlock = createBlockFromRule(workspace, args[0], tagToType);
      const rightBlock = createBlockFromRule(workspace, args[1], tagToType);
      if (leftBlock) {
        block
          .getInput('LEFT')!
          .connection!.connect(leftBlock.outputConnection!);
      }
      if (rightBlock) {
        block
          .getInput('RIGHT')!
          .connection!.connect(rightBlock.outputConnection!);
      }
      return block;
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

        if (aBlock) {
          block.getInput('A')!.connection!.connect(aBlock.outputConnection!);
        }
        if (bBlock) {
          block.getInput('B')!.connection!.connect(bBlock.outputConnection!);
        }
        return block;
      }
    }
  }

  if ('!' in ruleObj) {
    const block = workspace.newBlock('logic_negate');
    block.initSvg();
    block.render();
    const valueBlock = createBlockFromRule(workspace, ruleObj['!'], tagToType);
    if (valueBlock) {
      block
        .getInput('VALUE')!
        .connection!.connect(valueBlock.outputConnection!);
    }
    return block;
  }

  return null;
}
