import React, { useRef, useEffect } from 'react';
import * as Blockly from 'blockly';
import { Box, GlobalStyles } from '@mui/material';
import { registerBlocks } from './blocks';
import { buildToolboxConfig } from './toolboxConfig';
import { loadJsonLogicToWorkspace } from './jsonLogicToBlocks';
import {
  registerTypedZelosRenderer,
  TYPED_ZELOS_RENDERER,
} from './typedZelosRenderer';
import {
  enforceSingleConditionRoot,
  getConditionRootBlocks,
  isConditionRootBlock,
} from './blocklyWorkspaceUtils';
import { evaluateWorkspace } from './workspaceValidation';
import { WorkflowVariable } from 'src/shared/api';

const blocklyZIndexFix = (
  <GlobalStyles
    styles={{
      '.blocklyWidgetDiv, .blocklyDropDownDiv, .blocklyTooltipDiv': {
        zIndex: 1400,
      },
    }}
  />
);

interface BlocklyEditorProps {
  variables: WorkflowVariable[];
  initialJsonLogic?: string;
  onChange: (jsonLogic: string | null, error: string | null) => void;
  readOnly?: boolean;
  fillHeight?: boolean;
}

export const BlocklyEditor: React.FC<BlocklyEditorProps> = ({
  variables,
  initialJsonLogic,
  onChange,
  readOnly = false,
  fillHeight = false,
}) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const isLoadingRef = useRef(false);
  const validateTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!blocklyDiv.current) return;

    registerBlocks(variables);
    registerTypedZelosRenderer();

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: buildToolboxConfig(variables),
      readOnly,
      renderer: TYPED_ZELOS_RENDERER,
      scrollbars: true,
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 2,
        minScale: 0.5,
      },
    });

    workspaceRef.current = workspace;

    if (initialJsonLogic) {
      isLoadingRef.current = true;
      loadJsonLogicToWorkspace(workspace, initialJsonLogic, variables);
      isLoadingRef.current = false;
    }

    const scheduleValidation = () => {
      clearTimeout(validateTimeoutRef.current);
      validateTimeoutRef.current = setTimeout(() => {
        if (isLoadingRef.current || workspace.isDragging()) return;

        const roots = getConditionRootBlocks(workspace);
        if (roots.length > 1) {
          enforceSingleConditionRoot(workspace, roots[roots.length - 1]!);
        }

        const result = evaluateWorkspace(workspace);
        onChange(result.jsonLogic, result.error);
      }, 0);
    };

    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (isLoadingRef.current) return;

      if (event.type === Blockly.Events.BLOCK_CREATE) {
        const createEvent = event as Blockly.Events.BlockCreate;
        if (createEvent.blockId) {
          const block = workspace.getBlockById(createEvent.blockId);
          if (block && isConditionRootBlock(block) && !block.getParent()) {
            enforceSingleConditionRoot(workspace, block);
          }
        }
      }

      if (
        event.type !== Blockly.Events.BLOCK_CHANGE &&
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_DELETE
      ) {
        return;
      }
      scheduleValidation();
    });

    scheduleValidation();

    return () => {
      clearTimeout(validateTimeoutRef.current);
      workspaceRef.current = null;
      workspace.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = blocklyDiv.current;
    if (!el) return;

    const resizeWorkspace = () => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    };

    resizeWorkspace();
    const observer = new ResizeObserver(resizeWorkspace);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {blocklyZIndexFix}
      <Box
        ref={blocklyDiv}
        sx={{
          width: '100%',
          height: fillHeight ? '100%' : 400,
          minHeight: fillHeight ? 200 : undefined,
          flex: fillHeight ? 1 : undefined,
          border: '1px solid #e0e0e0',
          borderRadius: 1,
        }}
      />
    </>
  );
};
