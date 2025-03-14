import { useState } from 'react';
import type { KaizenReport } from '@/types';
import { Eye, Download, Trash2 } from 'lucide-react';

interface Props {
  files: KaizenReport[];
  onDelete?: (id: number) => void;
}

export default function FileList({ files, onDelete }: Props) {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      setLoading({ ...loading, [fileId]: true });
      // Using the correct property names from your database
      const response = await fetch(`/api/download?fileId=${fileId}&fileName=${encodeURIComponent(fileName)}`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
      return false;
    } finally {
      setLoading({ ...loading, [fileId]: false });
    }
  };


  const handleView = async (fileId: string) => {
    try {
      setLoading({ ...loading, [`view_${fileId}`]: true });
      const response = await fetch(`/api/view?fileId=${fileId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get view link');
      }

      const data = await response.json();
      if (data.success && data.viewLink) {
        window.open(data.viewLink, '_blank');
      } else {
        throw new Error('View link not available');
      }
    } catch (error) {
      console.error('View failed:', error);
      alert('Failed to view file. Please try again.');
    } finally {
      setLoading({ ...loading, [`view_${fileId}`]: false });
    }
  };

  const handleDelete = async (id: number, fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/delete?fileId=${fileId}&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      const data = await response.json();
      if (data.success) {
        onDelete?.(id);
      } else {
        throw new Error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No files found matching your search criteria
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              File Name
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Theme
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dept
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Upload Date
            </th>
            <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {file.file_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {file.theme}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {file.dept}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(file.upload_date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm flex justify-center space-x-4">
                <button
                  onClick={() => handleView(file.drive_file_id)}
                  disabled={loading[`view_${file.drive_file_id}`]}
                  className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                  title="View"
                >
                  {loading[`view_${file.drive_file_id}`] ? (
                    'Loading...'
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDownload(file.drive_file_id, file.file_name)}
                  disabled={loading[file.drive_file_id]}
                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                  title="Download"
                >
                  {loading[file.drive_file_id] ? (
                    'Loading...'
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
{/*                 <button
                  onClick={() => handleEdit(file.drive_file_id, file.file_name)}
                  disabled={loading[`edit_${file.drive_file_id}`]}
                  className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                  title="Edit"
                >
                  {loading[`edit_${file.drive_file_id}`] ? (
                    'Loading...'
                  ) : (
                    <Edit className="w-5 h-5" />
                  )}
                </button> */}
                <button
                  onClick={() => handleDelete(file.id, file.drive_file_id)}
                  disabled={deletingId === file.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === file.id ? (
                    'Deleting...'
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}