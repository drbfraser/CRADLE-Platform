import React, { useRef, useEffect } from 'react';
import * as Blockly from 'blockly';
import { Box, GlobalStyles } from '@mui/material';
import './blocks';
import { toolboxConfig } from './toolboxConfig';
import { workspaceToJsonLogic } from './jsonLogicGenerator';
import { loadJsonLogicToWorkspace } from './jsonLogicToBlocks';

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
  initialJsonLogic?: string;
  onChange: (jsonLogic: string | null) => void;
  readOnly?: boolean;
}

export const BlocklyEditor: React.FC<BlocklyEditorProps> = ({
  initialJsonLogic,
  onChange,
  readOnly = false,
}) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolboxConfig,
      readOnly,
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
      loadJsonLogicToWorkspace(workspace, initialJsonLogic);
      isLoadingRef.current = false;
    }

    workspace.addChangeListener(() => {
      if (isLoadingRef.current) return;
      const jsonLogic = workspaceToJsonLogic(workspace);
      onChange(jsonLogic);
    });

    return () => {
      workspace.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {blocklyZIndexFix}
      <Box
        ref={blocklyDiv}
        sx={{
          width: '100%',
          height: 400,
          border: '1px solid #e0e0e0',
          borderRadius: 1,
        }}
      />
    </>
  );
};
