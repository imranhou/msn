import React, { useState } from 'react';
import api from '../services/api.service';

interface FileUploadProps {
  onUploadSuccess: (data: any) => void;
  onUploadError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      onUploadError('Please select a file to upload');
      return;
    }

    // Check if file is Excel
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      onUploadError('Only Excel files are allowed');
      return;
    }

    setUploading(true);

    try {
      const result = await api.fileUpload.uploadDeals(file);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      onUploadSuccess(result.data);
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Upload Deal Spreadsheet</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="file-upload" className="mb-2 font-medium text-gray-700 text-sm sm:text-base">
            Select Excel File
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="border border-gray-300 p-3 sm:p-2 rounded-md text-base sm:text-sm"
            disabled={uploading}
          />
        </div>
        <div className="text-sm text-gray-500">
          {file ? `Selected file: ${file.name}` : 'No file selected'}
        </div>
        <button
          type="submit"
          disabled={!file || uploading}
          className={`px-4 py-3 sm:py-2 rounded-md text-white text-base sm:text-sm w-full sm:w-auto ${
            !file || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
