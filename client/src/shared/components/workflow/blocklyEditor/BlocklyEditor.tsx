import React, { useRef, useEffect, useState } from 'react';
import * as Blockly from 'blockly';
import { Box, GlobalStyles, Typography } from '@mui/material';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import { registerBlocks } from './blocks';
import { buildToolboxConfig } from './toolboxConfig';
import {
  appendJsonLogicToWorkspace,
  loadJsonLogicToWorkspace,
} from './jsonLogicToBlocks';
import {
  registerTypedZelosRenderer,
  TYPED_ZELOS_RENDERER,
} from './typedZelosRenderer';
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
  /** When set, appends this rule as a new block cluster beside existing blocks. */
  appendJsonLogic?: string | null;
  onAppendComplete?: () => void;
  onChange: (jsonLogic: string | null, error: string | null) => void;
  readOnly?: boolean;
  fillHeight?: boolean;
}

function workspaceHasBlocks(workspace: Blockly.Workspace): boolean {
  return workspace.getAllBlocks(false).length > 0;
}

export const BlocklyEditor: React.FC<BlocklyEditorProps> = ({
  variables,
  initialJsonLogic,
  appendJsonLogic,
  onAppendComplete,
  onChange,
  readOnly = false,
  fillHeight = false,
}) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const isLoadingRef = useRef(false);
  const validateTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const onChangeRef = useRef(onChange);
  const onAppendCompleteRef = useRef(onAppendComplete);
  const [showWorkspaceHint, setShowWorkspaceHint] = useState(!initialJsonLogic);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onAppendCompleteRef.current = onAppendComplete;
  }, [onAppendComplete]);

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

    const updateWorkspaceHint = () => {
      setShowWorkspaceHint(!workspaceHasBlocks(workspace));
    };

    if (initialJsonLogic) {
      isLoadingRef.current = true;
      loadJsonLogicToWorkspace(workspace, initialJsonLogic, variables);
      isLoadingRef.current = false;
    }
    updateWorkspaceHint();

    const scheduleValidation = () => {
      clearTimeout(validateTimeoutRef.current);
      validateTimeoutRef.current = setTimeout(() => {
        if (isLoadingRef.current || workspace.isDragging()) return;

        updateWorkspaceHint();
        const result = evaluateWorkspace(workspace);
        onChangeRef.current(result.jsonLogic, result.error);
      }, 0);
    };

    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (isLoadingRef.current) return;

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
    const workspace = workspaceRef.current;
    if (!workspace || !appendJsonLogic) return;

    isLoadingRef.current = true;
    appendJsonLogicToWorkspace(workspace, appendJsonLogic, variables);
    isLoadingRef.current = false;
    setShowWorkspaceHint(false);

    clearTimeout(validateTimeoutRef.current);
    validateTimeoutRef.current = setTimeout(() => {
      const result = evaluateWorkspace(workspace);
      onChangeRef.current(result.jsonLogic, result.error);
      onAppendCompleteRef.current?.();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appendJsonLogic, variables]);

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

  useEffect(() => {
    if (!workspaceRef.current) return;
    registerBlocks(variables);
    workspaceRef.current.updateToolbox(buildToolboxConfig(variables));
  }, [variables]);

  return (
    <>
      {blocklyZIndexFix}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: fillHeight ? '100%' : 400,
          minHeight: fillHeight ? 200 : undefined,
          flex: fillHeight ? 1 : undefined,
        }}>
        {showWorkspaceHint && !readOnly && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              px: 4,
            }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                color: 'text.secondary',
                textAlign: 'center',
                maxWidth: 360,
              }}>
              <SouthEastIcon sx={{ fontSize: 40, opacity: 0.45 }} />
              <Typography variant="body2" color="text.secondary">
                Drag compare blocks here to build your condition
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Drop multiple comparisons, connect them with AND/OR from Logic
                Compare, then save once everything is linked
              </Typography>
            </Box>
          </Box>
        )}

        <Box
          ref={blocklyDiv}
          sx={{
            width: '100%',
            height: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
          }}
        />
      </Box>
    </>
  );
};
