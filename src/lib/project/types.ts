export type ProjectFile = {
  path: string;
  content: string;
};

export type GeneratedProject = {
  id: string;
  name: string;
  description: string;
  framework: string;
  createdAt: string;
  files: ProjectFile[];
};
