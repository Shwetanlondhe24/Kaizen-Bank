// src/app/page.tsx
'use client';
import './globals.css';
import { useState, useEffect } from 'react';
import UploadForm from './components/UploadForm';
import SearchFilters from './components/SearchFilters';
import FileList from './components/FileList';
import Analytics from './components/Analytics';
import { createClient } from '@/utils/supabase/client';
import type { KaizenReport, SearchFilters as SearchFiltersType } from '@/types';

export default function Home() {
  const [files, setFiles] = useState<KaizenReport[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'upload' | 'search'>('analytics');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [todos, setTodos] = useState<any[]>([]);

  // Initialize Supabase client
  const supabase = createClient();

  // Fetch todos from Supabase on component mount
  useEffect(() => {
    async function fetchTodos() {
      try {
        const { data, error } = await supabase.from('todos').select();
        if (error) {
          throw error;
        }
        if (data) {
          setTodos(data);
        }
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    }

    fetchTodos();
  }, []);

  const handleSearch = async (filters: SearchFiltersType) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.theme && filters.theme !== '') {
        queryParams.append('theme', filters.theme);
      }
      if (filters.dept && filters.dept !== '') {
        queryParams.append('dept', filters.dept);
      }
      if (filters.upload_date && filters.upload_date !== '') {
        queryParams.append('upload_date', filters.upload_date);
      }

      const response = await fetch(`/api/search?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setFiles(data.results);
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleDelete = (deletedId: number) => {
    setFiles(files.filter(file => file.id !== deletedId));
  };

  return (
    <>
      {/* Navbar */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="text-gray-800 text-2xl font-bold">Kaizen Bank</div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {['analytics','upload', 'search'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`text-gray-700 font-medium transition-all duration-300 px-4 py-2 rounded-lg ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-800 focus:outline-none"
              >
                <svg
                  className="w-8 h-8"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white shadow-md rounded-lg">
            <div className="flex flex-col py-3">
              {['analytics', 'upload', 'search'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as typeof activeTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-6 py-3 text-lg font-medium text-center ${
                    activeTab === tab
                      ? 'text-blue-600 bg-gray-100'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-100 py-12 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          {/* Todos from Supabase */}
          {todos.length > 0 && (
            <section className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Todos from Supabase</h2>
              <ul className="list-disc pl-6">
                {todos.map((todo, index) => (
                  <li key={index} className="mb-2">{JSON.stringify(todo)}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Dynamic Page Content */}
          {activeTab === 'analytics' && (
            <section className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analytics Dashboard</h2>
              <Analytics />
            </section>
          )}

          {activeTab === 'upload' && (
            <section className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Reports</h2>
              <UploadForm />
            </section>
          )}

          {activeTab === 'search' && (
            <section className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Search Reports</h2>
              <SearchFilters onSearch={handleSearch} />
              <FileList files={files} onDelete={handleDelete} />
            </section>
          )}
        </div>
      </main>
    </>
  );
}