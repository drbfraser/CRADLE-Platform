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

/**
 * The editor only supports one top-level condition. When the user drags a new
 * condition block onto the workspace, replace any previous root instead of
 * leaving two disconnected roots (which blocked further editing).
 */
export function enforceSingleConditionRoot(
  workspace: Blockly.WorkspaceSvg,
  keepBlock: Blockly.Block
): void {
  if (workspace.isDragging()) return;

  const roots = getConditionRootBlocks(workspace).filter(
    (block) => block.id !== keepBlock.id
  );
  if (roots.length === 0) return;

  Blockly.Events.setGroup(true);
  try {
    for (const block of roots) {
      block.dispose(true);
    }
  } finally {
    Blockly.Events.setGroup(false);
  }
}
