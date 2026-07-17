import * as Blockly from 'blockly';
import { getConditionRootBlocks } from './blocklyWorkspaceUtils';
import { validateJsonLogic, workspaceToJsonLogic } from './jsonLogicGenerator';

export function evaluateWorkspace(workspace: Blockly.WorkspaceSvg): {
  jsonLogic: string | null;
  error: string | null;
} {
  const conditionRoots = getConditionRootBlocks(workspace);
  const blocks = workspace.getAllBlocks(false);
  let jsonLogic: string | null = null;
  let error: string | null = null;

  if (conditionRoots.length === 0) {
    if (blocks.length > 0) {
      error =
        'Add a comparison or text operation block to build your condition, then connect the variable into it.';
    }
    return { jsonLogic, error };
  }

  if (conditionRoots.length > 1) {
    jsonLogic = workspaceToJsonLogic(workspace);
    error =
      'Only one condition block is allowed. Connect or delete the extra blocks.';
  } else if (conditionRoots.length === 1) {
    jsonLogic = workspaceToJsonLogic(workspace);
    if (!jsonLogic || !validateJsonLogic(JSON.parse(jsonLogic), true)) {
      error =
        'The condition is incomplete. All inputs must be connected before saving.';
    } else if (
      workspace
        .getAllBlocks(false)
        .some(
          (b) =>
            b.type === 'date_value' &&
            !b.isShadow() &&
            !/^\d{4}-\d{2}-\d{2}$/.test(b.getFieldValue('DATE') ?? '')
        )
    ) {
      error = 'Date value must be in YYYY-MM-DD format (e.g. 2024-01-15).';
    }
  }

  return { jsonLogic, error };
}
