import * as Blockly from 'blockly';
import { WorkflowVariable } from 'src/shared/api';
import { registerBlocks } from 'src/shared/components/workflow/blocklyEditor/blocks';

export const TEST_VARIABLES: WorkflowVariable[] = [
  {
    tag: 'patient.age',
    type: 'integer',
    description: "Patient's Age",
    isComputed: false,
    isDynamic: false,
  },
  {
    tag: 'forms[latest].q1',
    type: 'string',
    description: 'Select Yes/No',
    isComputed: false,
    isDynamic: true,
  },
  {
    tag: 'patient.dob',
    type: 'date',
    description: 'Date of Birth',
    isComputed: false,
    isDynamic: false,
  },
];

export function createTestWorkspace(): {
  container: HTMLDivElement;
  workspace: Blockly.WorkspaceSvg;
} {
  HTMLCanvasElement.prototype.getContext = function () {
    return {
      measureText: (text: string) => ({ width: text.length * 8 }),
      font: '',
    };
  } as unknown as typeof HTMLCanvasElement.prototype.getContext;

  const container = document.createElement('div');
  document.body.appendChild(container);
  registerBlocks(TEST_VARIABLES);
  const workspace = Blockly.inject(container, {
    renderer: 'zelos',
    scrollbars: false,
    trashcan: true,
  });
  return { container, workspace };
}

export function connectBlockToInput(
  parent: Blockly.Block,
  inputName: string,
  child: Blockly.Block
): void {
  parent.getInput(inputName)?.connection?.connect(child.outputConnection!);
}

export function placeRootBlock(
  workspace: Blockly.WorkspaceSvg,
  type: string,
  fields: Record<string, string> = {}
): Blockly.Block {
  const block = workspace.newBlock(type);
  for (const [name, value] of Object.entries(fields)) {
    block.setFieldValue(value, name);
  }
  block.initSvg();
  block.render();
  block.moveBy(20, 20);
  return block;
}
