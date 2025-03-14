// src/app/components/UploadForm.tsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { THEMES, DEPTS } from '@/constants';
import { UploadCloud, XCircle, CheckCircle, FileText } from 'lucide-react';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [theme, setTheme] = useState('');
  const [dept, setDept] = useState('');
  const [period, setPeriod] = useState<Date | null>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !theme || !dept || !period) {
      setStatus('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('theme', theme);
    formData.append('dept', dept);
    formData.append('period', period.toISOString());

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setStatus(data.success ? 'Upload successful!' : data.error);
      if (data.success) {
        // Reset form after successful upload
        setFile(null);
        setTheme('');
        setDept('');
        setPeriod(null);
      }
    } catch (error) {
      setStatus('Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setStatus(''); // Clear any previous status messages
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const removeFile = () => {
    setFile(null);
    setStatus('');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="space-y-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Theme
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                          hover:bg-gray-100 appearance-none"
                required
              >
                <option value="">Select Theme</option>
                {THEMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Department Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Department
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                          hover:bg-gray-100 appearance-none"
                required
              >
                <option value="">Select Department</option>
                {DEPTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Period
              <span className="text-red-500 ml-1">*</span>
            </label>
            <DatePicker
              selected={period}
              onChange={(date: Date | null) => setPeriod(date)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                        hover:bg-gray-100"
              placeholderText="Select a date"
              required
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              dateFormat="MMMM d, yyyy"
            />
          </div>
        </div>

        {/* File Upload Zone */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            PDF File
            <span className="text-red-500 ml-1">*</span>
          </label>
          
          {!file ? (
            <div
              {...getRootProps()}
              className={`
                mt-2 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-base font-medium text-gray-700">
                    Drop your PDF file here, or click to select
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF files only (Max size: 10MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button and Status */}
        <div className="space-y-4">
          <button
            type="submit"
            disabled={isLoading || !file || !theme || !dept || !period}
            className={`
              w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${isLoading || !file || !theme || !dept || !period
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing Upload...
              </span>
            ) : (
              'Upload Report'
            )}
          </button>

          {status && (
            <div className={`
              flex items-center p-4 rounded-xl text-sm
              ${status.includes('success')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
              }
            `}>
              {status.includes('success') ? (
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 mr-2" />
              )}
              {status}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}