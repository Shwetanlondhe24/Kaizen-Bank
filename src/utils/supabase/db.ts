import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Function to get Supabase client from server components
export async function getSupabaseClient() {
  const cookieStore = cookies();
  return createClient(cookieStore);
}

// Helper function for common database operations
export async function queryDatabase<T>(tableName: string, options: {
  select?: string | null;
  match?: Record<string, T>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
} = {}) 
 {
  const supabase = await getSupabaseClient();
  
  let query = supabase.from(tableName).select(options.select || '*');
  
  if (options.match) {
    Object.entries(options.match).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });
  }
  
  if (options.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending !== false
    });
  }
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }
  
  return query;
}