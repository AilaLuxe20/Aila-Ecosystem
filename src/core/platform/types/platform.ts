export interface Workspace {
  id: string;
  name: string;
  route: string;
  active: boolean;
}

export interface PlatformState {
  workspaces: Workspace[];
  activeWorkspace?: Workspace;
  launcherOpen: boolean;
  searchOpen: boolean;
}

export interface PlatformContextType {
  state: PlatformState;

  openWorkspace: (route: string) => void;
  closeWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string) => void;

  openLauncher: () => void;
  closeLauncher: () => void;

  openSearch: () => void;
  closeSearch: () => void;
}
