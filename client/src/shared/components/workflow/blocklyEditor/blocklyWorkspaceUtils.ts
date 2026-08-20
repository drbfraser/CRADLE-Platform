import * as Blockly from 'blockly';

const CONDITION_ROOT_BLOCK_TYPES = new Set([
  'comparison',
  'number_comparison',
  'date_comparison',
  'string_comparison',
  'boolean_comparison',
  'logic_op',
  'logic_negate',
  'string_op',
]);

export function isConditionRootBlock(block: Blockly.Block): boolean {
  if (!CONDITION_ROOT_BLOCK_TYPES.has(block.type)) {
    return false;
  }
  if (block.type === 'string_op') {
    return block.getFieldValue('OP') !== 'length';
  }
  return true;
}

export function getConditionRootBlocks(
  workspace: Blockly.Workspace
): Blockly.Block[] {
  return workspace
    .getTopBlocks(false)
    .filter((block) => isConditionRootBlock(block));
}

export function getPrimaryConditionBlock(
  workspace: Blockly.Workspace
): Blockly.Block | null {
  const roots = getConditionRootBlocks(workspace);
  return roots[0] ?? null;
}

/** Blocks in the workspace that are not part of the given root's tree. */
export function getBlocksNotInTree(
  workspace: Blockly.Workspace,
  rootBlock: Blockly.Block
): Blockly.Block[] {
  const inTree = new Set<string>();

  const visit = (block: Blockly.Block) => {
    if (inTree.has(block.id)) return;
    inTree.add(block.id);
    for (const input of block.inputList) {
      const target = input.connection?.targetBlock();
      if (target) visit(target);
    }
  };

  visit(rootBlock);

  return workspace
    .getAllBlocks(false)
    .filter((block) => !block.isShadow() && !inTree.has(block.id));
}

/** Position for placing a new top-level block alongside existing ones. */
export function getNextTopBlockPosition(workspace: Blockly.Workspace): {
  x: number;
  y: number;
} {
  const topBlocks = workspace.getTopBlocks(false);
  if (topBlocks.length === 0) {
    return { x: 20, y: 20 };
  }

  let maxX = 0;
  let minY = Infinity;
  for (const block of topBlocks) {
    const xy = block.getRelativeToSurfaceXY();
    maxX = Math.max(maxX, xy.x);
    minY = Math.min(minY, xy.y);
  }

  // Approximate block width so appended conditions sit beside existing ones.
  return { x: maxX + 320, y: minY };
}
