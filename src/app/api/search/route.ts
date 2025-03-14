// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const theme = searchParams.get('theme');
    const dept = searchParams.get('dept');
    const upload_date = searchParams.get('upload_date');

    // Log search parameters for debugging
    console.log('Search parameters:', { theme, dept, upload_date });

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    // Build the query
    let query = supabase
      .from('kaizen_reports')
      .select('*')
      .order('upload_date', { ascending: false });
    
    // Apply filters if they exist
    if (theme) {
      query = query.eq('theme', theme);
    }
    
    if (dept) {
      query = query.eq('dept', dept);
    }
    
    // If upload_date is provided, filter by date
    if (upload_date) {
      const dateStart = new Date(upload_date);
      const dateEnd = new Date(upload_date);
      dateEnd.setDate(dateEnd.getDate() + 1);
      
      // Convert to ISO strings for comparison
      const startISO = dateStart.toISOString();
      const endISO = dateEnd.toISOString();
      
      query = query.gte('upload_date', startISO).lt('upload_date', endISO);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Log the raw data for debugging
    console.log('Raw search results:', data && data.length ? data[0] : 'No results');

    // Process the results to ensure all fields are properly formatted
// In search/route.ts, modify the date formatting part:
const results = data?.map(item => {
  // Format date for display
  let formattedDate = null;
  
  if (item.upload_date) {
    try {
      // Make sure we have a valid date string first
      const dateObj = new Date(item.upload_date);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toLocaleDateString();
      } else {
        formattedDate = item.upload_date; // Keep original if parsing fails
      }
    } catch (e) {
      console.error('Date formatting error for item:', item.id, e);
      formattedDate = item.upload_date; // Fallback to original
    }
  }
  
  return {
    ...item,
    upload_date: formattedDate || 'Unknown date',
    fileName: item.file_name || item.filename || 'Unknown File',
    fileSize: item.file_size || 'Unknown size'
  };
});

    return NextResponse.json({ success: true, results: results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search files' },
      { status: 500 }
    );
  }
}