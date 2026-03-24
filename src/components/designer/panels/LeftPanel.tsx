import React from 'react';

interface LeftPanelProps {
  activeTool: string;
  uploadPanel: React.ReactNode;
  textPanel: React.ReactNode;
  aiPanel: React.ReactNode;
  shapesPanel: React.ReactNode;
  libraryPanel: React.ReactNode;
  graphicsPanel: React.ReactNode;
  patternsPanel: React.ReactNode;
  logosPanel: React.ReactNode;
  templatesPanel: React.ReactNode;
}

// Renders whichever tool panel matches activeTool prop
// Does NOT lazy load yet — just organises the conditionals
export const LeftPanel: React.FC<LeftPanelProps> = ({
  activeTool,
  uploadPanel,
  textPanel,
  aiPanel,
  shapesPanel,
  libraryPanel,
  graphicsPanel,
  patternsPanel,
  logosPanel,
  templatesPanel,
}) => {
  if (activeTool === 'upload') return <>{uploadPanel}</>;
  if (activeTool === 'text') return <>{textPanel}</>;
  if (activeTool === 'ai') return <>{aiPanel}</>;
  if (activeTool === 'shapes') return <>{shapesPanel}</>;
  if (activeTool === 'library') return <>{libraryPanel}</>;
  if (activeTool === 'graphics') return <>{graphicsPanel}</>;
  if (activeTool === 'patterns') return <>{patternsPanel}</>;
  if (activeTool === 'logos') return <>{logosPanel}</>;
  if (activeTool === 'templates') return <>{templatesPanel}</>;
  return null;
};
