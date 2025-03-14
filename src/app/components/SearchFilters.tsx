// src/app/components/SearchFilters.tsx
import { useState } from 'react';
import type { SearchFilters as SearchFiltersType } from '@/types';
import { THEMES, DEPTS } from '@/constants';
import { Search, Filter, Calendar } from 'lucide-react';

interface Props {
  onSearch: (filters: SearchFiltersType) => void;
}

export default function SearchFilters({ onSearch }: Props) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1997 + 1 }, (_, i) => 1997 + i).reverse();

  const [filters, setFilters] = useState<SearchFiltersType>({
    theme: '',
    dept: '',
    upload_date: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const activeFilters: SearchFiltersType = {};
      if (filters.theme && filters.theme !== '') activeFilters.theme = filters.theme;
      if (filters.dept && filters.dept !== '') activeFilters.dept = filters.dept;
      if (filters.upload_date && filters.upload_date !== '') activeFilters.upload_date = filters.upload_date;

      await onSearch(activeFilters);
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Filter className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">Search Filters</h3>
        </div>
        {getActiveFiltersCount() > 0 && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {getActiveFiltersCount()} active filters
          </span>
        )}
      </div>
      
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <span>Theme</span>
              {filters.theme && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  Selected
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={filters.theme || ''}
                onChange={(e) => setFilters({ ...filters, theme: e.target.value })}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-100 appearance-none"
              >
                <option value="">All Themes</option>
                {THEMES.map((theme) => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <span>Department</span>
              {filters.dept && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  Selected
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={filters.dept || ''}
                onChange={(e) => setFilters({ ...filters, dept: e.target.value })}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-100 appearance-none"
              >
                <option value="">All Departments</option>
                {DEPTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <span>Year</span>
              {filters.upload_date && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  Selected
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={filters.upload_date || ''}
                onChange={(e) => setFilters({ ...filters, upload_date: e.target.value })}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-100 appearance-none"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Searching...</span>
              </span>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Search Reports</span>
              </>
            )}
          </button>

          {getActiveFiltersCount() > 0 && (
            <button
              onClick={() => setFilters({ theme: '', dept: '', upload_date: '' })}
              className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}