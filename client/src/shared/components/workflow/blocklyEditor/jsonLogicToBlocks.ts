import * as Blockly from 'blockly';

export function loadJsonLogicToWorkspace(
  workspace: Blockly.WorkspaceSvg,
  jsonLogicStr: string
): void {
  workspace.clear();

  let rule: unknown;
  try {
    rule = JSON.parse(jsonLogicStr);
  } catch {
    return;
  }

  const block = createBlockFromRule(workspace, rule);
  if (block) {
    block.moveBy(20, 20);
  }
}

const COMPARISON_OPS = ['<', '>', '==', '<=', '>=', '!='];

function createBlockFromRule(
  workspace: Blockly.WorkspaceSvg,
  rule: unknown
): Blockly.BlockSvg | null {
  if (rule === null || rule === undefined) return null;

  if (typeof rule === 'number') {
    const block = workspace.newBlock('number_value');
    block.setFieldValue(rule, 'NUM');
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

  if ('var' in ruleObj) {
    const block = workspace.newBlock('app_variable');
    block.setFieldValue(String(ruleObj.var), 'VAR_NAME');
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

      const leftBlock = createBlockFromRule(workspace, args[0]);
      const rightBlock = createBlockFromRule(workspace, args[1]);
      if (leftBlock) {
        block.getInput('LEFT')!.connection!.connect(leftBlock.outputConnection!);
      }
      if (rightBlock) {
        block.getInput('RIGHT')!.connection!.connect(rightBlock.outputConnection!);
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

        const aBlock = createBlockFromRule(workspace, args[0]);
        const bRule =
          args.length === 2 ? args[1] : { [op]: args.slice(1) };
        const bBlock = createBlockFromRule(workspace, bRule);

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
    const valueBlock = createBlockFromRule(workspace, ruleObj['!']);
    if (valueBlock) {
      block.getInput('VALUE')!.connection!.connect(valueBlock.outputConnection!);
    }
    return block;
  }

  return null;
}
