// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    // Get theme distribution using Supabase
    const { data: themeData, error: themeError } = await supabase
      .from('kaizen_reports')
      .select('theme')
      .then(({ data, error }) => {
        if (error) throw error;
        
        // Count occurrences of each theme
        const themeCounts = data.reduce((acc: Record<string, number>, item) => {
          const theme = item.theme || 'Uncategorized'; // Handle null/undefined themes
          acc[theme] = (acc[theme] || 0) + 1;
          return acc;
        }, {});
        
        // Convert to array format similar to SQL query result
        return { 
          data: Object.entries(themeCounts).map(([theme, count]) => ({ theme, count }))
            .sort((a, b) => (b.count as number) - (a.count as number)),
          error: null
        };
      });

    if (themeError) {
      throw themeError;
    }

    // Get department distribution using Supabase
    const { data: deptData, error: deptError } = await supabase
      .from('kaizen_reports')
      .select('dept')
      .then(({ data, error }) => {
        if (error) throw error;
        
        // Count occurrences of each department
        const deptCounts = data.reduce((acc: Record<string, number>, item) => {
          const dept = item.dept || 'Uncategorized'; // Handle null/undefined departments
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {});
        
        // Convert to array format similar to SQL query result
        return { 
          data: Object.entries(deptCounts).map(([dept, count]) => ({ dept, count }))
            .sort((a, b) => (b.count as number) - (a.count as number)),
          error: null
        };
      });

    if (deptError) {
      throw deptError;
    }

    return NextResponse.json({
      success: true,
      themeData,
      deptData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}