// src/app/api/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@/lib/drive';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const recordId = searchParams.get('id'); // Optional database ID as fallback

    // Log the parameters for debugging
    console.log('View request parameters:', { fileId, recordId });

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    let driveFileId = fileId;

    // If no fileId provided but we have a recordId, get fileId from database
    if (!driveFileId && recordId) {
      const { data: fileRecord, error: fileError } = await supabase
        .from('kaizen_reports')
        .select('drive_file_id')
        .eq('id', recordId)
        .single();

      if (fileError) {
        console.error('Database lookup error:', fileError);
        return NextResponse.json(
          { success: false, error: 'Record not found in database' },
          { status: 404 }
        );
      }

      driveFileId = fileRecord.drive_file_id;
    }

    // Verify we have a file ID to work with
    if (!driveFileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      );
    }

    console.log('Viewing file with ID:', driveFileId);

    // Initialize Google Drive client
    const drive = google.drive({ version: 'v3', auth });
    
    try {
      // Get the file metadata from Google Drive
      const file = await drive.files.get({
        fileId: driveFileId,
        fields: 'webViewLink'
      });

      if (!file.data || !file.data.webViewLink) {
        return NextResponse.json(
          { success: false, error: 'View link not available' },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        viewLink: file.data.webViewLink 
      });
    } catch (driveError: unknown) {
      let errorDetails = 'An unknown error occurred';
      if (driveError instanceof Error) {
        errorDetails = driveError.message;
    } else if (typeof driveError === 'object' && driveError !== null && 'response' in driveError) {
        errorDetails = String((driveError as { response?: { data?: unknown } }).response?.data || driveError);
    } else {
        errorDetails = String(driveError);
    }
    
    
  
      console.error('Google Drive error details:', errorDetails);
  
      return NextResponse.json(
          { success: false, error: 'File not found or access denied' },
          { status: 404 }
      );
  }
  
  } catch (error) {
    console.error('View link error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get view link' },
      { status: 500 }
    );
  }
}