'use client';

import { useState, useEffect } from 'react';
import { FileText, Folder, Download, Home, ChevronRight, Loader2, FileType, Eye } from 'lucide-react';

interface FileItem {
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lfs?: {
    size?: number;
  };
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

export default function HomePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ name: 'Home', path: '' }]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError('Failed to load files. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'directory') {
      const newPath = file.path;
      setCurrentPath(newPath);
      
      const pathParts = newPath.split('/').filter(Boolean);
      const newBreadcrumbs: BreadcrumbItem[] = [{ name: 'Home', path: '' }];
      
      pathParts.forEach((part: string, index: number) => {
        const path = pathParts.slice(0, index + 1).join('/');
        newBreadcrumbs.push({ name: part, path });
      });
      
      setBreadcrumbs(newBreadcrumbs);
    }
  };

  const handleBreadcrumbClick = (path: string) => {
    setCurrentPath(path);
    const index = breadcrumbs.findIndex(b => b.path === path);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleFileAction = (file: FileItem) => {
    const url = `/api/download?path=${encodeURIComponent(file.path)}`;
    
    // Download file
    const link = document.createElement('a');
    link.href = url;
    link.download = file.path.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewPdf = (file: FileItem) => {
    // Get the full URL for the PDF
    const apiUrl = `${window.location.origin}/api/download?path=${encodeURIComponent(file.path)}`;
    
    // Use Google Drive PDF viewer which works great on mobile
    const viewerUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(apiUrl)}`;
    
    window.open(viewerUrl, '_blank');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileType className="w-5 h-5 text-red-500" />;
    if (ext === 'md') return <FileText className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Gate DA Resources
          </h1>
          <p className="text-slate-400">Browse your private Hugging Face dataset</p>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-slate-700">
          <div className="flex items-center gap-2 flex-wrap">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index === 0 ? (
                  <button
                    onClick={() => handleBreadcrumbClick(crumb.path)}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    <span>{crumb.name}</span>
                  </button>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                    <button
                      onClick={() => handleBreadcrumbClick(crumb.path)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {crumb.name}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Files Grid */}
        {!loading && !error && (
          <div className="grid gap-3">
            {files.map((file) => (
              <div
                key={file.path}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => handleFileClick(file)}
                  >
                    {file.type === 'directory' ? (
                      <Folder className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    ) : (
                      <div className="flex-shrink-0">
                        {getFileIcon(file.path)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {file.path.split('/').pop()}
                      </p>
                      {file.type === 'file' && (
                        <p className="text-slate-400 text-sm">
                          {formatFileSize(file.size || file.lfs?.size)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {file.type === 'file' && (
                    <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100">
                      {file.path.toLowerCase().endsWith('.pdf') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPdf(file);
                          }}
                          className="p-2 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors"
                          title="View PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileAction(file);
                        }}
                        className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && files.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No files found in this directory</p>
          </div>
        )}
      </div>
    </div>
  );
}