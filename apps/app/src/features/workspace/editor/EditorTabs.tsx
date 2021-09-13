import { useWorkspaceModel, useWorkspaceState } from './EditorModule';
import { FileTab } from './FileTab';

export function EditorTabs() {
  const {
    tabs,
    activeTabId: activeFile,
    dirtyMap,
    nodeState,
  } = useWorkspaceState();
  const workspaceModel = useWorkspaceModel();
  return (
    <div tw="flex space-x-0.5 overflow-hidden">
      {tabs.map(tab => (
        <FileTab
          key={tab.id}
          name={tab.name}
          hasError={nodeState[tab.id] === 'error'}
          isActive={tab.id === activeFile}
          onOpen={() => workspaceModel.openFile(tab.id)}
          onClose={() => workspaceModel.closeFile(tab.id)}
          hasChanges={dirtyMap[tab.id]}
        />
      ))}
    </div>
  );
}
