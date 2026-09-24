import * as Blockly from 'blockly';
import {
  getBlocksNotInTree,
  getConditionRootBlocks,
} from './blocklyWorkspaceUtils';
import { validateJsonLogic, workspaceToJsonLogic } from './jsonLogicGenerator';

const LOOSE_CONDITIONS_ERROR =
  'Connect your conditions with AND/OR logic blocks, or remove the extra condition blocks.';
const DISCONNECTED_BLOCKS_ERROR =
  'Some blocks are not connected to your condition. Connect or delete them.';
const INCOMPLETE_ERROR =
  'The condition is incomplete. All inputs must be connected before saving.';
const DATE_FORMAT_ERROR =
  'Date value must be in YYYY-MM-DD format (e.g. 2024-01-15).';

// This function verifies that the date exists (eg. 2026-26-26 is invalid).
// It has the 'export' tag so this function can be used in blocks.ts
export function isValidDateString(value: string): boolean {
  const match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(value);
  if (!match) return false;

  const [, year, month, day] = match;
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);

  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

function hasInvalidDateLiteral(workspace: Blockly.WorkspaceSvg): boolean {
  return workspace.getAllBlocks(false).some(
    (block) =>
      block.type === 'date_value' &&
      !block.isShadow() &&
      //!/^\d{4}-\d{2}-\d{2}$/.test(block.getFieldValue('DATE') ?? '')
      !isValidDateString(block.getFieldValue('DATE') ?? '')
  );
}

function validateSingleRoot(
  workspace: Blockly.WorkspaceSvg,
  root: Blockly.Block
): { jsonLogic: string | null; error: string | null } {
  const disconnected = getBlocksNotInTree(workspace, root);
  if (disconnected.length > 0) {
    return { jsonLogic: null, error: DISCONNECTED_BLOCKS_ERROR };
  }

  const jsonLogic = workspaceToJsonLogic(workspace);
  if (!jsonLogic || !validateJsonLogic(JSON.parse(jsonLogic), true)) {
    return { jsonLogic: null, error: INCOMPLETE_ERROR };
  }

  if (hasInvalidDateLiteral(workspace)) {
    return { jsonLogic: null, error: DATE_FORMAT_ERROR };
  }

  return { jsonLogic, error: null };
}

export function evaluateWorkspace(workspace: Blockly.WorkspaceSvg): {
  jsonLogic: string | null;
  error: string | null;
} {
  const conditionRoots = getConditionRootBlocks(workspace);
  const blocks = workspace.getAllBlocks(false);

  if (conditionRoots.length === 0) {
    if (blocks.length > 0) {
      return {
        jsonLogic: null,
        error:
          'Add a comparison or text operation block to build your condition, then connect the variable into it.',
      };
    }
    return { jsonLogic: null, error: null };
  }

  if (conditionRoots.length > 1) {
    return { jsonLogic: null, error: LOOSE_CONDITIONS_ERROR };
  }

  return validateSingleRoot(workspace, conditionRoots[0]!);
}
