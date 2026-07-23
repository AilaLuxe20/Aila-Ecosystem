export interface NavigationItem {
    label: string;
    href: string;
    icon?: string;
}

export interface WorkspaceWidget {
    id: string;
    title: string;
    component: string;
}

export interface WorkspaceDefinition {
    id: string;
    title: string;
    description: string;
    navigation: NavigationItem[];
    widgets: WorkspaceWidget[];
}