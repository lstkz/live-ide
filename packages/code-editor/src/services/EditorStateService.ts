interface OpenedTab {
  id: string;
  name: string;
}

export interface TabsState {
  activeTabId: string | null;
  tabs: OpenedTab[];
}

export class EditorStateService {
  constructor(private workspaceId: string) {}

  private getTabsStateKey() {
    return `lv_workspace_tabs_state_${this.workspaceId}`;
  }

  updateTabsState(state: TabsState) {
    localStorage[this.getTabsStateKey()] = JSON.stringify(state);
  }

  loadTabsState(): TabsState {
    try {
      return JSON.parse(localStorage[this.getTabsStateKey()]);
    } catch (e) {
      return {
        activeTabId: null,
        tabs: [],
      };
    }
  }
}
