export interface FileItem {
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lfs?: {
    size?: number;
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}