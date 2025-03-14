// Analytics.tsx
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface AnalyticsData {
  theme: string;
  dept: string;
  count: number;
}

export default function Analytics() {
  const [themeData, setThemeData] = useState<AnalyticsData[]>([]);
  const [deptData, setDeptData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        
        const data = await response.json();
        if (data.success) {
          setThemeData(data.themeData);
          setDeptData(data.deptData);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setError('Failed to load analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-slate-200 h-10 w-10"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-slate-200 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-200 rounded col-span-2"></div>
              <div className="h-2 bg-slate-200 rounded col-span-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-red-500 bg-red-50 px-4 py-3 rounded-lg shadow-sm border border-red-200">
        {error}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-sm border border-indigo-200">
          <h4 className="text-indigo-800 text-lg font-semibold mb-2">Total Reports</h4>
          <p className="text-4xl font-bold text-indigo-900">
            {themeData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-emerald-200">
          <h4 className="text-emerald-800 text-lg font-semibold mb-2">Total Themes</h4>
          <p className="text-4xl font-bold text-emerald-900">{themeData.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
          <h4 className="text-purple-800 text-lg font-semibold mb-2">Total Departments</h4>
          <p className="text-4xl font-bold text-purple-900">{deptData.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-900 text-xl font-semibold mb-6">Theme Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={themeData}
                dataKey="count"
                nameKey="theme"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {themeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.5rem'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-900 text-xl font-semibold mb-6">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptData}>
              <XAxis 
                dataKey="dept" 
                tick={{ fill: '#4B5563' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fill: '#4B5563' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.5rem'
                }}
                labelStyle={{
                  color: 'black'
                }}
              />
              <Legend />
              <Bar 
                dataKey="count"  
                fill="#8B5CF6" 
                name="Number of Reports"
                radius={[4, 4, 0, 0]}
              >
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}